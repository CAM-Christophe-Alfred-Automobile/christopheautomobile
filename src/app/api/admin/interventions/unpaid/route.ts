import { NextResponse } from "next/server";
import { listUnpaidInterventions } from "@/services/admin/interventions";

export async function GET() {
  try {
    const interventions = await listUnpaidInterventions();
    return NextResponse.json({ success: true, interventions });
  } catch (error) {
    console.error("Erreur API Admin Unpaid (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
