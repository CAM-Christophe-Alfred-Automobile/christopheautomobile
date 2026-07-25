import { NextResponse } from "next/server";
import { zones, getEventTypeId } from "@/app/data/zoneSchedule";

const CALCOM_API_VERSION_SLOTS = "2024-09-04";

// Retourne les créneaux disponibles pour une durée + un secteur donnés,
// en ne gardant que les jours autorisés pour ce secteur.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const dureeParam = url.searchParams.get("duree");
  const zoneKey = url.searchParams.get("zone");
  const start = url.searchParams.get("start"); // YYYY-MM-DD
  const end = url.searchParams.get("end"); // YYYY-MM-DD

  const duree = dureeParam ? parseInt(dureeParam, 10) : NaN;
  const zone = zones.find((z) => z.key === zoneKey);

  if (!duree || !zone || !start || !end) {
    return NextResponse.json(
      { success: false, error: "Paramètres manquants (duree, zone, start, end)" },
      { status: 400 }
    );
  }

  const eventTypeId = getEventTypeId(duree);
  if (!eventTypeId) {
    return NextResponse.json(
      { success: false, error: "Durée non reconnue" },
      { status: 400 }
    );
  }

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

  // Filtre : ne garder que les jours correspondant au secteur (weekday), sauf jour libre (null = tous acceptés)
  const filtered: Record<string, { start: string }[]> = {};
  for (const [date, slots] of Object.entries(data)) {
    const jsWeekday = new Date(`${date}T12:00:00`).getDay(); // 0=dim ... 6=sam
    if (zone.weekday === null || jsWeekday === zone.weekday) {
      filtered[date] = slots;
    }
  }

  return NextResponse.json({ success: true, eventTypeId, data: filtered });
}
