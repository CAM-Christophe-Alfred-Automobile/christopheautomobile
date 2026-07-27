import { NextResponse } from "next/server";
import { deleteFuelLog } from "@/services/admin/fuelLogs";

interface Context {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    await deleteFuelLog(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API Admin Fuel Log (DELETE):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
