import { prisma } from "@/lib/prisma";

export interface MaintenanceRecordInput {
  lastDoneDate?: Date | null;
  lastDoneMileage?: number | null;
  intervalMonthsOverride?: number | null;
  intervalKmOverride?: number | null;
  updatedByClient?: boolean;
}

export async function upsertMaintenanceRecord(
  vehicleId: string,
  maintenanceTypeId: string,
  data: MaintenanceRecordInput
) {
  return prisma.maintenanceRecord.upsert({
    where: { vehicleId_maintenanceTypeId: { vehicleId, maintenanceTypeId } },
    update: data,
    create: { vehicleId, maintenanceTypeId, ...data },
  });
}

export async function listMaintenanceRecordsForVehicle(vehicleId: string) {
  return prisma.maintenanceRecord.findMany({
    where: { vehicleId },
    include: { maintenanceType: true },
  });
}
