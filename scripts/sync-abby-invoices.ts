/**
 * Resynchronisation manuelle depuis Abby.
 *
 * Usage :
 *   npx tsx scripts/sync-abby-invoices.ts <dossier-pdfs-factures> <contacts.csv>
 *
 * Prérequis (à faire à la main, Abby n'a pas d'API de liste de factures) :
 * 1. Se connecter à Abby, exporter les contacts en CSV (Contacts > Télécharger en CSV)
 * 2. Exporter les factures en PDF (Facturation > Exporter > large plage de dates)
 * 3. Dézipper le fichier obtenu dans un dossier
 * 4. Lancer ce script avec les deux chemins
 *
 * Idempotent : les factures déjà importées (même numéro) sont ignorées automatiquement.
 */
import { readFileSync, readdirSync } from "fs";
import path from "path";
// @ts-expect-error - pdf-parse has no types for the classic API
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { prisma } from "../src/lib/prisma";
import { importBatch, type ImportItem } from "../src/services/admin/bulkImport";
import { parseAbbyContactsCsv, type AbbyContact } from "../src/services/admin/abbySync";

const MAINTENANCE_RULES: { key: string; patterns: RegExp[] }[] = [
  { key: "vidange", patterns: [/vidange moteur/i, /vidange\b/i] },
  { key: "courroie_distribution", patterns: [/courroie.*distribution/i, /kit distribution/i] },
  { key: "courroie_accessoire", patterns: [/courroie.*access/i] },
  { key: "embrayage", patterns: [/embrayage/i] },
  { key: "plaquette_frein_ar", patterns: [/plaquette.*(arri[eè]re|\bar\b)/i, /garniture.*frein/i] },
  { key: "plaquette_frein_av", patterns: [/plaquette/i] },
  { key: "disque_frein_ar", patterns: [/disque.*(arri[eè]re|\bar\b)/i, /tambour/i] },
  { key: "disque_frein_av", patterns: [/disque.*frein/i, /\bdisque\b.*plaquette/i] },
  { key: "liquide_frein", patterns: [/liquide.*frein/i] },
  { key: "liquide_refroidissement", patterns: [/liquide.*refroidissement/i, /antigel/i] },
  { key: "amortisseur_ar", patterns: [/amortisseur.*(arri[eè]re|\bar\b)/i] },
  { key: "amortisseur_av", patterns: [/amortisseur/i] },
  { key: "revision_complete", patterns: [/r[eé]vision compl[eè]te/i] },
];

function detectMaintenanceType(text: string): string | null {
  for (const rule of MAINTENANCE_RULES) {
    if (rule.patterns.some((p) => p.test(text))) return rule.key;
  }
  return null;
}

function parseDdMmYyyy(s: string): string | null {
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  return new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd))).toISOString();
}

