import { NextResponse } from "next/server";
import { listPersonalClients } from "@/services/admin/clients";

export async function GET() {
  try {
    const clients = await listPersonalClients();
    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error("Erreur API Admin Personal Vehicles (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
