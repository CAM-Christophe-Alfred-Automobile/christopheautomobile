import { NextResponse } from "next/server";
import { addVehicle } from "@/services/admin/vehicles";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();
    const vehicle = await addVehicle(id, body);
    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("Erreur API Admin Client Vehicles (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
