import { NextResponse } from "next/server";
import { zones } from "@/app/data/zoneSchedule";
import {
  PARTICULIER_SLOTS,
  WEEKDAY_SLOT_KEYS,
  MONDAY_SLOT_KEYS,
  isMondayEligible,
  type ParticulierSlotDef,
} from "@/app/data/particulierSlots";
import { prisma } from "@/lib/prisma";

const CALCOM_API_VERSION_SLOTS = "2024-09-04";

export interface SlotOption {
  slot: string;
  label: string;
  start: string; // ISO datetime renvoyé par Cal.com, à transmettre tel quel à /api/cal-book
}

async function fetchSlotsForEventType(
  eventTypeId: number,
  start: string,
  end: string
): Promise<Record<string, { start: string }[]>> {
  const res = await fetch(
    `https://api.cal.com/v2/slots?eventTypeId=${eventTypeId}&start=${start}&end=${end}&timeZone=Europe/Paris`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
        "cal-api-version": CALCOM_API_VERSION_SLOTS,
      },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`Erreur Cal.com (${res.status})`);
  const { data } = (await res.json()) as { data: Record<string, { start: string }[]> };
  return data;
}

// Réservation particulier : créneaux fixes (Matin/Après-midi/Journée en semaine,
// 3 créneaux dédiés le lundi) avec verrouillage dynamique de zone géographique.
// La première réservation d'une demi-journée sur une date verrouille l'autre
// demi-journée de cette date à la même zone (voir DayZoneLock, cal-book/route.ts).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const zoneKey = url.searchParams.get("zone");
  const start = url.searchParams.get("start"); // YYYY-MM-DD
  const end = url.searchParams.get("end"); // YYYY-MM-DD
  const servicesParam = url.searchParams.get("services") ?? "";
  const selectedServiceNames = servicesParam ? servicesParam.split(",").filter(Boolean) : [];

  const zone = zones.find((z) => z.key === zoneKey);
  if (!zone || !start || !end) {
    return NextResponse.json(
      { success: false, error: "Paramètres manquants (zone, start, end)" },
      { status: 400 }
    );
  }

  const mondayEligible = isMondayEligible(selectedServiceNames);
  const slotDefs: ParticulierSlotDef[] = PARTICULIER_SLOTS.filter((s) =>
    (mondayEligible ? MONDAY_SLOT_KEYS : WEEKDAY_SLOT_KEYS).includes(s.key)
  );

  let perSlotData: [ParticulierSlotDef, Record<string, { start: string }[]>][];
  try {
    perSlotData = await Promise.all(
      slotDefs.map(async (def) => [def, await fetchSlotsForEventType(def.eventTypeId, start, end)] as const)
    );
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Erreur Cal.com" },
      { status: 502 }
    );
  }

  // Regroupe les options de créneau disponibles par date (avant filtrage par zone).
  const optionsByDate: Record<string, SlotOption[]> = {};
  for (const [def, data] of perSlotData) {
    for (const [date, slots] of Object.entries(data)) {
      if (!slots.length) continue;
      if (!optionsByDate[date]) optionsByDate[date] = [];
      optionsByDate[date].push({ slot: def.key, label: def.label, start: slots[0].start });
    }
  }

  const dates = Object.keys(optionsByDate);
  if (dates.length === 0) {
    return NextResponse.json({ success: true, data: {} });
  }

  // Verrous de zone déjà posés dans la fenêtre demandée.
  const locks = await prisma.dayZoneLock.findMany({
    where: { date: { gte: new Date(`${start}T00:00:00Z`), lte: new Date(`${end}T00:00:00Z`) } },
  });
  const locksByDate = new Map<string, { slot: string; zoneKey: string }[]>();
  for (const lock of locks) {
    const key = lock.date.toISOString().slice(0, 10);
    if (!locksByDate.has(key)) locksByDate.set(key, []);
    locksByDate.get(key)!.push({ slot: lock.slot, zoneKey: lock.zoneKey });
  }

  const filtered: Record<string, SlotOption[]> = {};
  for (const date of dates) {
    const dateLocks = locksByDate.get(date) ?? [];
    if (dateLocks.length === 0) {
      // Aucun verrou : tout ce que Cal.com propose est ouvert, à n'importe quelle zone.
      filtered[date] = optionsByDate[date];
      continue;
    }
    if (dateLocks.some((l) => l.slot === "journee")) {
      // Journée complète déjà prise : rien d'autre ce jour-là.
      continue;
    }
    const lockedZone = dateLocks[0].zoneKey;
    if (lockedZone !== zone.key) {
      // Zone différente : les créneaux restants de cette date ne sont pas pour ce client.
      continue;
    }
    const takenSlots = new Set(dateLocks.map((l) => l.slot));
    const remaining = optionsByDate[date].filter((o) => !takenSlots.has(o.slot) && o.slot !== "journee");
    if (remaining.length > 0) filtered[date] = remaining;
  }

  return NextResponse.json({ success: true, data: filtered });
}
