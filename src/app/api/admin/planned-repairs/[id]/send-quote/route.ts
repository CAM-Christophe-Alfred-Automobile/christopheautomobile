import { NextResponse } from "next/server";
import { getPlannedRepairWithContext } from "@/services/admin/plannedRepairs";
import { sendQuoteEmail } from "@/services/admin/quoteEmail";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const repair = await getPlannedRepairWithContext(id);

    if (!repair) {
      return NextResponse.json({ success: false, error: "Réparation introuvable." }, { status: 404 });
    }
    if (!repair.vehicle.client.email) {
      return NextResponse.json(
        { success: false, error: "Ce client n'a pas d'adresse email enregistrée." },
        { status: 400 }
      );
    }

    const vehicleLabel =
      [repair.vehicle.make, repair.vehicle.model, repair.vehicle.plate].filter(Boolean).join(" ") ||
      "votre véhicule";

    await sendQuoteEmail({
      to: repair.vehicle.client.email,
      clientFirstName: repair.vehicle.client.firstName,
      vehicleLabel,
      description: repair.description,
      partsNote: repair.partsNote,
      estimatedPrice: repair.estimatedPrice != null ? Number(repair.estimatedPrice) : null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API Admin Planned Repair Send Quote (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
