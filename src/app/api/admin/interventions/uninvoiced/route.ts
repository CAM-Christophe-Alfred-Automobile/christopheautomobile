import { NextResponse } from "next/server";
import { listUninvoicedInterventions } from "@/services/admin/interventions";

export async function GET() {
  try {
    const interventions = await listUninvoicedInterventions();
    return NextResponse.json({ success: true, interventions });
  } catch (error) {
    console.error("Erreur API Admin Interventions Uninvoiced (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
