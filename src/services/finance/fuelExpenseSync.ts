import { prisma } from "@/lib/prisma";
import { commitImport, type ParsedImportRow } from "@/services/finance/csvImport";
import { getOrCreateCategory } from "@/services/finance/categories";

const LOOKBACK_DAYS = 180;

/**
 * Reprend les pleins carburant non trackés par carte (FuelLog.trackedByBank === false) et
 * les enregistre comme dépenses via commitImport() — même logique que l'ancienne route
 * /api/finance-sync, en local désormais.
 */
export async function syncFuelExpenses(accountId: string): Promise<{ imported: number; skipped: number }> {
  const account = await prisma.account.findUniqueOrThrow({ where: { id: accountId } });
  const scope = account.scope as "PRO" | "PERSO";

  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const rows = await prisma.fuelLog.findMany({
    where: { trackedByBank: false, date: { gte: since } },
    include: { vehicle: true },
    orderBy: { date: "asc" },
  });

  const categoryId = await getOrCreateCategory("Carburant", scope, "expense");

  const importRows: (ParsedImportRow & { externalId: string })[] = rows.map((f) => ({
    date: f.date.toISOString(),
    description: [
      `${f.vehicle.make ?? ""} ${f.vehicle.model ?? ""}`.trim(),
      f.vehicle.plate,
      `plein ${Number(f.quantity).toFixed(1)}L`,
    ]
      .filter(Boolean)
      .join(" — "),
    amount: -Math.abs(Number(f.price)),
    isDuplicate: false,
    externalId: `crm-fuel-${f.id}`,
    categoryId,
  }));

  return commitImport({
    accountId,
    scope,
    fileName: `cam-fuel-sync:${new Date().toISOString().slice(0, 10)}`,
    columnMapping: {},
    categoryId: null,
    rows: importRows,
    type: "synced",
    source: "crm_fuel",
  });
}
