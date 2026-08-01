import type { ParsedImportRow } from "@/lib/finance/csvParsing";

const MONTHS: Record<string, number> = {
  "janv.": 0, "févr.": 1, "mars": 2, "avr.": 3, "mai": 4, "juin": 5,
  "juil.": 6, "août": 7, "sept.": 8, "oct.": 9, "nov.": 10, "déc.": 11,
};

const DATE_RE = /^(\d{1,2}) (janv\.|févr\.|mars|avr\.|mai|juin|juil\.|août|sept\.|oct\.|nov\.|déc\.) (\d{4})/;
const DETAIL_LINE_RE = /^(À :|Référence :|Carte :|De :|Frais:)/;
const AMOUNT_RE = /-?[\d\s]+,\d{2}€/g;

/** French bank PDF exports commonly use non-breaking spaces (U+00A0) around punctuation. */
function normalizeNbsp(text: string): string {
  return text.split(String.fromCharCode(160)).join(" ");
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".").replace("€", "");
  return Number(cleaned);
}

function toIsoDate(day: string, monthToken: string, year: string): string {
  const month = MONTHS[monthToken];
  return new Date(Date.UTC(Number(year), month, Number(day))).toISOString();
}

export type StatementSummary = {
  opening: number;
  totalOut: number;
  totalIn: number;
  closing: number;
};

/** Extracts the "Total" row's opening/closing balances from the "Résumé du solde" section. */
export function parseSummary(text: string): StatementSummary {
  const m = text.match(/Total(-?[\d\s]+,\d{2})€(-?[\d\s]+,\d{2})€(-?[\d\s]+,\d{2})€(-?[\d\s]+,\d{2})€/);
  if (!m) throw new Error("Résumé du solde introuvable dans ce PDF");
  return { opening: parseAmount(m[1]), totalOut: parseAmount(m[2]), totalIn: parseAmount(m[3]), closing: parseAmount(m[4]) };
}

