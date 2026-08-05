import { prisma } from "@/lib/prisma";

export interface InterventionInput {
  date: Date;
  endDate?: Date | null;
  description: string;
  normalPrice?: number | null;
  price?: number | null;
  maintenanceTypeId?: string | null;
  maintenanceTypeIds?: string[];
  notes?: string | null;
  toolLink?: string | null;
  mileage?: number | null;
  hoursSpent?: number | null;
  vehicleCondition?: string | null;
  status?: "draft" | "done" | "reserved";
  chronoStartedAt?: Date | null;
  completedAt?: Date | null;
  bookedOnline?: boolean;
  depositAmount?: number | null;
  depositDate?: Date | null;
  deliveryPrice?: number | null;
  dossierFee?: number | null;
  reviewReminderSent?: boolean;
}

export async function startDraftIntervention(vehicleId: string) {
  return prisma.intervention.create({
    data: {
      vehicleId,
      date: new Date(),
      description: "",
      status: "draft",
    },
  });
}

export async function getInterventionWithContext(id: string) {
  return prisma.intervention.findUnique({
    where: { id },
    include: {
      vehicle: { include: { client: true } },
      partsUsed: true,
      payments: { orderBy: { date: "asc" } },
      maintenanceType: true,
    },
  });
}

export async function listInProgressInterventions() {
  return prisma.intervention.findMany({
    where: { status: { in: ["draft", "reserved"] } },
    include: { vehicle: { include: { client: true } } },
    orderBy: { date: "asc" },
  });
}

// Interventions terminées récemment (2 à 10 jours) sans relance avis Google envoyée —
// laisse un peu de temps au client avant de le solliciter, sans remonter tout l'historique.
export async function listReviewReminderCandidates() {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 10);
  const to = new Date(now);
  to.setDate(to.getDate() - 2);

  return prisma.intervention.findMany({
    where: {
      status: "done",
      reviewReminderSent: false,
      date: { gte: from, lte: to },
      vehicle: { client: { isPersonal: false, phone: { not: null } } },
    },
    include: { vehicle: { include: { client: true } } },
    orderBy: { date: "desc" },
  });
}

async function syncMaintenanceRecord(vehicleId: string, maintenanceTypeId: string, date: Date) {
  const existing = await prisma.maintenanceRecord.findUnique({
    where: { vehicleId_maintenanceTypeId: { vehicleId, maintenanceTypeId } },
  });

  const newLastDone = !existing?.lastDoneDate || date > existing.lastDoneDate ? date : existing.lastDoneDate;

  await prisma.maintenanceRecord.upsert({
    where: { vehicleId_maintenanceTypeId: { vehicleId, maintenanceTypeId } },
    update: { lastDoneDate: newLastDone },
    create: { vehicleId, maintenanceTypeId, lastDoneDate: date },
  });
}

// Une intervention peut couvrir plusieurs types d'entretien à la fois (ex: vidange + plaquettes
// le même jour) — normalise vers un tableau, en repli sur l'ancien champ unique le cas échéant.
function normalizeMaintenanceTypeIds(data: {
  maintenanceTypeId?: string | null;
  maintenanceTypeIds?: string[];
}): string[] | undefined {
  if (data.maintenanceTypeIds !== undefined) return data.maintenanceTypeIds;
  if (data.maintenanceTypeId !== undefined) return data.maintenanceTypeId ? [data.maintenanceTypeId] : [];
  return undefined;
}

export async function addIntervention(vehicleId: string, data: InterventionInput) {
  const ids = normalizeMaintenanceTypeIds(data) ?? [];
  const intervention = await prisma.intervention.create({
    data: { ...data, vehicleId, maintenanceTypeId: ids[0] ?? null, maintenanceTypeIds: ids },
  });

  for (const typeId of ids) {
    await syncMaintenanceRecord(vehicleId, typeId, data.date);
  }

  if (data.mileage != null) {
    const vehicle = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicleId } });
    if (vehicle.mileage == null || data.mileage > vehicle.mileage) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { mileage: data.mileage, mileageUpdatedAt: data.date },
      });
    }
  }

  return intervention;
}

export const REOPEN_WINDOW_DAYS = 7;

