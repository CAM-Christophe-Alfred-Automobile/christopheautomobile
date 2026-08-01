import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/finance/dates";
import { computeForecast, getOccurrencesInRange } from "@/services/finance/forecast";
import type { RecurringItem } from "@/generated/prisma";

const UPCOMING_DEBIT_WINDOW_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

type AdviceDraft = {
  ruleKey: string;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  scope: "PRO" | "PERSO" | null;
  relatedAccountId: string | null;
  relatedCategoryId: string | null;
};

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

function findNextPoint(points: Awaited<ReturnType<typeof computeForecast>>["points"], targetDate: Date) {
  const targetKey = startOfDay(targetDate).toISOString();
  return points.find((p) => p.date >= targetKey) ?? points[points.length - 1];
}

async function ruleStaleBalance(
  accounts: Awaited<ReturnType<typeof prisma.account.findMany>>
): Promise<AdviceDraft[]> {
  const today = startOfDay(new Date());
  const drafts: AdviceDraft[] = [];

  for (const account of accounts) {
    const age = daysBetween(startOfDay(account.balanceAsOf), today);
    if (age > 14) {
      drafts.push({
        ruleKey: "stale_balance",
        severity: "info",
        title: `Solde "${account.name}" à réconcilier`,
        detail: `Ce solde n'a pas été réconcilié depuis ${age} jours. Les prévisions perdent en fiabilité — vérifiez et mettez à jour le solde réel.`,
        scope: account.scope as "PRO" | "PERSO",
        relatedAccountId: account.id,
        relatedCategoryId: null,
      });
    }
  }
  return drafts;
}

async function ruleLowBalanceForecast(
  forecast: Awaited<ReturnType<typeof computeForecast>>
): Promise<AdviceDraft[]> {
  if (!forecast.firstShortfallDate) return [];
  const { scope, date } = forecast.firstShortfallDate;
  const daysAway = daysBetween(new Date(), new Date(date));
  const severity = daysAway <= 7 ? "critical" : daysAway <= 30 ? "warning" : "info";

  return [
    {
      ruleKey: "low_balance_forecast",
      severity,
      title: `Risque de découvert ${scope === "PRO" ? "Pro" : "Perso"}`,
      detail: `Votre solde ${scope === "PRO" ? "Pro" : "Perso"} devrait passer sous votre seuil d'alerte autour du ${new Intl.DateTimeFormat("fr-FR").format(new Date(date))}.`,
      scope,
      relatedAccountId: null,
      relatedCategoryId: null,
    },
  ];
}

async function ruleUpcomingRecurringShortfall(
  forecast: Awaited<ReturnType<typeof computeForecast>>,
  candidates: PaidCandidate[],
  settings: Awaited<ReturnType<typeof prisma.financeSettings.findFirstOrThrow>>,
  allActiveItems: RecurringItem[]
): Promise<AdviceDraft[]> {
  const items = allActiveItems.filter((r) => r.autoGenerate && r.direction === "expense");
  const drafts: AdviceDraft[] = [];
  const today = startOfDay(new Date());
  const horizonLimit = new Date(Date.now() + 30 * MS_PER_DAY);
  const todayPoint = forecast.points[0];

  for (const item of items) {
    const [nextOccurrence] = getOccurrencesInRange(item, today, horizonLimit);
    if (!nextOccurrence) continue;
    if (isAlreadyPaid(candidates, Number(item.amount), nextOccurrence)) continue;

    const point = forecast.points.find((p) => new Date(p.date) >= nextOccurrence) ?? forecast.points[forecast.points.length - 1];
    if (!point || !todayPoint) continue;
    const dueDate = nextOccurrence;

    const projectedBalance = item.scope === "PRO" ? point.proBalance : point.persoBalance;
    const currentBalance = item.scope === "PRO" ? todayPoint.proBalance : todayPoint.persoBalance;
    const threshold =
      item.scope === "PRO" ? Number(settings.lowBalanceThresholdPro) : Number(settings.lowBalanceThresholdPerso);

    // Only blame this specific item when it would newly push the account under threshold —
    // if the account is already below threshold today, every future expense would trivially
    // "keep" it there, which floods the list with one misleading alert per subscription instead
    // of the single general warning already covered by ruleLowBalanceForecast.
    if (currentBalance >= threshold && projectedBalance < threshold) {
      drafts.push({
        // ruleKey embeds the item id: recomputeAdvice() dedupes drafts by (ruleKey, account,
        // category), and several recurring items can share the same account+category (e.g.
        // multiple "Crédit conso" debits on the joint account), which would otherwise collide
        // into a single slot and either overwrite each other or spawn undeleted duplicate rows.
        ruleKey: `upcoming_recurring_shortfall:${item.id}`,
        severity: "warning",
        title: `"${item.label}" risque de mettre le compte à découvert`,
        detail: `Le compte ${item.scope} serait sous votre seuil d'alerte (${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(threshold)}) autour du ${new Intl.DateTimeFormat("fr-FR").format(dueDate)}, notamment à cause de "${item.label}" (${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(item.amount))}).`,
        scope: item.scope as "PRO" | "PERSO",
        relatedAccountId: item.accountId,
        relatedCategoryId: item.categoryId,
      });
    }
  }
  return drafts;
}

