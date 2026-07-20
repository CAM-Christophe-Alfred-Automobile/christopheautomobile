import { NextResponse } from "next/server";
import { updateVehicle, deleteVehicle, setVehicleSold, getVehicleWithHistory } from "@/services/admin/vehicles";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const vehicle = await getVehicleWithHistory(id);

    if (!vehicle) {
      return NextResponse.json({ success: false, error: "Véhicule introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("Erreur API Admin Vehicle (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (typeof body.sold === "boolean") {
      const vehicle = await setVehicleSold(id, body.sold);
      return NextResponse.json({ success: true, vehicle });
    }

    const vehicle = await updateVehicle(id, body);
    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("Erreur API Admin Vehicle (PATCH):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    await deleteVehicle(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API Admin Vehicle (DELETE):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
