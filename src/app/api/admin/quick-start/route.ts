import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.firstName) {
      return NextResponse.json({ success: false, error: "Le prénom du client est requis." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName || ".",
        },
      });

      const vehicle = await tx.vehicle.create({
        data: {
          clientId: client.id,
          make: body.make || null,
          model: body.model || null,
          plate: body.plate || null,
          mileage: body.mileage ? Number(body.mileage) : null,
        },
      });

      const intervention = await tx.intervention.create({
        data: {
          vehicleId: vehicle.id,
          date: new Date(),
          description: "",
          status: "draft",
        },
      });

      return { clientId: client.id, vehicleId: vehicle.id, interventionId: intervention.id };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Erreur API Admin Quick Start (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
