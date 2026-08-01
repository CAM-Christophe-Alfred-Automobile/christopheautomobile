export type ColumnMapping =
  | { mode: "single"; date: string; description: string; amount: string }
  | { mode: "debit_credit"; date: string; description: string; debit: string; credit: string };

export type ParsedImportRow = {
  date: string; // ISO date
  description: string;
  amount: number;
  isDuplicate: boolean;
  externalId?: string; // set for bank-synced rows, used for strict dedup via Transaction.externalId
  categoryId?: string | null; // per-row auto-categorization (e.g. Revolut PDF import); falls back to the batch default when unset
};

const DATE_HEADER_HINTS = ["date", "date opération", "date operation", "date valeur"];
const DESCRIPTION_HEADER_HINTS = ["libellé", "libelle", "description", "intitulé", "intitule", "détail", "detail"];
const AMOUNT_HEADER_HINTS = ["montant", "amount"];
const DEBIT_HEADER_HINTS = ["débit", "debit"];
const CREDIT_HEADER_HINTS = ["crédit", "credit"];

function findHeader(headers: string[], hints: string[]): string | undefined {
  const normalized = headers.map((h) => ({ raw: h, norm: h.trim().toLowerCase() }));
  for (const hint of hints) {
    const match = normalized.find((h) => h.norm === hint);
    if (match) return match.raw;
  }
  for (const hint of hints) {
    const match = normalized.find((h) => h.norm.includes(hint));
    if (match) return match.raw;
  }
  return undefined;
}

/** Best-effort column mapping guess for common French bank CSV exports. */
export function guessColumnMapping(headers: string[]): ColumnMapping | null {
  const date = findHeader(headers, DATE_HEADER_HINTS);
  const description = findHeader(headers, DESCRIPTION_HEADER_HINTS);
  if (!date || !description) return null;

  const debit = findHeader(headers, DEBIT_HEADER_HINTS);
  const credit = findHeader(headers, CREDIT_HEADER_HINTS);
  if (debit && credit) {
    return { mode: "debit_credit", date, description, debit, credit };
  }

  const amount = findHeader(headers, AMOUNT_HEADER_HINTS);
  if (amount) {
    return { mode: "single", date, description, amount };
  }

  return null;
}

/** Parses "1 234,56" (French) or "1,234.56" / "65.50" (US) into a JS number. */
export function parseFrenchAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let cleaned = trimmed.replace(/\s/g, "");
  if (cleaned.includes(",")) {
    // Comma present: treat it as the decimal separator, strip dots (thousands).
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  }

  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/** Parses "12/07/2026" or "2026-07-12" into a normalized UTC-midnight Date. */
export function parseFlexibleDate(raw: string): Date | null {
  const trimmed = raw.trim();
  const frMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (frMatch) {
    const [, d, m, y] = frMatch;
    const year = y.length === 2 ? Number(`20${y}`) : Number(y);
    const date = new Date(Date.UTC(year, Number(m) - 1, Number(d)));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export function applyMapping(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): { rows: ParsedImportRow[]; errors: number } {
  const result: ParsedImportRow[] = [];
  let errors = 0;

  for (const row of rows) {
    const date = parseFlexibleDate(row[mapping.date] ?? "");
    const description = (row[mapping.description] ?? "").trim() || "(sans libellé)";

    let amount: number | null = null;
    if (mapping.mode === "single") {
      amount = parseFrenchAmount(row[mapping.amount] ?? "");
    } else {
      const debit = parseFrenchAmount(row[mapping.debit] ?? "") ?? 0;
      const credit = parseFrenchAmount(row[mapping.credit] ?? "") ?? 0;
      amount = credit - Math.abs(debit);
    }

    if (!date || amount === null) {
      errors += 1;
      continue;
    }

    result.push({ date: date.toISOString(), description, amount, isDuplicate: false });
  }

  return { rows: result, errors };
}
