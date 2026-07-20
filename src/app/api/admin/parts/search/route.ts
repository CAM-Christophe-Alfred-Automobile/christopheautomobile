import { NextResponse } from "next/server";
import { searchParts } from "@/services/admin/partsSearch";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") ?? "";

    if (!query.trim()) {
      return NextResponse.json({ success: true, results: [] });
    }

    const results = await searchParts(query);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Erreur API Admin Parts Search (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
