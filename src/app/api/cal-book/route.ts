import { NextResponse } from "next/server";
import { getEventTypeId } from "@/app/data/zoneSchedule";

const CALCOM_API_VERSION_BOOKINGS = "2024-08-13";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    duree,
    start, // ISO string du créneau choisi
    nom,
    email,
    telephone,
    commune,
    modele,
    immatriculation,
    description,
    distanceKm,
    vehicleTierLabel,
    estimatedPrice,
  } = body;

  const eventTypeId = getEventTypeId(duree);
  if (!eventTypeId || !start || !nom || !email || !commune || !modele || !immatriculation || !description) {
    return NextResponse.json(
      { success: false, error: "Informations manquantes pour la réservation" },
      { status: 400 }
    );
  }

  const fullDescription = vehicleTierLabel
    ? `${description} — Véhicule : ${vehicleTierLabel}`
    : description;

  const notesParts: string[] = [];
  if (typeof distanceKm === "number") notesParts.push(`distanceKm=${distanceKm}`);
  if (typeof estimatedPrice === "number") notesParts.push(`estimatedPrice=${estimatedPrice}`);

  const calRes = await fetch("https://api.cal.com/v2/bookings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
      "cal-api-version": CALCOM_API_VERSION_BOOKINGS,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventTypeId,
      start,
      attendee: {
        name: nom,
        email,
        phoneNumber: telephone || undefined,
        timeZone: "Europe/Paris",
        language: "fr",
      },
      bookingFieldsResponses: {
        address: commune,
        modele,
        immatriculation,
        description: fullDescription,
        devis: "Non",
        piece: "Oui",
        ...(notesParts.length > 0 ? { notes: notesParts.join(";") } : {}),
      },
    }),
  });

  const result = await calRes.json();

  if (!calRes.ok) {
    return NextResponse.json(
      { success: false, error: result?.error?.message ?? "Erreur lors de la réservation" },
      { status: calRes.status }
    );
  }

  return NextResponse.json({ success: true, booking: result });
}
