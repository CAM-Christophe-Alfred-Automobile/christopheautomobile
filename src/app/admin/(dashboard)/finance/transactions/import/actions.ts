"use server";

import { revalidatePath } from "next/cache";
// @ts-expect-error - pdf-parse has no types for the classic API
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { prisma } from "@/lib/prisma";
import {
  applyMapping,
  commitImport,
  flagDuplicates,
  guessColumnMapping,
  type ColumnMapping,
  type ParsedImportRow,
} from "@/services/finance/csvImport";
import { parseRevolutPdf, type RevolutStatementType } from "@/lib/finance/revolutPdfParsing";
import { categorizeRevolutRow } from "@/services/finance/revolutCategorize";
import { parseNickelPdf, isNickelStatement } from "@/lib/finance/nickelPdfParsing";
import { categorizeNickelRow } from "@/services/finance/nickelCategorize";

export type PdfStatementType = RevolutStatementType | "nickel";

export async function guessMappingAction(headers: string[]) {
  return guessColumnMapping(headers);
}

export async function previewImportAction(
  accountId: string,
  rawRows: Record<string, string>[],
  mapping: ColumnMapping
) {
  const { rows, errors } = applyMapping(rawRows, mapping);
  const flagged = await flagDuplicates(accountId, rows);
  return { rows: flagged, errors };
}

export async function commitImportAction(params: {
  accountId: string;
  fileName: string;
  columnMapping: ColumnMapping;
  categoryId: string | null;
  rows: ParsedImportRow[];
}) {
  const account = await prisma.account.findUniqueOrThrow({ where: { id: params.accountId } });
  const result = await commitImport({
    accountId: params.accountId,
    scope: account.scope as "PRO" | "PERSO",
    fileName: params.fileName,
    columnMapping: params.columnMapping,
    categoryId: params.categoryId,
    rows: params.rows,
  });
  revalidatePath("/admin/finance/transactions");
  revalidatePath("/admin/finance");
  return result;
}

export async function parsePdfAction(formData: FormData): Promise<{
  statementType: PdfStatementType;
  fileName: string;
  rows: ParsedImportRow[];
}> {
  const file = formData.get("file") as File | null;
  const accountId = String(formData.get("accountId") || "");
  if (!file) throw new Error("Aucun fichier PDF fourni");
  if (!accountId) throw new Error("Aucun compte sélectionné");

  const buffer = Buffer.from(await file.arrayBuffer());
  const pdfData = await pdfParse(buffer);
  const text = pdfData.text as string;

  let statementType: PdfStatementType;
  let parsedRows: ParsedImportRow[];
  let categorize: (description: string) => Promise<string | null>;

  if (isNickelStatement(text)) {
    statementType = "nickel";
    parsedRows = parseNickelPdf(text).rows;
    categorize = (description: string) => categorizeNickelRow(description);
  } else {
    const revolut = parseRevolutPdf(text);
    statementType = revolut.statementType;
    parsedRows = revolut.rows;
    categorize = (description: string) => categorizeRevolutRow(description, revolut.statementType);
  }

  const categorizedRows: ParsedImportRow[] = [];
  for (const row of parsedRows) {
    const categoryId = await categorize(row.description);
    categorizedRows.push({ ...row, categoryId });
  }

  const flagged = await flagDuplicates(accountId, categorizedRows);
  return { statementType, fileName: file.name, rows: flagged };
}

export async function commitPdfImportAction(params: {
  accountId: string;
  fileName: string;
  rows: ParsedImportRow[];
}) {
  const account = await prisma.account.findUniqueOrThrow({ where: { id: params.accountId } });
  const result = await commitImport({
    accountId: params.accountId,
    scope: account.scope as "PRO" | "PERSO",
    fileName: params.fileName,
    columnMapping: {},
    categoryId: null,
    rows: params.rows,
    source: "pdf",
  });
  revalidatePath("/admin/finance/transactions");
  revalidatePath("/admin/finance");
  return result;
}
