import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getStockPart, updateStockPart, deleteStockPart } from "@/services/admin/stock";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const part = await getStockPart(id);
    if (!part) {
      return NextResponse.json({ success: false, error: "Pièce introuvable." }, { status: 404 });
    }
    return NextResponse.json({ success: true, part });
  } catch (error) {
    console.error("Erreur API Admin Stock Part (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();
    const part = await updateStockPart(id, body);
    return NextResponse.json({ success: true, part });
  } catch (error) {
    console.error("Erreur API Admin Stock Part (PATCH):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const part = await getStockPart(id);
    if (part?.photos.length) {
      await del(part.photos.map((p) => p.url));
    }
    await deleteStockPart(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API Admin Stock Part (DELETE):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
