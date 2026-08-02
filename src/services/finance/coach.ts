import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/finance/dates";
import { getBalancesByScope } from "@/services/finance/accounts";
import { getOccurrencesInRange } from "@/services/finance/forecast";
import { getSettings } from "@/services/finance/settings";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const UPCOMING_WINDOW_DAYS = 30;

type MatchCandidate = { amount: number; date: Date };

/** Fetches every transaction that could plausibly match an "already handled" check in one
 * query, instead of one query per recurring item — same batching as advice.ts's
 * loadPaidCandidates, kept local to avoid coupling this module to advice.ts's internals. */
async function loadMatchCandidates(): Promise<MatchCandidate[]> {
  const since = new Date(Date.now() - 15 * MS_PER_DAY);
  const rows = await prisma.transaction.findMany({
    where: { date: { gte: since } },
    select: { amount: true, date: true },
  });
  return rows.map((r) => ({ amount: Number(r.amount), date: r.date }));
}

/** Same loose amount+date matching as the advice engine's "already paid" check. Works for both
 * directions: pass a negative signedAmount to check for an already-paid expense, positive to
 * check for an already-received income (e.g. a pension already credited this cycle). */
function hasMatchingTransaction(candidates: MatchCandidate[], signedAmount: number, occurrence: Date): boolean {
  const windowStart = new Date(occurrence.getTime() - 10 * MS_PER_DAY);
  const windowEnd = new Date(occurrence.getTime() + 10 * MS_PER_DAY);
  const tolerance = Math.max(Math.abs(signedAmount) * 0.03, 1);
  return candidates.some(
    (c) =>
      c.date >= windowStart &&
      c.date <= windowEnd &&
      c.amount >= signedAmount - tolerance &&
      c.amount <= signedAmount + tolerance
  );
}

export type SimpleSummary = {
  available: number;
  upcomingCommitted: number;
  upcomingIncome: number;
  safeToSpend: number;
  upcomingItems: { label: string; amount: number; date: string }[];
  upcomingIncomeItems: { label: string; amount: number; date: string }[];
};

/** Plain-language money summary: what's in the accounts, what's already spoken for by
 * upcoming bills in the next 30 days, what's expected to come in over the same window
 * (recurring income like a pension or salary), and what's genuinely free to spend. */
export async function getSimpleSummary(): Promise<SimpleSummary> {
  const [{ combined: available }, items, candidates] = await Promise.all([
    getBalancesByScope(),
    prisma.recurringItem.findMany({ where: { isActive: true, autoGenerate: true } }),
    loadMatchCandidates(),
  ]);
  const today = startOfDay(new Date());
  const windowEnd = new Date(today.getTime() + UPCOMING_WINDOW_DAYS * MS_PER_DAY);

  const upcomingItems: { label: string; amount: number; date: string }[] = [];
  const upcomingIncomeItems: { label: string; amount: number; date: string }[] = [];
  for (const item of items) {
    const [next] = getOccurrencesInRange(item, today, windowEnd);
    if (!next) continue;
    const amount = Number(item.amount);
    const signed = item.direction === "expense" ? -amount : amount;
    if (hasMatchingTransaction(candidates, signed, next)) continue;
    if (item.direction === "expense") {
      upcomingItems.push({ label: item.label, amount, date: next.toISOString() });
    } else {
      upcomingIncomeItems.push({ label: item.label, amount, date: next.toISOString() });
    }
  }
  upcomingItems.sort((a, b) => a.date.localeCompare(b.date));
  upcomingIncomeItems.sort((a, b) => a.date.localeCompare(b.date));

  const upcomingCommitted = upcomingItems.reduce((sum, i) => sum + i.amount, 0);
  const upcomingIncome = upcomingIncomeItems.reduce((sum, i) => sum + i.amount, 0);
  return {
    available,
    upcomingCommitted,
    upcomingIncome,
    safeToSpend: available + upcomingIncome - upcomingCommitted,
    upcomingItems,
    upcomingIncomeItems,
  };
}

export type BestTransferDay = { day: number; gapDays: number; afterLabel: string; beforeLabel: string };

/**
 * Finds the day of the month with the longest gap before the next recurring expense — the
 * safest window each month to move money around (savings, virements) without a debit landing
 * right after. Days are treated on a 28-day wheel (safe lower bound for every month) since we
 * only care about relative spacing, not exact calendar length.
 */
