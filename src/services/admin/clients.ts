import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { computeMaintenanceAlert, worstAlertStatus, type AlertStatus } from "./maintenanceAlerts";

const clientWithRelations = {
  vehicles: {
    include: {
      maintenanceRecords: { include: { maintenanceType: true } },
    },
  },
} satisfies Prisma.ClientInclude;

type ClientWithRelations = Prisma.ClientGetPayload<{ include: typeof clientWithRelations }>;

function computeClientAlertStatus(client: ClientWithRelations): AlertStatus {
  const activeVehicles = client.vehicles.filter((v) => !v.sold);
  if (activeVehicles.length === 0 && client.vehicles.length > 0) return "sold";

  const vehicleStatuses = activeVehicles.map((vehicle) => {
    const recordStatuses = vehicle.maintenanceRecords.map((record) => {
      const interval = record.intervalMonthsOverride ?? record.maintenanceType.defaultIntervalMonths;
      const intervalKm = record.intervalKmOverride ?? record.maintenanceType.defaultIntervalKm;
      return computeMaintenanceAlert(record.lastDoneDate, interval, new Date(), 30, {
        lastDoneMileage: record.lastDoneMileage,
        intervalKm,
        currentMileage: vehicle.mileage,
      }).status;
    });
    return worstAlertStatus(recordStatuses);
  });
  return worstAlertStatus(vehicleStatuses);
}

export async function listClients(query?: string) {
  const clients = await prisma.client.findMany({
    where: query
      ? {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { vehicles: { some: { plate: { contains: query, mode: "insensitive" } } } },
          ],
        }
      : undefined,
    include: clientWithRelations,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return clients.map((client) => ({
    ...client,
    alertStatus: computeClientAlertStatus(client),
  }));
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      vehicles: {
        include: {
          interventions: {
            orderBy: { date: "desc" },
            include: { maintenanceType: true, partsUsed: true, payments: { orderBy: { date: "asc" } } },
          },
          plannedRepairs: { orderBy: { createdAt: "desc" } },
          maintenanceRecords: { include: { maintenanceType: true } },
        },
      },
    },
  });
}

export interface ClientInput {
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  abbyReference?: string | null;
}

export async function createClient(data: ClientInput) {
  return prisma.client.create({ data });
}

export async function updateClient(id: string, data: Partial<ClientInput>) {
  return prisma.client.update({ where: { id }, data });
}

export async function deleteClient(id: string) {
  return prisma.client.delete({ where: { id } });
}
