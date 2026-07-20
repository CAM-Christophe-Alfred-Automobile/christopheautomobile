import { prisma } from "@/lib/prisma";

export interface PlannedRepairInput {
  description: string;
  targetDate?: Date | null;
  status?: "pending" | "done" | "cancelled";
  priority?: "normal" | "urgent";
  partsNote?: string | null;
  estimatedPrice?: number | null;
}

export async function addPlannedRepair(vehicleId: string, data: PlannedRepairInput) {
  return prisma.plannedRepair.create({ data: { ...data, vehicleId } });
}

export async function updatePlannedRepair(id: string, data: Partial<PlannedRepairInput>) {
  return prisma.plannedRepair.update({ where: { id }, data });
}

export async function deletePlannedRepair(id: string) {
  return prisma.plannedRepair.delete({ where: { id } });
}

export async function getPlannedRepairWithContext(id: string) {
  return prisma.plannedRepair.findUnique({
    where: { id },
    include: { vehicle: { include: { client: true } } },
  });
}
