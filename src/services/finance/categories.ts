import { prisma } from "@/lib/prisma";

export function listCategories() {
  return prisma.category.findMany({
    orderBy: [{ scope: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export function createCategory(data: {
  name: string;
  scope: "PRO" | "PERSO" | "BOTH";
  kind: "income" | "expense";
  monthlyBudget?: number | null;
  isEssential?: boolean;
  color?: string;
}) {
  return prisma.category.create({ data });
}

/** Finds a category by name+scope, creating it if it doesn't exist yet. */
export async function getOrCreateCategory(
  name: string,
  scope: "PRO" | "PERSO" | "BOTH",
  kind: "income" | "expense"
): Promise<string> {
  const existing = await prisma.category.findFirst({ where: { name, scope } });
  if (existing) return existing.id;
  const created = await prisma.category.create({ data: { name, scope, kind } });
  return created.id;
}

export function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    monthlyBudget: number | null;
    isEssential: boolean;
    color: string;
  }>
) {
  return prisma.category.update({ where: { id }, data });
}

/** Month-to-date spend per category id (absolute value, expenses only). */
export async function getMonthToDateSpendByCategory(): Promise<Record<string, number>> {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const rows = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { date: { gte: monthStart }, isTransfer: false, amount: { lt: 0 }, categoryId: { not: null } },
    _sum: { amount: true },
  });

  const result: Record<string, number> = {};
  for (const row of rows) {
    if (row.categoryId) result[row.categoryId] = Math.abs(Number(row._sum.amount ?? 0));
  }
  return result;
}
