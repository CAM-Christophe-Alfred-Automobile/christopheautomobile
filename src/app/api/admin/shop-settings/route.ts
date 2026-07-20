import { NextResponse } from "next/server";
import { getShopSettings, updateHourlyRate } from "@/services/admin/shopSettings";

export async function GET() {
  try {
    const settings = await getShopSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Erreur API Admin Shop Settings (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    if (typeof body.hourlyRate !== "number") {
      return NextResponse.json(
        { success: false, error: "hourlyRate doit être un nombre." },
        { status: 400 }
      );
    }

    const settings = await updateHourlyRate(body.hourlyRate);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Erreur API Admin Shop Settings (PATCH):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
