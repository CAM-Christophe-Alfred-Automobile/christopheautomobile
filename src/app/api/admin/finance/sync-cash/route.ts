import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncCashPayments } from "@/services/finance/cashPaymentSync";
import { syncFuelExpenses } from "@/services/finance/fuelExpenseSync";

export async function POST() {
  try {
    const accounts = await prisma.account.findMany({ where: { type: "cash" } });

    const results = [];
    for (const account of accounts) {
      const cash = await syncCashPayments(account.id);
      const fuel = await syncFuelExpenses(account.id);
      results.push({
        accountId: account.id,
        accountName: account.name,
        imported: cash.imported + fuel.imported,
        skipped: cash.skipped + fuel.skipped,
      });
    }

    return NextResponse.json({ success: true, accounts: results });
  } catch (error) {
    console.error("Erreur API Admin Finance Sync Cash (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