export async function getBestTransferDay(): Promise<BestTransferDay | null> {
  const items = await prisma.recurringItem.findMany({
    where: { isActive: true, autoGenerate: true, direction: "expense", dayOfMonth: { not: null } },
  });
  if (items.length === 0) return null;

  const byDay = new Map<number, string[]>();
  for (const item of items) {
    const day = item.dayOfMonth!;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(item.label);
  }
  const days = Array.from(byDay.keys()).sort((a, b) => a - b);
  if (days.length === 0) return null;

  let bestIndex = 0;
  let bestGap = -1;
  for (let i = 0; i < days.length; i++) {
    const current = days[i];
    const next = days[(i + 1) % days.length];
    const gap = next > current ? next - current : 28 - current + next;
    if (gap > bestGap) {
      bestGap = gap;
      bestIndex = i;
    }
  }

  const afterDay = days[bestIndex];
  const beforeDay = days[(bestIndex + 1) % days.length];
  return {
    day: (afterDay % 28) + 1,
    gapDays: bestGap,
    afterLabel: byDay.get(afterDay)!.join(", "),
    beforeLabel: byDay.get(beforeDay)!.join(", "),
  };
}

const OCCURRENCES_PER_YEAR: Record<string, number> = { monthly: 12, quarterly: 4, annual: 1, weekly: 52 };

function monthlyAmount(item: { amount: unknown; frequency: string; intervalDays: number | null }): number {
  const perYear =
    item.frequency === "custom_days" && item.intervalDays
      ? 365 / item.intervalDays
      : (OCCURRENCES_PER_YEAR[item.frequency] ?? 12);
  return (Number(item.amount) * perYear) / 12;
}

export type RevenueTarget = {
  monthlyExpenses: number;
  monthlyOtherIncome: number;
  monthlySavingsNeeded: number | null;
  monthsUntilGoal: number | null;
  monthlyNetNeeded: number;
  monthlyRevenueTarget: number;
  urssafRatePct: number;
};

/**
 * Reverse-engineers a target monthly revenue (chiffre d'affaires) from the cost side: recurring
 * expenses (excluding URSSAF itself, since URSSAF scales with whatever revenue is actually
 * generated rather than being a fixed cost) plus whatever's needed to hit the savings goal by
 * its target date, minus other recurring income (e.g. a pension) that already covers part of
 * it — then grossed back up by the URSSAF rate to get the revenue figure before that cut.
 */
export async function getRevenueTarget(): Promise<RevenueTarget> {
  const settings = await getSettings();
  const items = await prisma.recurringItem.findMany({ where: { isActive: true, autoGenerate: true } });

  let monthlyExpenses = 0;
  let monthlyOtherIncome = 0;
  for (const item of items) {
    if (item.direction === "expense") {
      if (item.label.toLowerCase().includes("urssaf")) continue;
      monthlyExpenses += monthlyAmount(item);
    } else {
      monthlyOtherIncome += monthlyAmount(item);
    }
  }

  let monthlySavingsNeeded: number | null = null;
  let monthsUntilGoal: number | null = null;
  if (settings.savingsGoalAmount != null && settings.savingsGoalTargetDate) {
    const today = startOfDay(new Date());
    const target = startOfDay(new Date(settings.savingsGoalTargetDate));
    monthsUntilGoal = Math.max(
      1,
      Math.round((target.getTime() - today.getTime()) / (30.44 * MS_PER_DAY))
    );
    // The dashboard tracks progress toward the goal as the combined account balance (see
    // finance/page.tsx's goalProgress bar), so what's still needed is the goal minus what's
    // already there — not the full goal amount divided by months, which ignored any progress
    // already made and kept demanding the full pace even once the goal was mostly (or fully) hit.
    const { combined } = await getBalancesByScope();
    const remainingToSave = Math.max(0, Number(settings.savingsGoalAmount) - combined);
    monthlySavingsNeeded = remainingToSave / monthsUntilGoal;
  }

  const monthlyNetNeeded = monthlyExpenses + (monthlySavingsNeeded ?? 0) - monthlyOtherIncome;
  const urssafRatePct = Number(settings.urssafRatePct);
  const monthlyRevenueTarget = Math.max(0, monthlyNetNeeded) / (1 - urssafRatePct / 100);

  return {
    monthlyExpenses,
    monthlyOtherIncome,
    monthlySavingsNeeded,
    monthsUntilGoal,
    monthlyNetNeeded,
    monthlyRevenueTarget,
    urssafRatePct,
  };
}