/** Heads-up for any recurring debit due within the next few days, independent of whether it would cause a shortfall (see ruleUpcomingRecurringShortfall for that). */
const ALREADY_PAID_WINDOW_DAYS = 10;
const ALREADY_PAID_AMOUNT_TOLERANCE = 0.03; // 3% — real direct debits vary slightly (fees, FX, etc.)

type PaidCandidate = { amount: number; date: Date };

/** Fetches every transaction that could plausibly match an "already paid" check across all the
 * rules below in one query, instead of each rule (and each recurring item within each rule)
 * hitting the DB separately. Real future-dated transactions don't occur in this app, so a window
 * reaching back ALREADY_PAID_WINDOW_DAYS plus slack covers every case that could actually match. */
async function loadPaidCandidates(): Promise<PaidCandidate[]> {
  const since = new Date(Date.now() - (ALREADY_PAID_WINDOW_DAYS + 5) * MS_PER_DAY);
  const rows = await prisma.transaction.findMany({
    where: { date: { gte: since } },
    select: { amount: true, date: true },
  });
  return rows.map((r) => ({ amount: Number(r.amount), date: r.date }));
}

/**
 * Real payments for a recurring item don't always land on the exact expected day or the
 * exact account (observed: same insurer debited from a different account across quarters) —
 * so "already paid" is matched loosely by amount + date proximity, across all accounts,
 * rather than requiring an exact account/date match.
 */
function isAlreadyPaid(candidates: PaidCandidate[], amount: number, occurrence: Date): boolean {
  const windowStart = new Date(occurrence.getTime() - ALREADY_PAID_WINDOW_DAYS * MS_PER_DAY);
  const windowEnd = new Date(occurrence.getTime() + ALREADY_PAID_WINDOW_DAYS * MS_PER_DAY);
  const target = -Math.abs(amount);
  const tolerance = Math.max(Math.abs(target) * ALREADY_PAID_AMOUNT_TOLERANCE, 1);

  return candidates.some(
    (c) =>
      c.date >= windowStart &&
      c.date <= windowEnd &&
      c.amount >= target - tolerance &&
      c.amount <= target + tolerance
  );
}

async function ruleUpcomingRecurringDebit(
  candidates: PaidCandidate[],
  allActiveItems: RecurringItem[]
): Promise<AdviceDraft[]> {
  const items = allActiveItems.filter((r) => r.autoGenerate && r.direction === "expense");
  const today = startOfDay(new Date());
  const windowEnd = new Date(today.getTime() + UPCOMING_DEBIT_WINDOW_DAYS * MS_PER_DAY);
  const drafts: AdviceDraft[] = [];

  for (const item of items) {
    const [nextOccurrence] = getOccurrencesInRange(item, today, windowEnd);
    if (!nextOccurrence) continue;
    if (isAlreadyPaid(candidates, Number(item.amount), nextOccurrence)) continue;

    drafts.push({
      ruleKey: `upcoming_recurring_debit:${item.id}`,
      severity: "info",
      title: `Prélèvement à venir : "${item.label}"`,
      detail: `${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(item.amount))} sera prélevé le ${new Intl.DateTimeFormat("fr-FR").format(nextOccurrence)} sur le compte ${item.scope === "PRO" ? "Pro" : "Perso"}.`,
      scope: item.scope as "PRO" | "PERSO",
      relatedAccountId: item.accountId,
      relatedCategoryId: item.categoryId,
    });
  }
  return drafts;
}

