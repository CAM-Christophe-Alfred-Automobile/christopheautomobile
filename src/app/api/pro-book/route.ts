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

  const { eventTypeId, consecutiveDays } = proEventTypes[type];

  async function bookOneDay(startIso: string) {
    const res = await fetch("https://api.cal.com/v2/bookings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
        "cal-api-version": CALCOM_API_VERSION_BOOKINGS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventTypeId,
        start: startIso,
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
    const json = await res.json();
    return { ok: res.ok, status: res.status, json };
  }

  async function cancelBooking(uid: string) {
    try {
      await fetch(`https://api.cal.com/v2/bookings/${uid}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
          "cal-api-version": CALCOM_API_VERSION_BOOKINGS,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cancellationReason: "Échec de la réservation du forfait 2 jours consécutifs" }),
      });
    } catch {
      // best-effort : si l'annulation échoue, il faudra l'annuler manuellement sur Cal.com
    }
  }

  // Réservation sur plusieurs jours consécutifs (ex. "journee" = 2 jours) : une réservation
  // Cal.com par jour, sur le même event type. Si un jour échoue après qu'un autre a réussi,
  // on annule ce qui a déjà été réservé pour ne pas facturer un engagement incomplet.
  const bookings: unknown[] = [];
  for (let i = 0; i < consecutiveDays; i++) {
    const dayStart = new Date(start);
    dayStart.setDate(dayStart.getDate() + i);
    const { ok, status, json } = await bookOneDay(dayStart.toISOString());
    if (!ok) {
      for (const booking of bookings) {
        const uid = (booking as { data?: { uid?: string }; uid?: string })?.data?.uid ?? (booking as { uid?: string })?.uid;
        if (uid) await cancelBooking(uid);
      }
      return NextResponse.json(
        { success: false, error: json?.error?.message ?? "Erreur lors de la réservation" },
        { status }
      );
    }
    bookings.push(json);
  }

  return NextResponse.json({ success: true, booking: bookings[0], bookings });
}
