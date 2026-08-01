import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/finance/dates";
import type { ColumnMapping, ParsedImportRow } from "@/lib/finance/csvParsing";

export type { ColumnMapping, ParsedImportRow } from "@/lib/finance/csvParsing";
export { guessColumnMapping, parseFrenchAmount, parseFlexibleDate, applyMapping } from "@/lib/finance/csvParsing";

/** Flags rows that likely already exist for this account (same day + same amount). */
export async function flagDuplicates(
  accountId: string,
  rows: ParsedImportRow[]
): Promise<ParsedImportRow[]> {
  if (rows.length === 0) return rows;

  const dates = rows.map((r) => new Date(r.date));
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  const existing = await prisma.transaction.findMany({
    where: { accountId, date: { gte: minDate, lte: maxDate } },
    select: { date: true, amount: true },
  });

  const existingKeys = new Set(
    existing.map((tx) => `${startOfDay(tx.date).toISOString()}|${Number(tx.amount).toFixed(2)}`)
  );

  return rows.map((row) => ({
    ...row,
    isDuplicate: existingKeys.has(`${startOfDay(new Date(row.date)).toISOString()}|${row.amount.toFixed(2)}`),
  }));
}

export async function commitImport(params: {
  accountId: string;
  scope: "PRO" | "PERSO";
  fileName: string;
  columnMapping: ColumnMapping | Record<string, never>;
  categoryId: string | null;
  rows: ParsedImportRow[];
  type?: "imported" | "synced";
  source?: "csv" | "bank_sync" | "pdf" | "crm_cash" | "crm_fuel";
}): Promise<{ imported: number; skipped: number }> {
  const { accountId, scope, fileName, columnMapping, categoryId, rows, type = "imported", source = "csv" } = params;

  const batch = await prisma.importBatch.create({
    data: {
      accountId,
      fileName,
      columnMapping: JSON.stringify(columnMapping),
      rowCount: rows.length,
      importedCount: 0,
      skippedCount: 0,
      status: "pending",
      source,
    },
  });

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      await prisma.transaction.create({
        data: {
          accountId,
          categoryId: row.categoryId !== undefined ? row.categoryId : categoryId,
          date: new Date(row.date),
          description: row.description,
          amount: row.amount,
          scope,
          type,
          externalId: row.externalId,
          importBatchId: batch.id,
        },
      });
      imported += 1;
    } catch {
      skipped += 1;
    }
  }

  await prisma.importBatch.update({
    where: { id: batch.id },
    data: { importedCount: imported, skippedCount: skipped, status: "completed" },
  });

  return { imported, skipped };
}
