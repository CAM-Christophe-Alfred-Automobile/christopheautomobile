import { NextResponse } from "next/server";
import { updateIntervention, deleteIntervention, getInterventionWithContext } from "@/services/admin/interventions";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const intervention = await getInterventionWithContext(id);

    if (!intervention) {
      return NextResponse.json({ success: false, error: "Intervention introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true, intervention });
  } catch (error) {
    console.error("Erreur API Admin Intervention (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();
    const intervention = await updateIntervention(id, {
      ...body,
      ...(body.date ? { date: new Date(body.date) } : {}),
      ...(body.endDate !== undefined ? { endDate: body.endDate ? new Date(body.endDate) : null } : {}),
      ...(body.chronoStartedAt !== undefined
        ? { chronoStartedAt: body.chronoStartedAt ? new Date(body.chronoStartedAt) : null }
        : {}),
    });
    return NextResponse.json({ success: true, intervention });
  } catch (error) {
    console.error("Erreur API Admin Intervention (PATCH):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    await deleteIntervention(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API Admin Intervention (DELETE):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
