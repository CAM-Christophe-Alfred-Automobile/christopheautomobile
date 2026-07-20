import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { addInterventionPhoto, removeInterventionPhoto, type PhotoCategory } from "@/services/admin/interventions";

interface Context {
  params: Promise<{ id: string }>;
}

function parseCategory(value: FormDataEntryValue | string | null): PhotoCategory {
  return value === "before" || value === "after" || value === "damage" ? value : "damage";
}

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("file");
    const category = parseCategory(formData.get("category"));

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Aucun fichier reçu." }, { status: 400 });
    }

    const blob = await put(`interventions/${id}/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const intervention = await addInterventionPhoto(id, blob.url, category);
    return NextResponse.json({ success: true, intervention, url: blob.url });
  } catch (error) {
    console.error("Erreur API Admin Intervention Photos (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const { url, category } = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, error: "url est requis." }, { status: 400 });
    }

    const intervention = await removeInterventionPhoto(id, url, parseCategory(category));
    return NextResponse.json({ success: true, intervention });
  } catch (error) {
    console.error("Erreur API Admin Intervention Photos (DELETE):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
