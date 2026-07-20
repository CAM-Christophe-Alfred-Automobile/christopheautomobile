import { NextResponse } from "next/server";
import { updateClientContactByVehicle } from "@/services/public/vehicle";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: {
      firstName?: string;
      lastName?: string;
      address?: string | null;
      email?: string | null;
      phone?: string | null;
    } = {};
    if (typeof body.firstName === "string" && body.firstName.trim()) data.firstName = body.firstName.trim();
    if (typeof body.lastName === "string" && body.lastName.trim()) data.lastName = body.lastName.trim();
    if (body.address !== undefined) data.address = body.address || null;
    if (body.email !== undefined) data.email = body.email || null;
    if (body.phone !== undefined) data.phone = body.phone || null;

    await updateClientContactByVehicle(id, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API Vehicule Client (PATCH):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
