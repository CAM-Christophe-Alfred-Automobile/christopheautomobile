import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const maintenanceTypes = [
  { key: "vidange", label: "Vidange + filtres", defaultIntervalMonths: 12, defaultIntervalKm: 15000, sortOrder: 1 },
  { key: "courroie_distribution", label: "Courroie de distribution", defaultIntervalMonths: 60, defaultIntervalKm: 100000, sortOrder: 2 },
  { key: "plaquettes_freins", label: "Plaquettes de frein", defaultIntervalMonths: 24, defaultIntervalKm: 30000, sortOrder: 3, isActive: false },
  { key: "disques_freins", label: "Disques de frein", defaultIntervalMonths: 48, defaultIntervalKm: 60000, sortOrder: 4, isActive: false },
  { key: "controle_technique", label: "Contrôle technique", defaultIntervalMonths: 24, defaultIntervalKm: null, sortOrder: 5, isActive: false },
  { key: "batterie", label: "Batterie", defaultIntervalMonths: 48, defaultIntervalKm: null, sortOrder: 6, isActive: false },
  { key: "pneus", label: "Pneus", defaultIntervalMonths: 36, defaultIntervalKm: 40000, sortOrder: 7, isActive: false },
  { key: "filtre_habitacle", label: "Filtre d'habitacle", defaultIntervalMonths: 12, defaultIntervalKm: 15000, sortOrder: 8, isActive: false },
  { key: "amortisseurs", label: "Amortisseurs", defaultIntervalMonths: 60, defaultIntervalKm: 80000, sortOrder: 9, isActive: false },
  { key: "revision_complete", label: "Révision complète", defaultIntervalMonths: 12, defaultIntervalKm: 15000, sortOrder: 10 },
  { key: "plaquette_frein_av", label: "Plaquette de frein AV", defaultIntervalMonths: 24, defaultIntervalKm: 30000, sortOrder: 11 },
  { key: "plaquette_frein_ar", label: "Plaquette ou garniture de frein AR", defaultIntervalMonths: 24, defaultIntervalKm: 30000, sortOrder: 12 },
  { key: "disque_frein_av", label: "Disque de frein AV", defaultIntervalMonths: 60, defaultIntervalKm: 60000, sortOrder: 13 },
  { key: "disque_frein_ar", label: "Disque de frein AR ou tambour", defaultIntervalMonths: 60, defaultIntervalKm: 60000, sortOrder: 14 },
  { key: "amortisseur_av", label: "Amortisseur AV", defaultIntervalMonths: 84, defaultIntervalKm: 80000, sortOrder: 15 },
  { key: "amortisseur_ar", label: "Amortisseur AR", defaultIntervalMonths: 84, defaultIntervalKm: 80000, sortOrder: 16 },
  { key: "courroie_accessoire", label: "Courroie accessoire", defaultIntervalMonths: 60, defaultIntervalKm: 60000, sortOrder: 17 },
  { key: "embrayage", label: "Embrayage", defaultIntervalMonths: null, defaultIntervalKm: 150000, sortOrder: 18 },
  { key: "liquide_frein", label: "Liquide de frein", defaultIntervalMonths: 24, defaultIntervalKm: null, sortOrder: 19 },
  { key: "liquide_refroidissement", label: "Liquide de refroidissement", defaultIntervalMonths: 60, defaultIntervalKm: null, sortOrder: 20 },
];

async function main() {
  for (const type of maintenanceTypes) {
    await prisma.maintenanceType.upsert({
      where: { key: type.key },
      update: type,
      create: type,
    });
  }
  console.log(`Seeded ${maintenanceTypes.length} maintenance types.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