// Rouvrir une intervention terminée (status "done" -> "draft") n'est autorisé que dans les
// REOPEN_WINDOW_DAYS suivant sa finalisation (completedAt) — au-delà, le prix/temps a
// généralement déjà été facturé/réconcilié, donc on bloque au niveau service (pas seulement
// en cachant le bouton côté UI) pour que la règle tienne même via un appel direct à l'API.
async function assertReopenAllowed(id: string) {
  const current = await prisma.intervention.findUniqueOrThrow({ where: { id } });
  if (current.status !== "done") return;
  if (!current.completedAt) {
    throw new Error("Impossible de rouvrir cette intervention : date de finalisation inconnue.");
  }
  const daysSinceCompletion = (Date.now() - current.completedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCompletion > REOPEN_WINDOW_DAYS) {
    throw new Error(
      `Impossible de rouvrir une intervention terminée depuis plus de ${REOPEN_WINDOW_DAYS} jours.`
    );
  }
}

export async function updateIntervention(id: string, data: Partial<InterventionInput>) {
  if (data.status !== undefined && data.status !== "done") {
    await assertReopenAllowed(id);
  }

  const ids = normalizeMaintenanceTypeIds(data);
  const intervention = await prisma.intervention.update({
    where: { id },
    data: ids !== undefined ? { ...data, maintenanceTypeId: ids[0] ?? null, maintenanceTypeIds: ids } : data,
  });

  if (ids && ids.length > 0) {
    for (const typeId of ids) {
      await syncMaintenanceRecord(intervention.vehicleId, typeId, intervention.date);
    }
  }

  return intervention;
}

export async function deleteIntervention(id: string) {
  return prisma.intervention.delete({ where: { id } });
}

export type PhotoCategory = "before" | "after" | "damage";

const PHOTO_FIELD: Record<PhotoCategory, "photos" | "photosBefore" | "photosAfter"> = {
  before: "photosBefore",
  after: "photosAfter",
  damage: "photos",
};

export async function addInterventionPhoto(id: string, url: string, category: PhotoCategory = "damage") {
  const field = PHOTO_FIELD[category];
  const intervention = await prisma.intervention.findUniqueOrThrow({ where: { id } });
  return prisma.intervention.update({
    where: { id },
    data: { [field]: { set: [...intervention[field], url] } },
  });
}

export async function removeInterventionPhoto(id: string, url: string, category: PhotoCategory = "damage") {
  const field = PHOTO_FIELD[category];
  const intervention = await prisma.intervention.findUniqueOrThrow({ where: { id } });
  return prisma.intervention.update({
    where: { id },
    data: { [field]: { set: intervention[field].filter((p) => p !== url) } },
  });
}

export interface PartUsedInput {
  designation: string;
  reference?: string | null;
  quantity?: string | null;
  link?: string | null;
  price?: number | null;
  boughtByClient?: boolean;
  stockPartId?: string | null;
  quantityUsed?: number | null;
}

export async function addPartUsed(interventionId: string, data: PartUsedInput) {
  if (data.stockPartId && data.quantityUsed) {
    return prisma.$transaction(async (tx) => {
      const stockPart = await tx.stockPart.findUniqueOrThrow({ where: { id: data.stockPartId! } });
      await tx.stockPart.update({
        where: { id: data.stockPartId! },
        data: { quantity: Math.max(0, stockPart.quantity - data.quantityUsed!) },
      });
      return tx.partUsed.create({ data: { ...data, interventionId } });
    });
  }
  return prisma.partUsed.create({ data: { ...data, interventionId } });
}

export async function removePartUsed(id: string) {
  return prisma.$transaction(async (tx) => {
    const part = await tx.partUsed.findUniqueOrThrow({ where: { id } });
    if (part.stockPartId && part.quantityUsed) {
      const stockPart = await tx.stockPart.findUnique({ where: { id: part.stockPartId } });
      if (stockPart) {
        await tx.stockPart.update({
          where: { id: part.stockPartId },
          data: { quantity: stockPart.quantity + part.quantityUsed },
        });
      }
    }
    return tx.partUsed.delete({ where: { id } });
  });
}

export interface PaymentInput {
  amount: number;
  method?: "cash" | "card" | "transfer" | "check" | null;
  date: Date;
  note?: string | null;
}

export async function addPayment(interventionId: string, data: PaymentInput) {
  return prisma.payment.create({ data: { ...data, interventionId } });
}

export async function removePayment(id: string) {
  return prisma.payment.delete({ where: { id } });
}
