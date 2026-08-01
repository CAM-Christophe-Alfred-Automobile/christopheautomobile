import { prisma } from "@/lib/prisma";

export function listRecurringItems(activeOnly = false) {
  return prisma.recurringItem.findMany({
    where: activeOnly ? { isActive: true } : {},
    include: { account: true, category: true },
    orderBy: [{ scope: "asc" }, { label: "asc" }],
  });
}

export function createRecurringItem(data: {
  accountId: string;
  categoryId?: string | null;
  label: string;
  scope: "PRO" | "PERSO";
  direction: "income" | "expense";
  amount: number;
  amountIsEstimate: boolean;
  frequency: "monthly" | "quarterly" | "annual" | "weekly" | "custom_days";
  intervalDays?: number | null;
  dayOfMonth?: number | null;
  startDate: Date;
  endDate?: Date | null;
}) {
  return prisma.recurringItem.create({ data });
}

export function getRecurringItem(id: string) {
  return prisma.recurringItem.findUniqueOrThrow({ where: { id } });
}

export function updateRecurringItem(
  id: string,
  data: Partial<{
    isActive: boolean;
    autoGenerate: boolean;
    accountId: string;
    categoryId: string | null;
    label: string;
    scope: "PRO" | "PERSO";
    direction: "income" | "expense";
    amount: number;
    amountIsEstimate: boolean;
    frequency: "monthly" | "quarterly" | "annual" | "weekly" | "custom_days";
    intervalDays: number | null;
    dayOfMonth: number | null;
    startDate: Date;
    endDate: Date | null;
  }>
) {
  return prisma.recurringItem.update({ where: { id }, data });
}

export function deleteRecurringItem(id: string) {
  return prisma.recurringItem.delete({ where: { id } });
}
