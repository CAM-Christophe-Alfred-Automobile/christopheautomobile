import { NextResponse } from "next/server";
import { addPayment } from "@/services/admin/interventions";
import { prisma } from "@/lib/prisma";
import { syncCashPayments } from "@/services/finance/cashPaymentSync";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.amount) {
      return NextResponse.json({ success: false, error: "Le montant est requis." }, { status: 400 });
    }

    const payment = await addPayment(id, {
      amount: Number(body.amount),
      method: body.method || null,
      date: body.date ? new Date(body.date) : new Date(),
      note: body.note || null,
    });

    // Synchronise tout de suite vers CAMfinance plutôt que d'attendre le cron du lendemain matin
    // — un encaissement espèces doit être visible côté finance dans la foulée, pas le lendemain.
    if (payment.method === "cash") {
      const cashAccount = await prisma.account.findFirst({ where: { type: "cash" } });
      if (cashAccount) {
        await syncCashPayments(cashAccount.id).catch((err) =>
          console.error("Synchro espèces immédiate échouée (le cron de secours passera demain matin) :", err)
        );
      }
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("Erreur API Admin Intervention Payments (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
