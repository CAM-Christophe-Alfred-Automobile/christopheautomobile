import { NextResponse } from "next/server";
import { addFuelLog } from "@/services/admin/fuelLogs";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.date || body.price == null || body.quantity == null) {
      return NextResponse.json(
        { success: false, error: "Date, prix et quantité sont requis." },
        { status: 400 }
      );
    }

    const log = await addFuelLog(id, {
      date: new Date(body.date),
      price: Number(body.price),
      quantity: Number(body.quantity),
      mileage: body.mileage != null ? Number(body.mileage) : null,
      trackedByBank: Boolean(body.trackedByBank),
    });
    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Erreur API Admin Vehicle Fuel Logs (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
