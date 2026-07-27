import { NextResponse } from "next/server";
import { getShopSettings, updateShopSettings } from "@/services/admin/shopSettings";

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

    if (body.hourlyRate !== undefined && typeof body.hourlyRate !== "number") {
      return NextResponse.json(
        { success: false, error: "hourlyRate doit être un nombre." },
        { status: 400 }
      );
    }
    if (body.urssafRate !== undefined && typeof body.urssafRate !== "number") {
      return NextResponse.json(
        { success: false, error: "urssafRate doit être un nombre." },
        { status: 400 }
      );
    }

    const settings = await updateShopSettings({
      ...(body.hourlyRate !== undefined ? { hourlyRate: body.hourlyRate } : {}),
      ...(body.urssafRate !== undefined ? { urssafRate: body.urssafRate } : {}),
    });
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Erreur API Admin Shop Settings (PATCH):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