function parseAmount(s?: string): number | null {
  if (!s) return null;
  const cleaned = s.replace(/[^\d,.\-]/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

const PLATE_RE = /\b([A-Z]{2}[\-\s]?\d{3}[\-\s]?[A-Z]{2})\b/;
const OLD_PLATE_RE = /\b(\d{1,4}[\-\s][A-Z]{2,3}[\-\s]\d{2,3})\b/;
const MILEAGE_RE = /(\d[\d\s]{2,7})\s?[Kk][Mm]s?\b/;

function parseDesignation(raw: string | null) {
  if (!raw) return { make: null as string | null, plate: null as string | null, mileage: null as number | null };
  let text = raw;
  let plate: string | null = null;
  let mileage: number | null = null;
  const plateMatch = text.match(PLATE_RE) || text.match(OLD_PLATE_RE);
  if (plateMatch) {
    plate = plateMatch[1].replace(/[\s-]/g, "");
    text = text.replace(plateMatch[0], " ");
  }
  const mileageMatch = text.match(MILEAGE_RE);
  if (mileageMatch) {
    mileage = Number(mileageMatch[1].replace(/\s/g, ""));
    text = text.replace(mileageMatch[0], " ");
  }
  const make = text.replace(/\s{2,}/g, " ").trim() || null;
  return { make, plate, mileage };
}

function parseContacts(csvPath: string): AbbyContact[] {
  return parseAbbyContactsCsv(readFileSync(csvPath, "utf-8"));
}

function normalizeName(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

function findContact(contacts: AbbyContact[], name: string): AbbyContact | null {
  const key = normalizeName(name);
  for (const c of contacts) {
    const full = `${c.firstName} ${c.lastName}`.toLowerCase();
    const swapped = `${c.lastName} ${c.firstName}`.toLowerCase();
    if (full === key || swapped === key) return c;
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--dry-run");
  const dryRun = process.argv.includes("--dry-run");
  const [pdfDir, contactsCsv] = args;
  if (!pdfDir || !contactsCsv) {
    console.error(
      "Usage: npx tsx scripts/sync-abby-invoices.ts <dossier-pdfs> <contacts.csv> [--dry-run]"
    );
    process.exit(1);
  }

  const contacts = parseContacts(contactsCsv);
  const files = readdirSync(pdfDir).filter((f) => f.endsWith(".pdf"));
  console.log(`Traitement de ${files.length} facture(s) PDF...`);

  const itemsByKey = new Map<string, ImportItem & { _plate?: string | null }>();
  const unmatchedClients = new Set<string>();
  let skippedDrafts = 0;

  for (const file of files) {
    const buffer = readFileSync(path.join(pdfDir, file));
    const { text } = await pdfParse(buffer);
    const invoiceNum = file.replace(/\.pdf$/i, "");

    if (/BROUILLON/.test(text)) {
      skippedDrafts++;
      continue;
    }

    const facMatch = text.match(/Facture\n([\s\S]*?)\n(?:F-\d{4}-\d{4}|Document provisoire)/);
    const designation = facMatch ? facMatch[1].trim() : null;

    const dateMatch = text.match(/Date d'émission\n?(\d{2}\/\d{2}\/\d{4})/);
    const date = dateMatch ? parseDdMmYyyy(dateMatch[1]) : null;

    const headerBlock = text.split("#Désignation")[0];
    const dateSplitParts = headerBlock.split(/\d{2}\/\d{2}\/\d{4}\n/);
    let clientName: string | null = null;
    if (dateSplitParts.length > 1) {
      const clientBlock = dateSplitParts.pop()!.trim();
      clientName = clientBlock.split("\n").filter(Boolean)[0] || null;
    }

    const itemsMatch = text.match(
      /#Désignation et descriptionUnitéQuantitéPrix unitaireMontant HT\n([\s\S]*?)\nConditions de paiement/
    );
    const itemsBlock = itemsMatch ? itemsMatch[1] : "";
    const cleanedDescription = itemsBlock
      .replace(/Prestation de service/g, "")
      .replace(/TVA non applicable[^\n]*/gi, "")
      .replace(/\n{2,}/g, "\n")
      .split("\n")
      .map((l: string) => l.trim())
      .filter(Boolean)
      .join(" | ");

    const totalFinalMatch = text.match(/Total HT final\s*(\d[\d\s]*,\d{2})\s*€/);
    const totalMatch = text.match(/Total HT\s*(\d[\d\s]*,\d{2})\s*€/);
    const amount = parseAmount(totalFinalMatch?.[1] || totalMatch?.[1]);
    const maintenanceTypeKey = detectMaintenanceType(itemsBlock);

    if (!clientName || !date) continue;

    const contact = findContact(contacts, clientName);
    let firstName: string;
    let lastName: string;
    if (contact) {
      firstName = contact.firstName;
      lastName = contact.lastName;
    } else {
      unmatchedClients.add(clientName);
      const parts = clientName.trim().split(/\s+/);
      firstName = parts[0] || clientName;
      lastName = parts.slice(1).join(" ") || "(organisation)";
    }
    const abbyReference = normalizeName(clientName);

    const { make, plate, mileage } = parseDesignation(designation);
    const vehicleKey = `${abbyReference}::${plate || "noplate"}`;

    if (!itemsByKey.has(vehicleKey)) {
      itemsByKey.set(vehicleKey, {
        client: {
          firstName,
          lastName,
          email: contact?.email ?? null,
          phone: contact?.phone ?? null,
          address: contact?.address ?? null,
          abbyReference,
        },
        vehicle: plate || make || mileage ? { plate, make, mileage } : null,
        interventions: [],
      });
    }

    const item = itemsByKey.get(vehicleKey)!;
    item.interventions!.push({
      date: date!,
      description: cleanedDescription || designation || invoiceNum,
      price: amount,
      maintenanceTypeKey,
      abbyInvoiceNumber: invoiceNum,
    });
  }

  const items = Array.from(itemsByKey.values()).filter((i) => i.vehicle && i.interventions?.length);
  const totalInvoices = items.reduce((n, i) => n + (i.interventions?.length ?? 0), 0);
  console.log(
    `${items.length} groupe(s) client/véhicule, ${totalInvoices} facture(s) au total (${skippedDrafts} brouillon(s) ignoré(s)).`
  );
  if (unmatchedClients.size > 0) {
    console.log(`Clients sans fiche contact trouvée : ${[...unmatchedClients].join(", ")}`);
  }

  if (dryRun) {
    console.log("--dry-run : aucune écriture en base. Aperçu des factures détectées :");
    for (const item of items) {
      for (const inv of item.interventions ?? []) {
        console.log(`  ${inv.abbyInvoiceNumber} — ${item.client.firstName} ${item.client.lastName} — ${inv.price}€`);
      }
    }
    await prisma.$disconnect();
    return;
  }

  const results = await importBatch(items);
  const created = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success);
  console.log(`Import terminé : ${created} traité(s), ${failed.length} erreur(s).`);
  failed.forEach((f) => console.log(`  - ligne ${f.index}: ${f.error}`));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
