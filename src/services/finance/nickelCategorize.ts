import { getOrCreateCategory } from "@/services/finance/categories";

/** Rule-based categorization for Nickel transaction descriptions, same spirit as
 * revolutCategorize.ts. Nickel statements only cover the perso account so far. */
export async function categorizeNickelRow(description: string): Promise<string | null> {
  const d = description;

  if (/Amazon/i.test(d)) return getOrCreateCategory("Courses", "PERSO", "expense");
  if (/Autoroutes|Escota|TotalEnergies|Station-service|^Indigo|Agip|Dyneff/i.test(d))
    return getOrCreateCategory("Carburant", "PERSO", "expense");
  if (/Autodoc/i.test(d)) return null;
  if (/Adventure Land|Basic Fit/i.test(d)) return getOrCreateCategory("Loisirs", "PERSO", "expense");

  return null;
}
