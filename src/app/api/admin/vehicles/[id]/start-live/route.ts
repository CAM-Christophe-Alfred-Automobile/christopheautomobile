import { NextResponse } from "next/server";
import { startDraftIntervention } from "@/services/admin/interventions";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const intervention = await startDraftIntervention(id);
    return NextResponse.json({ success: true, interventionId: intervention.id });
  } catch (error) {
    console.error("Erreur API Admin Vehicle Start Live (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
