import { NextResponse } from "next/server";
import { listMaintenanceTypes, createMaintenanceType } from "@/services/admin/maintenanceTypes";

export async function GET() {
  try {
    const types = await listMaintenanceTypes();
    return NextResponse.json({ success: true, types });
  } catch (error) {
    console.error("Erreur API Admin Maintenance Types (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.key || !body.label) {
      return NextResponse.json(
        { success: false, error: "Clé et libellé sont requis." },
        { status: 400 }
      );
    }

    const type = await createMaintenanceType(body);
    return NextResponse.json({ success: true, type });
  } catch (error) {
    console.error("Erreur API Admin Maintenance Types (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
