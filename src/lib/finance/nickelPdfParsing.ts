import type { ParsedImportRow } from "@/lib/finance/csvParsing";

const AMOUNT_RE = /(-?[\d ]+,\d{2})\s*€/;
const ROW_START_RE = /(\d{1,3})(\d{2}\/\d{2}\/\d{4})/g;

/** Operation types seen on Nickel statements — matched at the start of each row, right after
 * the date, to separate the type label from the free-text libellé that follows it. Falls back
 * to "AUTRE" (whole remainder kept as libellé) for any type not in this list, so an unfamiliar
 * operation type never crashes the import — it just loses the type/libellé split. */
const KNOWN_TYPES = ["ACHAT", "VIREMENT", "WERO", "RETRAIT", "PRELEVEMENT", "RECHARGE", "REMBOURSEMENT", "FRAIS"];

function parseAmount(raw: string): number {
  return Number(raw.replace(/\s/g, "").replace(",", "."));
}

function normalizeNbsp(text: string): string {
  return text.split(String.fromCharCode(160)).join(" ");
}

export type NickelStatementSummary = { closingDate: string; closingBalance: number };

/** Extracts "Solde disponible le DD/MM/YYYY" — the statement's closing balance and date. */
export function parseNickelSummary(text: string): NickelStatementSummary {
  const m = text.match(/Solde disponible le (\d{2})\/(\d{2})\/(\d{4})(-?[\d ]+,\d{2})\s*€/);
  if (!m) throw new Error("Solde de fin introuvable dans ce relevé Nickel");
  const [, day, month, year, amount] = m;
  return {
    closingDate: new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).toISOString(),
    closingBalance: parseAmount(amount),
  };
}

/** True if this PDF's extracted text looks like a Nickel account statement. */
export function isNickelStatement(text: string): boolean {
  return /RELEVE DE COMPTE NICKEL/i.test(text);
}

export type ParsedNickelStatement = {
  rows: ParsedImportRow[];
  summary: NickelStatementSummary;
};

/**
 * Parses a Nickel PDF statement (raw pdf-parse text). Nickel's table cells run together with no
 * separators (e.g. "101/06/2026ACHATAMAZON PAYMENTS PARIS-26,19 €" = row 1, date, type ACHAT,
 * libellé, amount), so rows are split by finding each "<row number><date>" marker rather than by
 * line breaks — some libellés (virements) span multiple physical lines.
 */
export function parseNickelPdf(rawText: string): ParsedNickelStatement {
  const text = normalizeNbsp(rawText);
  const summary = parseNickelSummary(text);

  const opsStart = text.search(/VOS OPÉRATIONS/i);
  if (opsStart === -1) throw new Error("Section « VOS OPÉRATIONS » introuvable dans ce relevé Nickel");
  const deferredStart = text.search(/OPÉRATIONS DÉBIT DIFFÉRÉ/i);
  const section = deferredStart > opsStart ? text.slice(opsStart, deferredStart) : text.slice(opsStart);

  const markers: { index: number; date: string }[] = [];
  let match: RegExpExecArray | null;
  ROW_START_RE.lastIndex = 0;
  while ((match = ROW_START_RE.exec(section)) !== null) {
    const [, , dateStr] = match;
    const [day, month, year] = dateStr.split("/");
    markers.push({
      index: match.index,
      date: new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).toISOString(),
    });
  }

  const rows: ParsedImportRow[] = [];
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index;
    const end = i + 1 < markers.length ? markers[i + 1].index : section.length;
    let block = section.slice(start, end);

    block = block.replace(/^\d{1,3}\d{2}\/\d{2}\/\d{4}/, "");

    const amountMatch = block.match(AMOUNT_RE);
    if (!amountMatch) continue;
    const amount = parseAmount(amountMatch[1]);

    let rest = block.slice(0, amountMatch.index).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    let description = rest;
    for (const type of KNOWN_TYPES) {
      if (rest.startsWith(type)) {
        description = `${rest.slice(type.length).trim()}`;
        break;
      }
    }
    if (!description) description = rest;

    rows.push({ date: markers[i].date, description, amount, isDuplicate: false });
  }

  return { rows, summary };
}
