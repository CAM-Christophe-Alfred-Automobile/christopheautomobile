import { prisma } from "@/lib/prisma";
import { commitImport, type ParsedImportRow } from "@/services/finance/csvImport";
import { getOrCreateCategory } from "@/services/finance/categories";

const LOOKBACK_DAYS = 180;

/**
 * Reprend les encaissements espèces du CRM (Payment.method === "cash") et les enregistre
 * via le pipeline commitImport() partagé (type="synced") — même requête que l'ancienne
 * route /api/finance-sync, mais en local puisque CAMfinance vit désormais dans la même
 * base/appli que le CRM.
 */
export async function syncCashPayments(accountId: string): Promise<{ imported: number; skipped: number }> {
  const account = await prisma.account.findUniqueOrThrow({ where: { id: accountId } });
  const scope = account.scope as "PRO" | "PERSO";

  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const rows = await prisma.payment.findMany({
    where: { method: "cash", date: { gte: since } },
    include: { intervention: { include: { vehicle: { include: { client: true } } } } },
    orderBy: { date: "asc" },
  });

  const categoryId = await getOrCreateCategory("Encaissements espèces clients", scope, "income");

  const importRows: (ParsedImportRow & { externalId: string })[] = rows.map((p) => ({
    date: p.date.toISOString(),
    description: [
      `${p.intervention.vehicle.client.firstName} ${p.intervention.vehicle.client.lastName}`.trim(),
      `${p.intervention.vehicle.make} ${p.intervention.vehicle.model}`.trim(),
      p.intervention.description,
    ]
      .filter(Boolean)
      .join(" — "),
    amount: Math.abs(Number(p.amount)),
    isDuplicate: false,
    externalId: `crm-${p.id}`,
    categoryId,
  }));

  return commitImport({
    accountId,
    scope,
    fileName: `cam-cash-sync:${new Date().toISOString().slice(0, 10)}`,
    columnMapping: {},
    categoryId: null,
    rows: importRows,
    type: "synced",
    source: "crm_cash",
  });
}
