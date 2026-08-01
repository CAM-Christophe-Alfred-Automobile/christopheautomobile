import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Full data export as JSON — a safety net independent of Vercel/Neon, downloadable
 * on demand from Settings. Includes every table needed to reconstruct the app's state. */
export async function GET() {
  const [accounts, categories, transactions, recurringItems, plannedPurchases, financeSettings] = await Promise.all([
    prisma.account.findMany(),
    prisma.category.findMany(),
    prisma.transaction.findMany(),
    prisma.recurringItem.findMany(),
    prisma.plannedPurchase.findMany(),
    prisma.financeSettings.findMany(),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    accounts,
    categories,
    transactions,
    recurringItems,
    plannedPurchases,
    financeSettings,
  };

  const dateStamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="camfinance-sauvegarde-${dateStamp}.json"`,
    },
  });
}
