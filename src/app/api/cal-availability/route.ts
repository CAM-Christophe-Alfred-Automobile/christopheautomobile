import { NextResponse } from "next/server";
import { zones, getEventTypeId } from "@/app/data/zoneSchedule";

const CALCOM_API_VERSION_SLOTS = "2024-09-04";

// Nombre d'occurrences à venir du jour de la zone à examiner pour détecter une
// "pause" prolongée (congés, ou simplement un jour très chargé sur plusieurs
// semaines) : si elles sont toutes vides, on bascule ce secteur en mode "tous
// les jours" pour éviter de faire attendre le client un mois pour rien.
const OCCURRENCES_TO_CHECK = 2;

// Liste les dates (YYYY-MM-DD) tombant sur un jour de semaine donné, entre deux bornes incluses.
function datesForWeekday(start: string, end: string, weekday: number): string[] {
  const result: string[] = [];
  const cur = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  while (cur <= endDate) {
    if (cur.getDay() === weekday) result.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

// Retourne les créneaux disponibles pour une durée + un secteur donnés,
// en ne gardant que les jours autorisés pour ce secteur — sauf si ce jour de
// zone est vide plusieurs semaines de suite (congés, jour très chargé...),
// auquel cas on propose aussi les autres jours disponibles.
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

  // Détecte si le jour de la zone est vide plusieurs occurrences de suite (congés,
  // ou simplement très chargé) : on ne regarde que les prochaines occurrences à
  // venir (pas les dates déjà passées dans la fenêtre demandée).
  let zonePaused = false;
  if (zone.weekday !== null) {
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = datesForWeekday(start, end, zone.weekday).filter((d) => d >= today);
    const firstOccurrences = upcoming.slice(0, OCCURRENCES_TO_CHECK);
    zonePaused =
      firstOccurrences.length >= OCCURRENCES_TO_CHECK &&
      firstOccurrences.every((d) => !data[d] || data[d].length === 0);
  }

  // Filtre : ne garder que les jours correspondant au secteur (weekday), sauf jour libre
  // (null = tous acceptés) ou secteur en pause détectée (on propose alors tous les jours).
  const filtered: Record<string, { start: string }[]> = {};
  for (const [date, slots] of Object.entries(data)) {
    const jsWeekday = new Date(`${date}T12:00:00`).getDay(); // 0=dim ... 6=sam
    if (zone.weekday === null || zonePaused || jsWeekday === zone.weekday) {
      filtered[date] = slots;
    }
  }

  return NextResponse.json({ success: true, eventTypeId, data: filtered, zonePaused });
}
