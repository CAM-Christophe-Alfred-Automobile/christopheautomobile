import { NextResponse } from "next/server";
import { updateMaintenanceType, deleteMaintenanceType } from "@/services/admin/maintenanceTypes";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();
    const type = await updateMaintenanceType(id, body);
    return NextResponse.json({ success: true, type });
  } catch (error) {
    console.error("Erreur API Admin Maintenance Type (PATCH):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    await deleteMaintenanceType(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API Admin Maintenance Type (DELETE):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
