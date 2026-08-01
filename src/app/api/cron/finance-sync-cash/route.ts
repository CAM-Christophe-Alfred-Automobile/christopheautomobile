import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncCashPayments } from "@/services/finance/cashPaymentSync";
import { syncFuelExpenses } from "@/services/finance/fuelExpenseSync";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }

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
}
