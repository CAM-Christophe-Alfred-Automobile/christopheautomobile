import { NextResponse } from "next/server";
import { zones, resolveZone } from "@/app/data/zoneSchedule";
import { getSlotDef } from "@/app/data/particulierSlots";
import { getVehicleTierMultiplier } from "@/app/data/vehicleTiers";
import servicesData from "@/app/data/services.json";
import { prisma } from "@/lib/prisma";
import { toE164French } from "@/lib/phoneNumber";

const CALCOM_API_VERSION_BOOKINGS = "2024-08-13";

// Recalcule le prix côté serveur à partir des noms de prestations réellement sélectionnées
// et du gabarit véhicule — ne jamais faire confiance à un prix envoyé tel quel par le client.
function computeServerPrice(selectedServiceNames: unknown, vehicleTierKey: unknown): number | null {
  if (!Array.isArray(selectedServiceNames) || selectedServiceNames.length === 0) return null;

  let total = 0;
  let hasAny = false;
  for (const name of selectedServiceNames) {
    if (typeof name !== "string") continue;
    const service = (servicesData as { service: string; prix: number | string | null }[]).find(
      (s) => s.service === name
    );
    if (!service) continue;
    hasAny = true;
    if (typeof service.prix === "number") {
      total += service.prix;
    } else if (typeof service.prix === "string") {
      const match = service.prix.match(/(\d+)/);
      if (match) total += parseInt(match[1], 10);
    }
  }
  if (!hasAny) return null;

  const multiplier = getVehicleTierMultiplier(typeof vehicleTierKey === "string" ? vehicleTierKey : undefined);
  return Math.round(total * multiplier);
}

// Recalcule la distance côté serveur en géocodant l'adresse fournie, plutôt que de faire
// confiance à la distance calculée par le navigateur du client.
async function computeServerDistanceKm(commune: unknown): Promise<number | null> {
  if (typeof commune !== "string" || commune.trim().length < 3) return null;
  try {
    const geoRes = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(commune)}&limit=1`,
      { cache: "no-store" }
    );
    if (!geoRes.ok) return null;
    const geoData = (await geoRes.json()) as {
      features: { geometry: { coordinates: [number, number] } }[];
    };
    const feature = geoData.features?.[0];
    if (!feature) return null;
    const [lon, lat] = feature.geometry.coordinates;
    return Math.round(resolveZone(lat, lon).distanceKm * 10) / 10;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    slot: slotKey,
    zone: zoneKey,
    start, // ISO string du créneau choisi
    nom,
    email,
    telephone,
    commune,
    modele,
    immatriculation,
    description,
    vehicleTierLabel,
    vehicleTierKey,
    selectedServiceNames,
  } = body;

  const slotDef = getSlotDef(slotKey);
  const zone = zones.find((z) => z.key === zoneKey);
  if (
    !slotDef ||
    !zone ||
    !start ||
    !nom ||
    !email ||
    !commune ||
    !modele ||
    !immatriculation ||
    !description
  ) {
    return NextResponse.json(
      { success: false, error: "Informations manquantes pour la réservation" },
      { status: 400 }
    );
  }

  // Verrouillage dynamique de zone : la 1ère réservation d'une demi-journée sur une date
  // impose sa zone à l'autre demi-journée de cette même date (voir DayZoneLock).
  const bookingDate = new Date(`${start.slice(0, 10)}T00:00:00Z`);
  const existingLocks = await prisma.dayZoneLock.findMany({ where: { date: bookingDate } });
  if (existingLocks.length > 0) {
    if (slotDef.key === "journee" || existingLocks.some((l) => l.slot === "journee")) {
      return NextResponse.json(
        { success: false, error: "Cette date n'est plus disponible." },
        { status: 409 }
      );
    }
    if (existingLocks.some((l) => l.slot === slotDef.key)) {
      return NextResponse.json(
        { success: false, error: "Ce créneau vient d'être réservé, merci d'en choisir un autre." },
        { status: 409 }
      );
    }
    if (existingLocks.some((l) => l.zoneKey !== zone.key)) {
      return NextResponse.json(
        {
          success: false,
          error: "Cette date est déjà réservée pour un autre secteur géographique.",
        },
        { status: 409 }
      );
    }
  }

  // Prix et distance recalculés côté serveur — jamais confiance aux valeurs envoyées par le client.
  const serverPrice = computeServerPrice(selectedServiceNames, vehicleTierKey);
  const serverDistanceKm = await computeServerDistanceKm(commune);

  const fullDescription = vehicleTierLabel
    ? `${description} — Véhicule : ${vehicleTierLabel}`
    : description;

  const notesParts: string[] = [];
  if (serverDistanceKm !== null) notesParts.push(`distanceKm=${serverDistanceKm}`);
  if (serverPrice !== null) notesParts.push(`estimatedPrice=${serverPrice}`);

  // Prix affiché en clair (champ visible "prix" + tentative sur le titre du RDV) pour que
  // Christophe voie le chiffre d'affaires prévisionnel directement dans l'email Cal.com et
  // sur son agenda, sans devoir ouvrir chaque réservation.
  const prixLabel = serverPrice !== null ? `${serverPrice}€` : "Sur devis";
  const title = `${modele} — ${prixLabel} — ${zone.label}`;

  const calRes = await fetch("https://api.cal.com/v2/bookings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
      "cal-api-version": CALCOM_API_VERSION_BOOKINGS,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventTypeId: slotDef.eventTypeId,
      start,
      attendee: {
        name: nom,
        email,
        phoneNumber: toE164French(telephone),
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
        prix: prixLabel,
        title,
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

  // Verrou posé seulement après confirmation Cal.com — si l'appel ci-dessus a échoué, rien n'est écrit.
  const calcomBookingUid: string | undefined = result?.data?.uid ?? result?.uid;
  await prisma.dayZoneLock.create({
    data: { date: bookingDate, slot: slotDef.key, zoneKey: zone.key, calcomBookingUid },
  });

  return NextResponse.json({ success: true, booking: result });
}
