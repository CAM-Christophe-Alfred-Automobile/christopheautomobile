import { NextResponse } from "next/server";
import { reportMaintenanceDoneByClient } from "@/services/public/vehicle";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.maintenanceTypeId || !body.lastDoneDate) {
      return NextResponse.json(
        { success: false, error: "Type d'entretien et date requis." },
        { status: 400 }
      );
    }

    const date = new Date(body.lastDoneDate);
    if (Number.isNaN(date.getTime()) || date > new Date()) {
      return NextResponse.json({ success: false, error: "Date invalide." }, { status: 400 });
    }

    await reportMaintenanceDoneByClient(id, body.maintenanceTypeId, date);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API Vehicule Maintenance (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
