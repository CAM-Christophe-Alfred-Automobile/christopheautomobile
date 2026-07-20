import { NextResponse } from "next/server";
import { findVehicleByPlate } from "@/services/admin/vehicles";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const plate = searchParams.get("plate") || "";

    if (plate.length < 4) {
      return NextResponse.json({ success: true, vehicle: null });
    }

    const vehicle = await findVehicleByPlate(plate);
    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("Erreur API Admin Vehicle Search (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
