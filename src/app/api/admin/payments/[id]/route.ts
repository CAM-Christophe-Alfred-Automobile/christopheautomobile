import { NextResponse } from "next/server";
import { removePayment } from "@/services/admin/interventions";

interface Context {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    await removePayment(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API Admin Payment (DELETE):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
