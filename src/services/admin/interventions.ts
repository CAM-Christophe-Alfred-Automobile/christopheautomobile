import { prisma } from "@/lib/prisma";

export interface InterventionInput {
  date: Date;
  endDate?: Date | null;
  description: string;
  normalPrice?: number | null;
  price?: number | null;
  maintenanceTypeId?: string | null;
  notes?: string | null;
  mileage?: number | null;
  hoursSpent?: number | null;
  vehicleCondition?: string | null;
  status?: "draft" | "done";
  chronoStartedAt?: Date | null;
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
    where: { status: "draft" },
    include: { vehicle: { include: { client: true } } },
    orderBy: { date: "asc" },
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

export async function addIntervention(vehicleId: string, data: InterventionInput) {
  const intervention = await prisma.intervention.create({
    data: { ...data, vehicleId },
  });

  if (data.maintenanceTypeId) {
    await syncMaintenanceRecord(vehicleId, data.maintenanceTypeId, data.date);
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

export async function updateIntervention(id: string, data: Partial<InterventionInput>) {
  return prisma.intervention.update({ where: { id }, data });
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
}

export async function addPartUsed(interventionId: string, data: PartUsedInput) {
  return prisma.partUsed.create({ data: { ...data, interventionId } });
}

export async function removePartUsed(id: string) {
  return prisma.partUsed.delete({ where: { id } });
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
