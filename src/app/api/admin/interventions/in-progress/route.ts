import { NextResponse } from "next/server";
import { listInProgressInterventions } from "@/services/admin/interventions";

export async function GET() {
  try {
    const interventions = await listInProgressInterventions();
    return NextResponse.json({ success: true, interventions });
  } catch (error) {
    console.error("Erreur API Admin Interventions In-Progress (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
