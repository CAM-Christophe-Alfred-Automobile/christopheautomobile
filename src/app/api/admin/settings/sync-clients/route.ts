import { NextResponse } from "next/server";
import { parseAbbyContactsCsv, syncClientsFromAbbyContacts } from "@/services/admin/abbySync";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Aucun fichier reçu." }, { status: 400 });
    }

    const contacts = parseAbbyContactsCsv(await file.text());
    if (contacts.length === 0) {
      return NextResponse.json(
        { success: false, error: "Aucun contact valide trouvé dans le fichier." },
        { status: 400 }
      );
    }

    const results = await syncClientsFromAbbyContacts(contacts);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Erreur API Admin Sync Clients:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
