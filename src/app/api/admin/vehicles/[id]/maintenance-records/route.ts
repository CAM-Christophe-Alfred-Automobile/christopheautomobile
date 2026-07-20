import { NextResponse } from "next/server";
import { listMaintenanceRecordsForVehicle, upsertMaintenanceRecord } from "@/services/admin/maintenanceRecords";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const records = await listMaintenanceRecordsForVehicle(id);
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("Erreur API Admin Maintenance Records (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.maintenanceTypeId) {
      return NextResponse.json(
        { success: false, error: "maintenanceTypeId est requis." },
        { status: 400 }
      );
    }

    const record = await upsertMaintenanceRecord(id, body.maintenanceTypeId, {
      lastDoneDate: body.lastDoneDate ? new Date(body.lastDoneDate) : null,
      lastDoneMileage: body.lastDoneMileage ?? null,
      intervalMonthsOverride: body.intervalMonthsOverride ?? null,
      intervalKmOverride: body.intervalKmOverride ?? null,
      updatedByClient: false,
    });
    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("Erreur API Admin Maintenance Records (PATCH):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
