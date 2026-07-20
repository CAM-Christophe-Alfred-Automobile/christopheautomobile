import { NextResponse } from "next/server";
import { importBatch, type ImportItem } from "@/services/admin/bulkImport";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: ImportItem[] = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Le champ 'items' doit être un tableau non vide." },
        { status: 400 }
      );
    }

    const results = await importBatch(items);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Erreur API Admin Import:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
