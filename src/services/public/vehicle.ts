import { prisma } from "@/lib/prisma";
import { computeMaintenanceAlert, type AlertStatus } from "@/services/admin/maintenanceAlerts";

export interface PublicMaintenanceStatus {
  maintenanceTypeId: string;
  label: string;
  status: AlertStatus;
  nextDueDate: Date | null;
  updatedByClient: boolean;
}

export interface PublicIntervention {
  date: Date;
  description: string;
}

export interface PublicClientInfo {
  firstName: string;
  lastName: string;
  address: string | null;
  email: string | null;
  phone: string | null;
}

export interface PublicVehicleView {
  id: string;
  make: string | null;
  model: string | null;
  plate: string | null;
  clientId: string;
  client: PublicClientInfo;
  interventions: PublicIntervention[];
  maintenanceStatus: PublicMaintenanceStatus[];
}

export async function getPublicVehicleView(id: string): Promise<PublicVehicleView | null> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      client: true,
      interventions: { where: { status: "done" }, orderBy: { date: "desc" } },
      maintenanceRecords: true,
    },
  });

  // Un véhicule vendu peut avoir changé de propriétaire : on ne montre pas
  // l'historique du précédent client à qui scanne le sticker après revente.
  if (!vehicle || vehicle.sold) return null;

  const recordByType = new Map(vehicle.maintenanceRecords.map((r) => [r.maintenanceTypeId, r]));
  const activeTypes = await prisma.maintenanceType.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const maintenanceStatus = activeTypes
    .filter((t) => t.defaultIntervalMonths != null || t.defaultIntervalKm != null)
    .map((type) => {
      const record = recordByType.get(type.id);
      const interval = record?.intervalMonthsOverride ?? type.defaultIntervalMonths;
      const intervalKm = record?.intervalKmOverride ?? type.defaultIntervalKm;
      const alert = computeMaintenanceAlert(record?.lastDoneDate ?? null, interval, new Date(), 30, {
        lastDoneMileage: record?.lastDoneMileage ?? null,
        intervalKm,
        currentMileage: vehicle.mileage,
      });
      return {
        maintenanceTypeId: type.id,
        label: type.label,
        status: alert.status,
        nextDueDate: alert.nextDueDate,
        updatedByClient: record?.updatedByClient ?? false,
      };
    });

  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    plate: vehicle.plate,
    clientId: vehicle.clientId,
    client: {
      firstName: vehicle.client.firstName,
      lastName: vehicle.client.lastName,
      address: vehicle.client.address,
      email: vehicle.client.email,
      phone: vehicle.client.phone,
    },
    interventions: vehicle.interventions.map((i) => ({ date: i.date, description: i.description })),
    maintenanceStatus,
  };
}

export interface ClientSelfUpdateInput {
  firstName?: string;
  lastName?: string;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
}

export async function updateClientContactByVehicle(vehicleId: string, data: ClientSelfUpdateInput) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw new Error("Véhicule introuvable.");
  return prisma.client.update({ where: { id: vehicle.clientId }, data });
}

export async function reportMaintenanceDoneByClient(
  vehicleId: string,
  maintenanceTypeId: string,
  lastDoneDate: Date
) {
  // On vérifie que ce type appartient bien au véhicule ciblé (pas d'ID arbitraire).
  const type = await prisma.maintenanceType.findUnique({ where: { id: maintenanceTypeId } });
  if (!type || !type.isActive) throw new Error("Type d'entretien introuvable.");

  return prisma.maintenanceRecord.upsert({
    where: { vehicleId_maintenanceTypeId: { vehicleId, maintenanceTypeId } },
    update: { lastDoneDate, updatedByClient: true },
    create: { vehicleId, maintenanceTypeId, lastDoneDate, updatedByClient: true },
  });
}
