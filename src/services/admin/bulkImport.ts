import { prisma } from "@/lib/prisma";

export interface ImportIntervention {
  date: string;
  description: string;
  price?: number | null;
  maintenanceTypeKey?: string | null;
  abbyInvoiceNumber?: string | null;
}

export interface ImportVehicle {
  plate?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  mileage?: number | null;
}

export interface ImportClient {
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  abbyReference?: string | null;
}

export interface ImportItem {
  client: ImportClient;
  vehicle?: ImportVehicle | null;
  interventions?: ImportIntervention[];
}

export interface ImportRowResult {
  index: number;
  success: boolean;
  error?: string;
  clientId?: string;
}

export async function importBatch(items: ImportItem[]): Promise<ImportRowResult[]> {
  const results: ImportRowResult[] = [];

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    try {
      const clientId = await importOne(item);
      results.push({ index, success: true, clientId });
    } catch (error) {
      results.push({
        index,
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  }

  return results;
}

async function importOne(item: ImportItem): Promise<string> {
  if (!item.client?.firstName || !item.client?.lastName) {
    throw new Error("Nom/prénom client manquant.");
  }

  return prisma.$transaction(async (tx) => {
    const client = item.client.abbyReference
      ? await tx.client.upsert({
          where: { abbyReference: item.client.abbyReference },
          update: {
            firstName: item.client.firstName,
            lastName: item.client.lastName,
            phone: item.client.phone ?? undefined,
            email: item.client.email ?? undefined,
            address: item.client.address ?? undefined,
          },
          create: item.client,
        })
      : await tx.client.create({ data: item.client });

    let vehicleId: string | undefined;

    if (item.vehicle) {
      const existingVehicle = item.vehicle.plate
        ? await tx.vehicle.findFirst({
            where: { clientId: client.id, plate: item.vehicle.plate },
          })
        : null;

      const vehicle = existingVehicle
        ? await tx.vehicle.update({ where: { id: existingVehicle.id }, data: item.vehicle })
        : await tx.vehicle.create({ data: { ...item.vehicle, clientId: client.id } });

      vehicleId = vehicle.id;
    }

    if (vehicleId && item.interventions?.length) {
      for (const intervention of item.interventions) {
        if (intervention.abbyInvoiceNumber) {
          const existing = await tx.intervention.findUnique({
            where: { abbyInvoiceNumber: intervention.abbyInvoiceNumber },
          });
          if (existing) continue; // already imported in a previous sync
        }

        const date = new Date(intervention.date);
        let maintenanceTypeId: string | undefined;

        if (intervention.maintenanceTypeKey) {
          const type = await tx.maintenanceType.findUnique({
            where: { key: intervention.maintenanceTypeKey },
          });
          maintenanceTypeId = type?.id;
        }

        await tx.intervention.create({
          data: {
            vehicleId,
            date,
            description: intervention.description,
            price: intervention.price ?? undefined,
            maintenanceTypeId,
            abbyInvoiceNumber: intervention.abbyInvoiceNumber ?? undefined,
          },
        });

        if (maintenanceTypeId) {
          const existingRecord = await tx.maintenanceRecord.findUnique({
            where: { vehicleId_maintenanceTypeId: { vehicleId, maintenanceTypeId } },
          });
          const newLastDone =
            !existingRecord?.lastDoneDate || date > existingRecord.lastDoneDate
              ? date
              : existingRecord.lastDoneDate;

          await tx.maintenanceRecord.upsert({
            where: { vehicleId_maintenanceTypeId: { vehicleId, maintenanceTypeId } },
            update: { lastDoneDate: newLastDone },
            create: { vehicleId, maintenanceTypeId, lastDoneDate: date },
          });
        }
      }
    }

    return client.id;
  });
}
