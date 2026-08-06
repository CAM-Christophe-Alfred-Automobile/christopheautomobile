import { prisma } from "@/lib/prisma";

export interface VehicleInput {
  plate?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  mileage?: number | null;
  notes?: string | null;
  tier?: string | null;
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

export async function reassignVehicleOwner(vehicleId: string, newClientId: string) {
  const vehicle = await prisma.vehicle.findUniqueOrThrow({
    where: { id: vehicleId },
    include: { client: true },
  });
  const previousOwnerName = [vehicle.client.firstName, vehicle.client.lastName !== "." ? vehicle.client.lastName : null]
    .filter(Boolean)
    .join(" ");

  return prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      clientId: newClientId,
      previousOwnerName,
      sold: false,
      soldAt: null,
    },
  });
}

// Même client + même plaque (une fois espaces/tirets ignorés) = même véhicule : on met à jour
// le véhicule existant plutôt que d'en créer un doublon (ex: plaque notée "EN043DQ" une fois
// puis "EN-043-DQ" une autre fois pour la même voiture, notamment via une réservation en ligne).
export async function addVehicle(clientId: string, data: VehicleInput) {
  const formattedPlate = data.plate ? formatPlate(data.plate) : data.plate;

  const existing = formattedPlate ? await findClientVehicleByPlate(clientId, formattedPlate) : null;
  if (existing) {
    return prisma.vehicle.update({
      where: { id: existing.id },
      data: {
        plate: formattedPlate,
        make: data.make ?? existing.make,
        model: data.model ?? existing.model,
        year: data.year ?? existing.year,
        mileage: data.mileage ?? existing.mileage,
        notes: data.notes ?? existing.notes,
        ...(data.mileage != null && data.mileage !== existing.mileage ? { mileageUpdatedAt: new Date() } : {}),
      },
    });
  }

  return prisma.vehicle.create({
    data: {
      ...data,
      plate: formattedPlate,
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
      ...(data.plate ? { plate: formatPlate(data.plate) } : {}),
      ...(data.mileage != null ? { mileageUpdatedAt: new Date() } : {}),
    },
  });
}

export async function deleteVehicle(id: string) {
  return prisma.vehicle.delete({ where: { id } });
}

export function normalizePlate(plate: string): string {
  return plate.replace(/[\s-]/g, "").toUpperCase();
}

// Formate au format SIV standard (AA-000-AA) quand la plaque y correspond une fois les
// espaces/tirets retirés — pour que "EN043DQ" et "EN-043-DQ" soient toujours stockés
// identiquement et ne créent plus de véhicule en double. Les autres formats (ancien FNI,
// plaques étrangères) sont laissés tels quels plutôt que d'être mal découpés.
export function formatPlate(plate: string): string {
  const normalized = normalizePlate(plate);
  const match = normalized.match(/^([A-Z]{2})(\d{3})([A-Z]{2})$/);
  if (!match) return plate.trim();
  return `${match[1]}-${match[2]}-${match[3]}`;
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

// Comme findVehicleByPlate mais limité à un client donné (utilisé pour éviter de créer un
// véhicule en double sur la même fiche client quand la plaque est notée différemment).
export async function findClientVehicleByPlate(clientId: string, plate: string) {
  const normalized = normalizePlate(plate);
  if (!normalized) return null;

  const vehicles = await prisma.vehicle.findMany({ where: { clientId, plate: { not: null } } });
  return vehicles.find((v) => v.plate && normalizePlate(v.plate) === normalized) ?? null;
}
