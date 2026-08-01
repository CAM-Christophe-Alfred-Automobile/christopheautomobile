import { prisma } from "@/lib/prisma";

export type CategoryTotal = { categoryId: string | null; name: string; scope: string; income: number; expense: number };

export type AnnualReport = {
  year: number;
  totalIncomePro: number;
  totalExpensePro: number;
  totalIncomePerso: number;
  totalExpensePerso: number;
  categories: CategoryTotal[];
};

/** Yearly totals per category (income/expense, transfers excluded) — for URSSAF prep or a comptable. */
export async function getAnnualReport(year: number): Promise<AnnualReport> {
  const from = new Date(Date.UTC(year, 0, 1));
  const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: from, lte: to }, isTransfer: false },
    include: { category: true },
  });

  let totalIncomePro = 0;
  let totalExpensePro = 0;
  let totalIncomePerso = 0;
  let totalExpensePerso = 0;
  const byCategory = new Map<string, CategoryTotal>();

  for (const tx of transactions) {
    const amount = Number(tx.amount);
    if (tx.scope === "PRO") {
      if (amount >= 0) totalIncomePro += amount;
      else totalExpensePro += Math.abs(amount);
    } else {
      if (amount >= 0) totalIncomePerso += amount;
      else totalExpensePerso += Math.abs(amount);
    }

    const key = `${tx.categoryId ?? "none"}|${tx.scope}`;
    if (!byCategory.has(key)) {
      byCategory.set(key, {
        categoryId: tx.categoryId,
        name: tx.category?.name ?? "Sans catégorie",
        scope: tx.scope,
        income: 0,
        expense: 0,
      });
    }
    const bucket = byCategory.get(key)!;
    if (amount >= 0) bucket.income += amount;
    else bucket.expense += Math.abs(amount);
  }

  return {
    year,
    totalIncomePro,
    totalExpensePro,
    totalIncomePerso,
    totalExpensePerso,
    categories: Array.from(byCategory.values()).sort((a, b) => b.expense + b.income - (a.expense + a.income)),
  };
}

/** Years that have at least one transaction — used to populate the year picker. */
export async function listAvailableYears(): Promise<number[]> {
  const rows = await prisma.$queryRaw<{ year: number }[]>`
    SELECT DISTINCT EXTRACT(YEAR FROM date)::int AS year FROM "Transaction" ORDER BY year DESC
  `;
  const years = rows.map((r) => r.year);
  const currentYear = new Date().getUTCFullYear();
  if (!years.includes(currentYear)) years.unshift(currentYear);
  return years;
}
