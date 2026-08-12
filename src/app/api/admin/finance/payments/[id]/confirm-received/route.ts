import { NextResponse } from "next/server";
import { confirmPaymentReceived } from "@/services/admin/interventions";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const payment = await confirmPaymentReceived(id);
    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("Erreur API Admin Finance Payments Confirm-Received (PATCH):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