/** Extracts a specific product row's balances (e.g. "Compte (Compte courant)"), falling back to Total. */
export function parseProductRow(text: string, label: string): StatementSummary {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}(-?[\\d\\s]+,\\d{2})€(-?[\\d\\s]+,\\d{2})€(-?[\\d\\s]+,\\d{2})€(-?[\\d\\s]+,\\d{2})€`);
  const m = text.match(re);
  if (!m) return parseSummary(text);
  return { opening: parseAmount(m[1]), totalOut: parseAmount(m[2]), totalIn: parseAmount(m[3]), closing: parseAmount(m[4]) };
}

type RawRow = { date: string; description: string; amount: number; soldeAfter: number };

/**
 * Parses the main transaction table between `startPattern` and `endPattern` (or end of text).
 * Both are matched as regexes against a *whole line* so the parser doesn't need to know the
 * exact date range printed in the header (it changes on every statement export). Amount is
 * derived from the delta between this row's stated running balance and the previous row's —
 * robust against column-order ambiguity, multi-line description wraps, and card-terminal fee
 * sub-lines.
 */
function parseTransactionSection(
  text: string,
  startPattern: RegExp,
  endPattern: RegExp | null,
  openingBalance: number
): { rows: RawRow[]; finalSolde: number } {
  const startMatch = text.match(startPattern);
  if (!startMatch || startMatch.index === undefined) {
    throw new Error(`Section de transactions introuvable (motif: ${startPattern})`);
  }
  const searchFrom = startMatch.index + startMatch[0].length;

  let endIdx = -1;
  if (endPattern) {
    const endMatch = text.slice(searchFrom).match(endPattern);
    if (endMatch && endMatch.index !== undefined) endIdx = searchFrom + endMatch.index;
  }
  const section = endIdx === -1 ? text.slice(searchFrom) : text.slice(searchFrom, endIdx);

  const lines = section.split("\n");
  const blocks: { date: string; lines: string[] }[] = [];
  let current: { date: string; lines: string[] } | null = null;

  for (const line of lines) {
    const dateMatch = line.match(DATE_RE);
    if (dateMatch) {
      if (current) blocks.push(current);
      current = { date: toIsoDate(dateMatch[1], dateMatch[2], dateMatch[3]), lines: [line] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) blocks.push(current);

  const rows: RawRow[] = [];
  let prevSolde = openingBalance;

  for (const block of blocks) {
    let headerEnd = block.lines.length;
    for (let i = 1; i < block.lines.length; i++) {
      if (DETAIL_LINE_RE.test(block.lines[i].trim())) {
        headerEnd = i;
        break;
      }
    }
    const headerText = block.lines.slice(0, headerEnd).join(" ");
    const amounts = headerText.match(AMOUNT_RE);
    if (!amounts || amounts.length === 0) continue; // no amount on this block, skip defensively

    const solde = parseAmount(amounts[amounts.length - 1]);
    const amount = Math.round((solde - prevSolde) * 100) / 100;
    prevSolde = solde;

    const description = headerText.replace(DATE_RE, "").replace(AMOUNT_RE, "").replace(/\s+/g, " ").trim();

    rows.push({ date: block.date, description, amount, soldeAfter: solde });
  }

  return { rows, finalSolde: prevSolde };
}

export type RevolutStatementType = "courant" | "pro" | "joint";

/** Identifies which of Christophe's 3 tracked Revolut statements this PDF is, from its title. */
export function detectStatementType(text: string): RevolutStatementType {
  if (/Relevé de compte joint/i.test(text)) return "joint";
  if (/Transactions Pro de|Entrepreneur Individuel/i.test(text)) return "pro";
  return "courant";
}

const TRANSACTIONS_START_RE: Record<RevolutStatementType, RegExp> = {
  courant: /Transactions du compte[^\n]*\n/,
  joint: /Transactions du compte[^\n]*\n/,
  pro: /Transactions Pro de[^\n]*\n/,
};

/** Signals the end of the main dated transaction table (pending/reversed items, or the savings sub-ledger). */
const TRANSACTIONS_END_RE = /(Renvoyé de[^\n]*\n|Transactions de dépôt[^\n]*\n)/;

export type ParsedRevolutStatement = {
  statementType: RevolutStatementType;
  rows: ParsedImportRow[];
  totalRowsFound: number;
};

/**
 * Parses a Revolut PDF statement (raw pdf-parse text output) into transactions ready for
 * CAMfinance's existing CSV import pipeline (flagDuplicates + commitImport).
 *
 * Only exclusion applied: "Compte d'épargne" (savings pocket) rows — excluded per explicit
 * user decision, since that pocket is tracked separately. "EUR Pro"/"EUR Personal" pockets
 * and "Fonds monétaires flexibles" (auto-invest) rows are imported normally: they are internal
 * to *this* account (the separate Pro business account has its own identically-named pockets),
 * not a transfer to another tracked account — excluding or transferring them was an early bug
 * that made computed balances diverge from the statement's real closing balance by ~1800€.
 */
export function parseRevolutPdf(rawText: string): ParsedRevolutStatement {
  const text = normalizeNbsp(rawText);
  const statementType = detectStatementType(text);

  const summary =
    statementType === "courant" ? parseProductRow(text, "Compte (Compte courant)") : parseSummary(text);

  const { rows: rawRows } = parseTransactionSection(
    text,
    TRANSACTIONS_START_RE[statementType],
    TRANSACTIONS_END_RE,
    summary.opening
  );

  const rows: ParsedImportRow[] = [];
  for (const row of rawRows) {
    if (/Compte d'épargne/i.test(row.description)) continue;
    rows.push({ date: row.date, description: row.description, amount: row.amount, isDuplicate: false });
  }

  return { statementType, rows, totalRowsFound: rawRows.length };
}
