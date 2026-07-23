import { NextResponse } from "next/server";
import { reassignVehicleOwner } from "@/services/admin/vehicles";
import { createClient } from "@/services/admin/clients";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();

    let newClientId: string | undefined = body.newClientId;

    if (!newClientId && body.newClient) {
      if (!body.newClient.firstName || !body.newClient.lastName) {
        return NextResponse.json(
          { success: false, error: "Nom et prénom du nouveau client sont requis." },
          { status: 400 }
        );
      }
      const created = await createClient(body.newClient);
      newClientId = created.id;
    }

    if (!newClientId) {
      return NextResponse.json(
        { success: false, error: "newClientId ou newClient est requis." },
        { status: 400 }
      );
    }

    const vehicle = await reassignVehicleOwner(id, newClientId);
    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("Erreur API Admin Vehicle Reassign (PATCH):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
