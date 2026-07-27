import { prisma } from "@/lib/prisma";

export interface FuelLogInput {
  date: Date;
  price: number;
  quantity: number;
  mileage?: number | null;
  trackedByBank?: boolean;
}

export async function addFuelLog(vehicleId: string, data: FuelLogInput) {
  const log = await prisma.fuelLog.create({ data: { ...data, vehicleId } });

  if (data.mileage != null) {
    const vehicle = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicleId } });
    if (vehicle.mileage == null || data.mileage > vehicle.mileage) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { mileage: data.mileage, mileageUpdatedAt: data.date },
      });
    }
  }

  return log;
}

export async function deleteFuelLog(id: string) {
  return prisma.fuelLog.delete({ where: { id } });
}
