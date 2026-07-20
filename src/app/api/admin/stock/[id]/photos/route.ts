import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { addStockPhoto, removeStockPhoto } from "@/services/admin/stock";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Aucun fichier reçu." }, { status: 400 });
    }

    const blob = await put(`stock/${id}/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const photo = await addStockPhoto(id, blob.url);
    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error("Erreur API Admin Stock Photos (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { photoId, url } = await req.json();
    if (!photoId || !url) {
      return NextResponse.json({ success: false, error: "photoId et url requis." }, { status: 400 });
    }
    await del(url);
    await removeStockPhoto(photoId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API Admin Stock Photos (DELETE):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