async function ruleCategoryOverspend(): Promise<AdviceDraft[]> {
  const categories = await prisma.category.findMany({ where: { monthlyBudget: { not: null } } });
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const dayOfMonth = now.getUTCDate();
  const drafts: AdviceDraft[] = [];
  if (categories.length === 0) return drafts;

  const spendByCategory = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      categoryId: { in: categories.map((c) => c.id) },
      date: { gte: monthStart },
      isTransfer: false,
      amount: { lt: 0 },
    },
    _sum: { amount: true },
  });
  const spendMap = new Map(spendByCategory.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)]));

  for (const category of categories) {
    const spent = Math.abs(spendMap.get(category.id) ?? 0);
    const budget = Number(category.monthlyBudget);
    const projectedEndOfMonth = (spent / Math.max(dayOfMonth, 1)) * daysInMonth;

    if (projectedEndOfMonth > budget * 1.05) {
      drafts.push({
        ruleKey: "category_overspend",
        severity: projectedEndOfMonth > budget * 1.3 ? "warning" : "info",
        title: `Budget "${category.name}" en dépassement`,
        detail: `Au rythme actuel (${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(spent)} dépensés ce mois-ci), vous devriez finir le mois autour de ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(projectedEndOfMonth)}, au-delà du budget de ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(budget)}.`,
        scope: category.scope === "BOTH" ? null : (category.scope as "PRO" | "PERSO"),
        relatedAccountId: null,
        relatedCategoryId: category.id,
      });
    }
  }
  return drafts;
}

async function ruleProPersoImbalance(
  forecast: Awaited<ReturnType<typeof computeForecast>>,
  settings: Awaited<ReturnType<typeof prisma.financeSettings.findFirstOrThrow>>
): Promise<AdviceDraft[]> {
  const todayPoint = forecast.points[0];
  const pro = todayPoint?.proBalance ?? 0;
  const perso = todayPoint?.persoBalance ?? 0;
  const proThreshold = Number(settings.lowBalanceThresholdPro);
  const persoThreshold = Number(settings.lowBalanceThresholdPerso);

  if (pro < proThreshold && perso > persoThreshold * 3) {
    return [
      {
        ruleKey: "pro_perso_imbalance",
        severity: "info",
        title: "Trésorerie déséquilibrée entre Pro et Perso",
        detail: `Le compte Pro est proche du seuil d'alerte tandis que le compte Perso a un solde confortable. Vérifiez que vous mettez bien assez d'argent de côté côté pro avant de transférer vers le perso.`,
        scope: null,
        relatedAccountId: null,
        relatedCategoryId: null,
      },
    ];
  }
  return [];
}

async function ruleUrssafShortfall(
  forecast: Awaited<ReturnType<typeof computeForecast>>,
  candidates: PaidCandidate[],
  allActiveItems: RecurringItem[]
): Promise<AdviceDraft[]> {
  const urssafItems = allActiveItems.filter((r) => r.label.includes("URSSAF"));
  const drafts: AdviceDraft[] = [];
  const today = startOfDay(new Date());
  const horizonLimit = new Date(Date.now() + 90 * MS_PER_DAY);

  for (const item of urssafItems) {
    const [nextOccurrence] = getOccurrencesInRange(item, today, horizonLimit);
    if (!nextOccurrence) continue;
    if (isAlreadyPaid(candidates, Number(item.amount), nextOccurrence)) continue;

    const point = findNextPoint(forecast.points, nextOccurrence);
    const projectedPro = point.proBalance;
    if (projectedPro < Number(item.amount)) {
      drafts.push({
        ruleKey: `urssaf_shortfall:${item.id}`,
        severity: "critical",
        title: "Solde Pro insuffisant pour l'URSSAF",
        detail: `Le solde Pro projeté (${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(projectedPro)}) ne couvrirait pas la prochaine échéance URSSAF de ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(item.amount))}. Réduisez les dépenses pro ou mettez de l'argent de côté avant l'échéance.`,
        scope: "PRO",
        relatedAccountId: item.accountId,
        relatedCategoryId: item.categoryId,
      });
    }
  }
  return drafts;
}

