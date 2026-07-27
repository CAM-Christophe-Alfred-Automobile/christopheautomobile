import { NextResponse } from "next/server";
import { proEventTypes, type ProBookingType } from "@/app/data/proSchedule";

const CALCOM_API_VERSION_BOOKINGS = "2024-08-13";

function isProBookingType(value: unknown): value is ProBookingType {
  return value === "urgence" || value === "journee";
}

export async function POST(req: Request) {
  const body = await req.json();
  const { type, start, nom, email, telephone, entreprise, adresse, besoin } = body;

  if (
    !isProBookingType(type) ||
    !start ||
    !nom ||
    !email ||
    !telephone ||
    !entreprise ||
    !adresse ||
    !besoin
  ) {
    return NextResponse.json(
      { success: false, error: "Informations manquantes pour la réservation" },
      { status: 400 }
    );
  }

  const { eventTypeId } = proEventTypes[type];

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
        phoneNumber: telephone,
        timeZone: "Europe/Paris",
        language: "fr",
      },
      bookingFieldsResponses: {
        entreprise,
        adresse,
        besoin,
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
