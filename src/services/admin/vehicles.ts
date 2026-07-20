import { prisma } from "@/lib/prisma";

export interface VehicleInput {
  plate?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  mileage?: number | null;
  notes?: string | null;
}

export async function getVehicleWithHistory(id: string) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: {
      client: true,
      interventions: { orderBy: { date: "desc" }, include: { maintenanceType: true } },
    },
  });
}

export async function setVehicleSold(id: string, sold: boolean) {
  return prisma.vehicle.update({
    where: { id },
    data: { sold, soldAt: sold ? new Date() : null },
  });
}

export async function addVehicle(clientId: string, data: VehicleInput) {
  return prisma.vehicle.create({
    data: {
      ...data,
      clientId,
      mileageUpdatedAt: data.mileage != null ? new Date() : null,
    },
  });
}

export async function updateVehicle(id: string, data: Partial<VehicleInput>) {
  return prisma.vehicle.update({
    where: { id },
    data: {
      ...data,
      ...(data.mileage != null ? { mileageUpdatedAt: new Date() } : {}),
    },
  });
}

export async function deleteVehicle(id: string) {
  return prisma.vehicle.delete({ where: { id } });
}

function normalizePlate(plate: string): string {
  return plate.replace(/[\s-]/g, "").toUpperCase();
}

export async function findVehicleByPlate(plate: string) {
  const normalized = normalizePlate(plate);
  if (!normalized) return null;

  const vehicles = await prisma.vehicle.findMany({
    where: { plate: { not: null } },
    include: { client: true },
  });

  return vehicles.find((v) => v.plate && normalizePlate(v.plate) === normalized) ?? null;
}
