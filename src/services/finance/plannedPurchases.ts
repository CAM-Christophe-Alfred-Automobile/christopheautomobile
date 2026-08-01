import { prisma } from "@/lib/prisma";

export function listPlannedPurchases() {
  return prisma.plannedPurchase.findMany({
    where: { status: { not: "cancelled" } },
    orderBy: [{ status: "asc" }, { plannedDate: "asc" }],
  });
}

export function createPlannedPurchase(data: {
  label: string;
  link?: string | null;
  price?: number | null;
  plannedDate?: Date | null;
  scope: "PRO" | "PERSO";
  notes?: string | null;
}) {
  return prisma.plannedPurchase.create({ data });
}

export function updatePlannedPurchaseStatus(id: string, status: "planned" | "bought" | "cancelled") {
  return prisma.plannedPurchase.update({ where: { id }, data: { status } });
}

export function deletePlannedPurchase(id: string) {
  return prisma.plannedPurchase.delete({ where: { id } });
}