async function ruleUrssafSavingsRate(
  settings: Awaited<ReturnType<typeof prisma.financeSettings.findFirstOrThrow>>,
  allActiveItems: RecurringItem[]
): Promise<AdviceDraft[]> {
  const urssafItem = allActiveItems.find((r) => r.label.includes("URSSAF"));
  if (!urssafItem) return [];

  const periodDays = urssafItem.frequency === "monthly" ? 30 : urssafItem.frequency === "quarterly" ? 90 : 365;
  const periodStart = new Date(Date.now() - periodDays * MS_PER_DAY);

  const income = await prisma.transaction.aggregate({
    where: { scope: "PRO", isTransfer: false, amount: { gt: 0 }, date: { gte: periodStart } },
    _sum: { amount: true },
  });
  const totalIncome = Number(income._sum.amount ?? 0);
  if (totalIncome <= 0) return [];

  const expectedUrssaf = totalIncome * (Number(settings.urssafRatePct) / 100);
  const configuredAmount = Number(urssafItem.amount);

  if (configuredAmount < expectedUrssaf * 0.85) {
    return [
      {
        ruleKey: "urssaf_savings_rate_suggestion",
        severity: "info",
        title: "Montant URSSAF possiblement sous-estimé",
        detail: `Avec ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(totalIncome)} de revenus pro récents et un taux de ${Number(settings.urssafRatePct)}%, l'échéance attendue serait plutôt autour de ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(expectedUrssaf)} contre ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(configuredAmount)} configuré. Vérifiez le montant de votre récurrent URSSAF.`,
        scope: "PRO",
        relatedAccountId: urssafItem.accountId,
        relatedCategoryId: urssafItem.categoryId,
      },
    ];
  }
  return [];
}

async function ruleBankConnectionExpired(): Promise<AdviceDraft[]> {
  const connections = await prisma.bankConnection.findMany({ include: { account: true } });
  const now = new Date();

  return connections
    .filter((c) => c.status !== "active" || c.consentValidUntil < now)
    .map((c) => ({
      ruleKey: "bank_connection_expired",
      severity: "warning" as const,
      title: `Connexion bancaire "${c.aspspName}" à reconnecter`,
      detail: `L'accès à ${c.account.name} via ${c.aspspName} a expiré ou a été révoqué. Reconnectez ce compte (page Comptes) pour reprendre la synchronisation automatique.`,
      scope: c.account.scope as "PRO" | "PERSO",
      relatedAccountId: c.accountId,
      relatedCategoryId: null,
    }));
}

export async function recomputeAdvice(): Promise<void> {
  const settings = await prisma.financeSettings.findFirstOrThrow();
  const [accounts, allActiveItems, candidates] = await Promise.all([
    prisma.account.findMany({ where: { isArchived: false } }),
    prisma.recurringItem.findMany({ where: { isActive: true } }),
    loadPaidCandidates(),
  ]);
  const forecast = await computeForecast(settings.forecastHorizonDays, settings, accounts, allActiveItems);

  const drafts = (
    await Promise.all([
      ruleStaleBalance(accounts),
      ruleLowBalanceForecast(forecast),
      ruleUpcomingRecurringShortfall(forecast, candidates, settings, allActiveItems),
      ruleUpcomingRecurringDebit(candidates, allActiveItems),
      ruleCategoryOverspend(),
      ruleProPersoImbalance(forecast, settings),
      ruleUrssafShortfall(forecast, candidates, allActiveItems),
      ruleUrssafSavingsRate(settings, allActiveItems),
      ruleBankConnectionExpired(),
    ])
  ).flat();

  const existing = await prisma.advice.findMany();

  function identityKey(d: { ruleKey: string; relatedAccountId: string | null; relatedCategoryId: string | null }) {
    return `${d.ruleKey}|${d.relatedAccountId ?? ""}|${d.relatedCategoryId ?? ""}`;
  }

  const existingByKey = new Map(existing.map((e) => [identityKey(e), e]));
  const draftKeys = new Set(drafts.map(identityKey));

  await prisma.$transaction([
    ...existing
      .filter((e) => !draftKeys.has(identityKey(e)))
      .map((e) => prisma.advice.delete({ where: { id: e.id } })),
    ...drafts.map((draft) => {
      const match = existingByKey.get(identityKey(draft));
      if (match) {
        return prisma.advice.update({
          where: { id: match.id },
          data: { severity: draft.severity, title: draft.title, detail: draft.detail },
        });
      }
      return prisma.advice.create({ data: draft });
    }),
  ]);
}

const SEVERITY_RANK: Record<string, number> = { critical: 0, warning: 1, info: 2 };

export async function listAdvice() {
  const items = await prisma.advice.findMany({
    where: { dismissedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return items.sort((a, b) => (SEVERITY_RANK[a.severity] ?? 3) - (SEVERITY_RANK[b.severity] ?? 3));
}

export async function dismissAdvice(id: string) {
  await prisma.advice.update({ where: { id }, data: { dismissedAt: new Date() } });
}
