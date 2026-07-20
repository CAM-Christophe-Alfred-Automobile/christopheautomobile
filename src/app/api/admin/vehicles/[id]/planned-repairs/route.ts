import { NextResponse } from "next/server";
import { addPlannedRepair } from "@/services/admin/plannedRepairs";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.description) {
      return NextResponse.json(
        { success: false, error: "La description est requise." },
        { status: 400 }
      );
    }

    const plannedRepair = await addPlannedRepair(id, {
      ...body,
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
    });
    return NextResponse.json({ success: true, plannedRepair });
  } catch (error) {
    console.error("Erreur API Admin Planned Repairs (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
