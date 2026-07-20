import { NextResponse } from "next/server";
import { updatePlannedRepair, deletePlannedRepair } from "@/services/admin/plannedRepairs";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();
    const plannedRepair = await updatePlannedRepair(id, {
      ...body,
      ...(body.targetDate ? { targetDate: new Date(body.targetDate) } : {}),
    });
    return NextResponse.json({ success: true, plannedRepair });
  } catch (error) {
    console.error("Erreur API Admin Planned Repair (PATCH):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    await deletePlannedRepair(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API Admin Planned Repair (DELETE):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
