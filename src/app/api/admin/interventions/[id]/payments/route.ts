import { NextResponse } from "next/server";
import { addPayment } from "@/services/admin/interventions";

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
    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("Erreur API Admin Intervention Payments (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
