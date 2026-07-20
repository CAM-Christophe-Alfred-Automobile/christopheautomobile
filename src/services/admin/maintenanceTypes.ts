import { prisma } from "@/lib/prisma";

export interface MaintenanceTypeInput {
  key: string;
  label: string;
  defaultIntervalMonths?: number | null;
  defaultIntervalKm?: number | null;
  isActive?: boolean;
  sortOrder?: number;
}

export async function listMaintenanceTypes() {
  return prisma.maintenanceType.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function createMaintenanceType(data: MaintenanceTypeInput) {
  return prisma.maintenanceType.create({ data });
}

export async function updateMaintenanceType(id: string, data: Partial<MaintenanceTypeInput>) {
  return prisma.maintenanceType.update({ where: { id }, data });
}

export async function deleteMaintenanceType(id: string) {
  return prisma.maintenanceType.update({ where: { id }, data: { isActive: false } });
}
