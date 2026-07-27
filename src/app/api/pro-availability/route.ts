import { NextResponse } from "next/server";
import { proEventTypes, type ProBookingType } from "@/app/data/proSchedule";

const CALCOM_API_VERSION_SLOTS = "2024-09-04";

function isProBookingType(value: string | null): value is ProBookingType {
  return value === "urgence" || value === "journee";
}

// Retourne les créneaux disponibles pour un type de renfort pro (urgence ou journée complète),
// sans filtrage par secteur géographique (contrairement à la réservation grand public).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const typeParam = url.searchParams.get("type");
  const start = url.searchParams.get("start"); // YYYY-MM-DD
  const end = url.searchParams.get("end"); // YYYY-MM-DD

  if (!isProBookingType(typeParam) || !start || !end) {
    return NextResponse.json(
      { success: false, error: "Paramètres manquants (type, start, end)" },
      { status: 400 }
    );
  }

  const { eventTypeId } = proEventTypes[typeParam];

  const slotsRes = await fetch(
    `https://api.cal.com/v2/slots?eventTypeId=${eventTypeId}&start=${start}&end=${end}&timeZone=Europe/Paris`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
        "cal-api-version": CALCOM_API_VERSION_SLOTS,
      },
      cache: "no-store",
    }
  );

  if (!slotsRes.ok) {
    return NextResponse.json(
      { success: false, error: `Erreur Cal.com (${slotsRes.status})` },
      { status: 502 }
    );
  }

  const { data } = (await slotsRes.json()) as {
    data: Record<string, { start: string }[]>;
  };

  return NextResponse.json({ success: true, eventTypeId, data });
}
