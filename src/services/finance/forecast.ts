import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/finance/dates";
import { getAllCurrentBalances } from "@/services/finance/accounts";
import type { RecurringItem } from "@/generated/prisma";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const STATS_LOOKBACK_MONTHS = 3;
const STATS_BAND_RATIO = 0.25;
const ESTIMATE_BAND_RATIO = 0.2;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

function clampDayOfMonth(year: number, month: number, day: number): Date {
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, lastDayOfMonth)));
}

/** Generates all due dates for a recurring item within [rangeStart, rangeEnd] (inclusive). */
export function getOccurrencesInRange(item: RecurringItem, rangeStart: Date, rangeEnd: Date): Date[] {
  const occurrences: Date[] = [];
  const start = new Date(item.startDate);
  const end = item.endDate ? new Date(item.endDate) : null;
  const effectiveEnd = end && end < rangeEnd ? end : rangeEnd;
  if (effectiveEnd < rangeStart || start > effectiveEnd) return occurrences;

  if (item.frequency === "monthly" || item.frequency === "quarterly") {
    const stepMonths = item.frequency === "monthly" ? 1 : 3;
    const day = item.dayOfMonth ?? start.getUTCDate();
    let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    while (cursor <= effectiveEnd) {
      const occurrence = clampDayOfMonth(cursor.getUTCFullYear(), cursor.getUTCMonth(), day);
      if (occurrence >= rangeStart && occurrence >= start && occurrence <= effectiveEnd) {
        occurrences.push(occurrence);
      }
      cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + stepMonths, 1));
    }
  } else if (item.frequency === "annual") {
    let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    while (cursor <= effectiveEnd) {
      if (cursor >= rangeStart && cursor >= start) occurrences.push(cursor);
      cursor = new Date(Date.UTC(cursor.getUTCFullYear() + 1, cursor.getUTCMonth(), cursor.getUTCDate()));
    }
  } else if (item.frequency === "weekly" || item.frequency === "custom_days") {
    const step = item.frequency === "weekly" ? 7 : Math.max(1, item.intervalDays ?? 30);
    let cursor = new Date(start);
    while (cursor <= effectiveEnd) {
      if (cursor >= rangeStart) occurrences.push(cursor);
      cursor = addDays(cursor, step);
    }
  }

  return occurrences;
}

type DailyPoint = {
  date: string;
  proBalance: number;
  persoBalance: number;
  combinedBalance: number;
  proBalanceLow: number;
  proBalanceHigh: number;
  persoBalanceLow: number;
  persoBalanceHigh: number;
};

export type ForecastResult = {
  points: DailyPoint[];
  firstShortfallDate: { scope: "PRO" | "PERSO"; date: string } | null;
};

export async function computeForecast(
  horizonDays: number,
  preloadedSettings?: Awaited<ReturnType<typeof prisma.financeSettings.findFirstOrThrow>>,
  preloadedAccounts?: Awaited<ReturnType<typeof prisma.account.findMany>>,
  preloadedActiveRecurringItems?: RecurringItem[]
): Promise<ForecastResult> {
  const settings = preloadedSettings ?? (await prisma.financeSettings.findFirstOrThrow());
  const accounts = preloadedAccounts ?? (await prisma.account.findMany({ where: { isArchived: false } }));

  let startPro = 0;
  let startPerso = 0;
  const balanceByAccountId = await getAllCurrentBalances(accounts);
  for (const account of accounts) {
    const balance = balanceByAccountId.get(account.id) ?? 0;
    if (account.scope === "PRO") startPro += balance;
    else startPerso += balance;
  }

  const today = startOfDay(new Date());
  const horizonEnd = addDays(today, horizonDays);

  const allActiveItems =
    preloadedActiveRecurringItems ?? (await prisma.recurringItem.findMany({ where: { isActive: true } }));
  const recurringItems = allActiveItems.filter((r) => r.autoGenerate);

  const coveredCategoryIds = new Set(recurringItems.map((r) => r.categoryId).filter(Boolean) as string[]);

  const lookbackStart = addDays(today, -30 * STATS_LOOKBACK_MONTHS);
  const pastTransactions = await prisma.transaction.findMany({
    where: {
      date: { gte: lookbackStart, lt: today },
      isTransfer: false,
      categoryId: { notIn: Array.from(coveredCategoryIds) },
    },
    select: { amount: true, scope: true },
  });

  const statsDailyFlow = { PRO: 0, PERSO: 0 };
  for (const tx of pastTransactions) {
    const scope = tx.scope as "PRO" | "PERSO";
    statsDailyFlow[scope] += Number(tx.amount) / (30 * STATS_LOOKBACK_MONTHS);
  }

  // Pre-index recurring occurrences by day for O(1) lookup while walking the horizon.
  const occurrencesByDay = new Map<string, { item: RecurringItem; signedAmount: number }[]>();
  for (const item of recurringItems) {
    const occurrences = getOccurrencesInRange(item, today, horizonEnd);
    const signedAmount = item.direction === "expense" ? -Number(item.amount) : Number(item.amount);
    for (const occurrence of occurrences) {
      const key = occurrence.toISOString();
      const list = occurrencesByDay.get(key) ?? [];
      list.push({ item, signedAmount });
      occurrencesByDay.set(key, list);
    }
  }

  const points: DailyPoint[] = [];
  let proBalance = startPro;
  let persoBalance = startPerso;
  let proLow = startPro;
  let proHigh = startPro;
  let persoLow = startPerso;
  let persoHigh = startPerso;

  let firstShortfall: { scope: "PRO" | "PERSO"; date: string } | null = null;

  for (let day = 0; day <= horizonDays; day++) {
    const date = addDays(today, day);
    const key = date.toISOString();

    proBalance += statsDailyFlow.PRO;
    persoBalance += statsDailyFlow.PERSO;
    proLow += statsDailyFlow.PRO * (1 - STATS_BAND_RATIO);
    proHigh += statsDailyFlow.PRO * (1 + STATS_BAND_RATIO);
    persoLow += statsDailyFlow.PERSO * (1 - STATS_BAND_RATIO);
    persoHigh += statsDailyFlow.PERSO * (1 + STATS_BAND_RATIO);

    for (const { item, signedAmount } of occurrencesByDay.get(key) ?? []) {
      const band = item.amountIsEstimate ? Math.abs(signedAmount) * ESTIMATE_BAND_RATIO : 0;
      if (item.scope === "PRO") {
        proBalance += signedAmount;
        proLow += signedAmount - band;
        proHigh += signedAmount + band;
      } else {
        persoBalance += signedAmount;
        persoLow += signedAmount - band;
        persoHigh += signedAmount + band;
      }
    }

    if (!firstShortfall && proBalance < Number(settings.lowBalanceThresholdPro)) {
      firstShortfall = { scope: "PRO", date: key };
    }
    if (!firstShortfall && persoBalance < Number(settings.lowBalanceThresholdPerso)) {
      firstShortfall = { scope: "PERSO", date: key };
    }

    points.push({
      date: key,
      proBalance,
      persoBalance,
      combinedBalance: proBalance + persoBalance,
      proBalanceLow: proLow,
      proBalanceHigh: proHigh,
      persoBalanceLow: persoLow,
      persoBalanceHigh: persoHigh,
    });
  }

  return { points, firstShortfallDate: firstShortfall };
}
