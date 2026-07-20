import { NextResponse } from "next/server";
import { addPartUsed } from "@/services/admin/interventions";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.designation) {
      return NextResponse.json(
        { success: false, error: "La désignation est requise." },
        { status: 400 }
      );
    }

    const part = await addPartUsed(id, body);
    return NextResponse.json({ success: true, part });
  } catch (error) {
    console.error("Erreur API Admin Intervention Parts (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
