import { NextResponse } from "next/server";
import { getClientById, updateClient, deleteClient } from "@/services/admin/clients";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const client = await getClientById(id);

    if (!client) {
      return NextResponse.json({ success: false, error: "Client introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error("Erreur API Admin Client (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();
    const client = await updateClient(id, body);
    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error("Erreur API Admin Client (PATCH):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    await deleteClient(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API Admin Client (DELETE):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
