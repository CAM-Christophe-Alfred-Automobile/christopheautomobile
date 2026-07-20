import { NextResponse } from "next/server";
import { addIntervention } from "@/services/admin/interventions";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.date || !body.description) {
      return NextResponse.json(
        { success: false, error: "Date et description sont requises." },
        { status: 400 }
      );
    }

    const intervention = await addIntervention(id, {
      ...body,
      date: new Date(body.date),
      endDate: body.endDate ? new Date(body.endDate) : null,
    });
    return NextResponse.json({ success: true, intervention });
  } catch (error) {
    console.error("Erreur API Admin Vehicle Interventions (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
