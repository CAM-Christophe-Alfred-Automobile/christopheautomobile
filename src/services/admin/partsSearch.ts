import { prisma } from "@/lib/prisma";

export interface PartSearchResult {
  partId: string;
  designation: string;
  reference: string | null;
  quantity: string | null;
  interventionId: string;
  interventionDate: Date;
  vehicleId: string;
  vehicleLabel: string;
  clientId: string;
  clientLabel: string;
}

/**
 * Recherche multi-mots : chaque mot de la requête doit apparaître quelque part
 * dans le véhicule (marque/modèle/plaque) OU la pièce (désignation/référence),
 * ex. "clio huile" retrouve les pièces "huile" utilisées sur des véhicules "clio".
 */
export async function searchParts(query: string): Promise<PartSearchResult[]> {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

  if (words.length === 0) return [];

  const parts = await prisma.partUsed.findMany({
    include: {
      intervention: {
        include: {
          vehicle: { include: { client: true } },
        },
      },
    },
    orderBy: { intervention: { date: "desc" } },
    take: 500,
  });

  const results: PartSearchResult[] = [];

  for (const part of parts) {
    const vehicle = part.intervention.vehicle;
    const vehicleLabel = [vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(" ");
    const haystack = [vehicleLabel, part.designation, part.reference ?? ""].join(" ").toLowerCase();

    if (words.every((w) => haystack.includes(w))) {
      results.push({
        partId: part.id,
        designation: part.designation,
        reference: part.reference,
        quantity: part.quantity,
        interventionId: part.interventionId,
        interventionDate: part.intervention.date,
        vehicleId: vehicle.id,
        vehicleLabel: vehicleLabel || "Véhicule",
        clientId: vehicle.client.id,
        clientLabel: `${vehicle.client.firstName} ${vehicle.client.lastName}`,
      });
    }
  }

  return results;
}
