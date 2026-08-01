import { getOrCreateCategory } from "@/services/finance/categories";
import type { RevolutStatementType } from "@/lib/finance/revolutPdfParsing";

/**
 * Rule-based categorization for Revolut transaction descriptions, tuned to Christophe's
 * 3 tracked statements. Rules were derived from (and validated against) the real historical
 * import.
 */
export async function categorizeRevolutRow(description: string, statementType: RevolutStatementType): Promise<string | null> {
  const d = description;

  if (statementType === "pro") {
    if (/^Abby\b/i.test(d)) return getOrCreateCategory("Abonnements pro", "PRO", "expense");
    if (/^Merchant payment/i.test(d) || /^Paiement envoyé par/i.test(d))
      return getOrCreateCategory("Ventes / prestations", "PRO", "income");
    if (/Urssaf/i.test(d)) return getOrCreateCategory("URSSAF", "PRO", "expense");
    if (/^Autodoc|^eBay/i.test(d)) return getOrCreateCategory("Fournitures / pièces", "PRO", "expense");
    if (/Etik ?Assura/i.test(d)) return getOrCreateCategory("Assurance pro", "PRO", "expense");
    if (/TotalEnergies|Escota|Autoroutes|VINCI/i.test(d)) return getOrCreateCategory("Carburant", "PRO", "expense");
    if (/Fonds monétaires flexibles/i.test(d)) return getOrCreateCategory("Épargne automatique", "PRO", "expense");
    return null;
  }

  if (statementType === "joint") {
    if (/Semisap/i.test(d)) return getOrCreateCategory("Loyer / crédit logement", "PERSO", "expense");
    if (/Ohm Energie/i.test(d)) return getOrCreateCategory("Énergie", "PERSO", "expense");
    if (/Uneo/i.test(d)) return getOrCreateCategory("Santé / mutuelle", "PERSO", "expense");
    if (/BNP Paribas Personal Finance|FLOA Bank/i.test(d)) return getOrCreateCategory("Crédit conso", "PERSO", "expense");
    if (/Groupe Agpm/i.test(d)) return getOrCreateCategory("Assurance", "PERSO", "expense");
    if (/^Orange/i.test(d)) return getOrCreateCategory("Abonnements perso", "PERSO", "expense");
    if (/Basic Fit/i.test(d)) return getOrCreateCategory("Loisirs", "PERSO", "expense");
    return null;
  }

  // courant
  if (/Uber Eats|Amazon|Intermarch|ALDI|Lidl|Carrefour|E\.Leclerc|Grand Frais|Auchan|China Market|McDonald|Kfc|Boulangerie|Vival|Casa Italia|Zora Distrib|^Action |B&M|Iki Guys|Good Day|Brasserie|Marie Blachere|^Paul\b|Grand Buffet|Normal|RG Food|Ange Coffee|Lh Market/i.test(d))
    return getOrCreateCategory("Courses", "PERSO", "expense");
  if (/TotalEnergies|Escota|Autoroutes|VINCI|Station-service|^Indigo|Agip|Dyneff/i.test(d))
    return getOrCreateCategory("Carburant", "PERSO", "expense");
  if (/^Orange|Google (One|Play)|Microsoft|Anthropic|PlayStation/i.test(d))
    return getOrCreateCategory("Abonnements perso", "PERSO", "expense");
  if (/France Travail/i.test(d)) return getOrCreateCategory("Salaire / rémunération", "PERSO", "income");
  if (/Fonds monétaires flexibles/i.test(d)) return getOrCreateCategory("Épargne automatique", "PERSO", "expense");
  return null;
}
