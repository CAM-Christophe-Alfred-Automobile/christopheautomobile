import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/finance/dates";

export function listAccounts(includeArchived = false) {
  return prisma.account.findMany({
    where: includeArchived ? {} : { isArchived: false },
    orderBy: [{ scope: "asc" }, { name: "asc" }],
    include: { bankConnection: true },
  });
}

export function getAccount(id: string) {
  return prisma.account.findUnique({ where: { id } });
}

export function createAccount(data: {
  name: string;
  type: string;
  scope: "PRO" | "PERSO";
  currentBalance: number;
}) {
  return prisma.account.create({ data: { ...data, balanceAsOf: startOfDay(new Date()) } });
}

export function reconcileBalance(id: string, balance: number) {
  return prisma.account.update({
    where: { id },
    data: { currentBalance: balance, balanceAsOf: startOfDay(new Date()) },
  });
}

export function updateAccount(
  id: string,
  data: Partial<{ name: string; type: string; isArchived: boolean }>
) {
  return prisma.account.update({ where: { id }, data });
}

/**
 * Real-time balance = anchor balance + sum of transactions dated on/after the anchor day.
 * balanceAsOf is always normalized to a day boundary (see startOfDay), matching the
 * date-only granularity of Transaction.date, so same-day entries are never silently dropped.
 */
export async function getCurrentBalance(accountId: string): Promise<number> {
  const account = await prisma.account.findUniqueOrThrow({ where: { id: accountId } });
  const laterTx = await prisma.transaction.aggregate({
    where: { accountId, date: { gte: account.balanceAsOf } },
    _sum: { amount: true },
  });
  return Number(account.currentBalance) + Number(laterTx._sum.amount ?? 0);
}

/**
 * Balances for every account in 2 queries total instead of 2*N — fetches every account once,
 * then every transaction that could matter (dated on/after the earliest anchor across all
 * accounts) in a single query, and sums per-account in memory. Each account's own balanceAsOf
 * still gates which of those transactions count for it, so results match getCurrentBalance
 * exactly; this only batches the round trips.
 */
export async function getAllCurrentBalances(
  accounts?: { id: string; balanceAsOf: Date; currentBalance: number | string | { toString(): string } }[]
): Promise<Map<string, number>> {
  const resolvedAccounts = accounts ?? (await listAccounts());
  const balances = new Map<string, number>();
  if (resolvedAccounts.length === 0) return balances;

  const earliestAnchor = resolvedAccounts.reduce(
    (min, a) => (a.balanceAsOf < min ? a.balanceAsOf : min),
    resolvedAccounts[0].balanceAsOf
  );
  const recentTx = await prisma.transaction.findMany({
    where: { accountId: { in: resolvedAccounts.map((a) => a.id) }, date: { gte: earliestAnchor } },
    select: { accountId: true, amount: true, date: true },
  });

  for (const account of resolvedAccounts) {
    const sum = recentTx
      .filter((t) => t.accountId === account.id && t.date >= account.balanceAsOf)
      .reduce((s, t) => s + Number(t.amount), 0);
    balances.set(account.id, Number(account.currentBalance) + sum);
  }
  return balances;
}

export async function getBalancesByScope(): Promise<{
  pro: number;
  perso: number;
  combined: number;
}> {
  const accounts = await listAccounts();
  const balances = await getAllCurrentBalances(accounts);
  let pro = 0;
  let perso = 0;
  for (const account of accounts) {
    const balance = balances.get(account.id) ?? 0;
    if (account.scope === "PRO") pro += balance;
    else perso += balance;
  }
  return { pro, perso, combined: pro + perso };
}

export type NetWorthPoint = { month: string; label: string; total: number };

/**
 * Combined balance (all accounts) at the end of each of the last N calendar months.
 * For a given account, months before its own balanceAsOf anchor can't be reconstructed
 * (no prior data point exists — e.g. right after a "Réconcilier"), so those months just
 * carry the anchor value forward flat rather than guessing.
 */
export async function getNetWorthHistory(monthsBack = 6): Promise<NetWorthPoint[]> {
  const accounts = await listAccounts();
  const now = new Date();
  const points: NetWorthPoint[] = [];
  if (accounts.length === 0) return points;

  const earliestAnchor = accounts.reduce(
    (min, a) => (a.balanceAsOf < min ? a.balanceAsOf : min),
    accounts[0].balanceAsOf
  );
  const allTx = await prisma.transaction.findMany({
    where: { accountId: { in: accounts.map((a) => a.id) }, date: { gte: earliestAnchor } },
    select: { accountId: true, amount: true, date: true },
  });

  for (let i = monthsBack - 1; i >= 0; i--) {
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 0, 23, 59, 59, 999));
    const cappedEnd = monthEnd > now ? now : monthEnd;

    let total = 0;
    for (const account of accounts) {
      if (cappedEnd < account.balanceAsOf) {
        total += Number(account.currentBalance);
        continue;
      }
      const sum = allTx
        .filter((t) => t.accountId === account.id && t.date >= account.balanceAsOf && t.date <= cappedEnd)
        .reduce((s, t) => s + Number(t.amount), 0);
      total += Number(account.currentBalance) + sum;
    }

    points.push({
      month: `${monthEnd.getUTCFullYear()}-${String(monthEnd.getUTCMonth() + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" }).format(monthEnd),
      total: Math.round(total * 100) / 100,
    });
  }

  return points;
}
