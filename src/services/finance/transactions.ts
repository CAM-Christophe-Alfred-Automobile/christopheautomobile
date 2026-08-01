import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export type TransactionFilters = {
  scope?: "PRO" | "PERSO";
  accountId?: string;
  categoryId?: string;
  from?: Date;
  to?: Date;
  take?: number;
};

export function listTransactions(filters: TransactionFilters = {}) {
  return prisma.transaction.findMany({
    where: {
      scope: filters.scope,
      accountId: filters.accountId,
      categoryId: filters.categoryId,
      date: {
        gte: filters.from,
        lte: filters.to,
      },
    },
    include: { account: true, category: true },
    orderBy: { date: "desc" },
    take: filters.take,
  });
}

/** Derniers encaissements espèces synchronisés depuis le CRM (voir cashPaymentSync.ts) — la description porte déjà "client — véhicule — description". */
export function listRecentCrmCashPayments(limit = 5) {
  return prisma.transaction.findMany({
    where: { importBatch: { source: "crm_cash" } },
    include: { account: true },
    orderBy: { date: "desc" },
    take: limit,
  });
}

export type MonthlyFlow = {
  month: string; // "2026-07"
  label: string; // "juil. 2026"
  proIncome: number;
  proExpense: number;
  persoIncome: number;
  persoExpense: number;
};

/** Aggregates income/expense totals per scope for the last N calendar months (excludes transfers). */
export async function getMonthlyFlows(monthsBack = 6): Promise<MonthlyFlow[]> {
  const now = new Date();
  const rangeStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1), 1));

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: rangeStart }, isTransfer: false },
    select: { date: true, amount: true, scope: true },
  });

  const buckets = new Map<string, MonthlyFlow>();
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1) + i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, {
      month: key,
      label: new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" }).format(d),
      proIncome: 0,
      proExpense: 0,
      persoIncome: 0,
      persoExpense: 0,
    });
  }

  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    const amount = Number(tx.amount);
    const scope = tx.scope as "PRO" | "PERSO";
    if (amount >= 0) {
      if (scope === "PRO") bucket.proIncome += amount;
      else bucket.persoIncome += amount;
    } else {
      if (scope === "PRO") bucket.proExpense += Math.abs(amount);
      else bucket.persoExpense += Math.abs(amount);
    }
  }

  return Array.from(buckets.values());
}

export function getTransaction(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
    include: { account: true, category: true },
  });
}

export function createTransaction(data: {
  accountId: string;
  categoryId?: string | null;
  date: Date;
  description: string;
  amount: number;
  scope: "PRO" | "PERSO";
  notes?: string | null;
  attachmentPath?: string | null;
}) {
  return prisma.transaction.create({ data });
}

export function updateTransaction(
  id: string,
  data: Partial<{
    accountId: string;
    categoryId: string | null;
    date: Date;
    description: string;
    amount: number;
    notes: string | null;
  }>
) {
  return prisma.transaction.update({ where: { id }, data });
}

export function deleteTransaction(id: string) {
  return prisma.transaction.delete({ where: { id } });
}

/**
 * Records a pro<->perso self-transfer as two linked transactions,
 * both flagged isTransfer so they're excluded from income/expense/forecast math.
 */
export async function createTransfer(data: {
  fromAccountId: string;
  toAccountId: string;
  fromScope: "PRO" | "PERSO";
  toScope: "PRO" | "PERSO";
  date: Date;
  amount: number;
  description: string;
}) {
  const linkedTransferId = randomUUID();
  return prisma.$transaction([
    prisma.transaction.create({
      data: {
        accountId: data.fromAccountId,
        date: data.date,
        description: data.description,
        amount: -Math.abs(data.amount),
        scope: data.fromScope,
        isTransfer: true,
        linkedTransferId: `${linkedTransferId}-out`,
      },
    }),
    prisma.transaction.create({
      data: {
        accountId: data.toAccountId,
        date: data.date,
        description: data.description,
        amount: Math.abs(data.amount),
        scope: data.toScope,
        isTransfer: true,
        linkedTransferId: `${linkedTransferId}-in`,
      },
    }),
  ]);
}
