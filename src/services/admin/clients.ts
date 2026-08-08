import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { computeMaintenanceAlert, worstAlertStatus, type AlertStatus } from "./maintenanceAlerts";

// Le suivi paiement/reste dû n'était pas fait de façon fiable avant juillet 2026 — remonter plus
// loin ferait ressortir en "impayé" des interventions anciennes jamais correctement soldées dans
// l'appli, sans rapport avec un vrai défaut de paiement du client.
const UNPAID_TRACKING_SINCE = new Date(Date.UTC(2026, 6, 1));

const clientWithRelations = {
  vehicles: {
    include: {
      maintenanceRecords: { include: { maintenanceType: true } },
      interventions: {
        where: { status: "done", date: { gte: UNPAID_TRACKING_SINCE }, price: { not: null } },
        select: {
          price: true,
          depositAmount: true,
          payments: { select: { amount: true } },
          partsUsed: { select: { price: true, boughtByClient: true } },
        },
      },
    },
  },
} satisfies Prisma.ClientInclude;

type ClientWithRelations = Prisma.ClientGetPayload<{ include: typeof clientWithRelations }>;

// Même formule que PaymentsSection côté fiche client : dû = prix + pièces (hors achetées par le
// client) ; payé = paiements enregistrés + acompte.
function computeHasUnpaid(client: ClientWithRelations): boolean {
  for (const vehicle of client.vehicles) {
    for (const intervention of vehicle.interventions) {
      const priceNum = intervention.price != null ? Number(intervention.price) : null;
      if (priceNum == null) continue;
      const partsTotal = intervention.partsUsed
        .filter((p) => !p.boughtByClient)
        .reduce((sum, p) => sum + (p.price != null ? Number(p.price) : 0), 0);
      const totalDue = priceNum + partsTotal;
      const paymentsTotal = intervention.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const depositNum = intervention.depositAmount != null ? Number(intervention.depositAmount) : 0;
      const totalPaid = paymentsTotal + depositNum;
      if (totalDue - totalPaid > 0.005) return true;
    }
  }
  return false;
}

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
    where: {
      isPersonal: false,
      ...(query
        ? {
            OR: [
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { vehicles: { some: { plate: { contains: query, mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    include: clientWithRelations,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return clients.map((client) => ({
    ...client,
    alertStatus: computeClientAlertStatus(client),
    hasUnpaid: computeHasUnpaid(client),
  }));
}

export async function listPersonalClients() {
  const clients = await prisma.client.findMany({
    where: { isPersonal: true },
    include: clientWithRelations,
    orderBy: [{ firstName: "asc" }],
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
          fuelLogs: { orderBy: { date: "desc" } },
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
  isPersonal?: boolean;
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
