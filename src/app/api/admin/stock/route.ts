import { NextResponse } from "next/server";
import { listStockParts, createStockPart } from "@/services/admin/stock";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim() || undefined;
    const parts = await listStockParts(q);
    return NextResponse.json({ success: true, parts });
  } catch (error) {
    console.error("Erreur API Admin Stock (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Le nom de la pièce est requis." },
        { status: 400 }
      );
    }
    const part = await createStockPart(body);
    return NextResponse.json({ success: true, part });
  } catch (error) {
    console.error("Erreur API Admin Stock (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
