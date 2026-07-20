import { NextResponse } from "next/server";
import { listClients, createClient } from "@/services/admin/clients";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") ?? undefined;
    const clients = await listClients(query);
    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error("Erreur API Admin Clients (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { success: false, error: "Nom et prénom sont requis." },
        { status: 400 }
      );
    }

    const client = await createClient(body);
    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error("Erreur API Admin Clients (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
