import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getShopSettings } from "@/services/admin/shopSettings";
import { findClientVehicleByPlate, formatPlate } from "@/services/admin/vehicles";
import { findProBookingTypeByEventTypeId, proEventTypes } from "@/app/data/proSchedule";
import { sendPendingPaymentAlert } from "@/services/email";

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: fullName.trim() || "Client", lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

// Récupère le montant de l'acompte (en euros) configuré sur le type d'événement Cal.com
// concerné, pour l'indiquer dans l'alerte de paiement en attente.
async function fetchDepositAmount(eventTypeId: number | undefined): Promise<number | null> {
  if (!eventTypeId) return null;
  try {
    const res = await fetch(`https://api.cal.com/v2/event-types/${eventTypeId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
        "cal-api-version": "2024-06-14",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const { data } = (await res.json()) as { data?: { price?: number; currency?: string } };
    if (typeof data?.price !== "number" || data.currency !== "eur") return null;
    return data.price / 100;
  } catch {
    return null;
  }
}

interface CalResponseField {
  value?: string;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-cal-signature-256");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ success: false, error: "Signature invalide" }, { status: 401 });
  }

  let event: { triggerEvent?: string; payload?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, error: "JSON invalide" }, { status: 400 });
  }

  if (!event.payload || (event.triggerEvent !== "BOOKING_CREATED" && event.triggerEvent !== "BOOKING_PAYMENT_INITIATED")) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const payload = event.payload as {
    uid: string;
    startTime: string;
    endTime?: string;
    title?: string;
    eventTypeId?: number;
    eventType?: { id?: number };
    attendees?: { name?: string; email?: string }[];
    responses?: Record<string, CalResponseField>;
    payment?: { amount?: number; currency?: string };
  };

  // Le client a atteint l'étape de paiement de l'acompte mais n'a pas (encore) payé :
  // la réservation reste "pending" côté Cal.com et ne créera pas de fiche tant que ce
  // n'est pas réglé. On alerte tout de suite plutôt que de le découvrir plus tard.
  if (event.triggerEvent === "BOOKING_PAYMENT_INITIATED") {
    const attendee = payload.attendees?.[0];
    const responses = payload.responses ?? {};
    const name = responses.name?.value || attendee?.name || "Client site";
    const startTime = payload.startTime ? new Date(payload.startTime) : null;
    const dateLabel = startTime
      ? startTime.toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })
      : "date inconnue";

    // Le payload contient parfois directement le montant (en centimes) ; sinon on
    // retombe sur le prix configuré sur le type d'événement Cal.com concerné.
    const eventTypeId = payload.eventTypeId ?? payload.eventType?.id;
    const amount =
      payload.payment?.amount != null && payload.payment.currency === "eur"
        ? payload.payment.amount / 100
        : await fetchDepositAmount(eventTypeId);

    await sendPendingPaymentAlert({
      clientName: name,
      phone: responses.attendeePhoneNumber?.value || undefined,
      email: responses.email?.value || attendee?.email || undefined,
      date: dateLabel,
      description: responses.description?.value || responses.besoin?.value || payload.title || undefined,
      address: responses.address?.value || responses.adresse?.value || undefined,
      amount,
      estimatedPrice: responses.prix?.value || undefined,
    });

    return NextResponse.json({ success: true, alertSent: true });
  }

  const uid = payload.uid;
  if (!uid || !payload.startTime) {
    return NextResponse.json({ success: false, error: "Réservation incomplète" }, { status: 400 });
  }

  // Idempotence : Cal.com peut renvoyer le même événement plusieurs fois
  const already = await prisma.intervention.findUnique({ where: { calcomBookingUid: uid } });
  if (already) {
    return NextResponse.json({ success: true, alreadyProcessed: true });
  }

  const attendee = payload.attendees?.[0];
  const responses = payload.responses ?? {};
  const eventTypeId = payload.eventTypeId ?? payload.eventType?.id;
  const proType = findProBookingTypeByEventTypeId(eventTypeId);

  const startTime = new Date(payload.startTime);
  const endTime = payload.endTime ? new Date(payload.endTime) : null;
  const hours = endTime ? (endTime.getTime() - startTime.getTime()) / 3_600_000 : null;
  const shopSettings = await getShopSettings();

  const name = responses.name?.value || attendee?.name || "Client site";
  const email = responses.email?.value || attendee?.email || undefined;
  const phone = responses.attendeePhoneNumber?.value || undefined;
  const { firstName, lastName } = splitName(name);

  let client = phone || email
    ? await prisma.client.findFirst({
        where: {
          OR: [...(phone ? [{ phone }] : []), ...(email ? [{ email }] : [])],
        },
      })
    : null;

  // Réservation professionnelle (renfort garages/entreprises) : pas de véhicule/immatriculation,
  // mais une entreprise, une adresse de mission et un besoin décrit à la place.
  if (proType) {
    const entreprise = responses.entreprise?.value || "Entreprise non précisée";
    const adresse = responses.adresse?.value || undefined;
    const besoin = responses.besoin?.value || payload.title || "Renfort professionnel";
    const proNote = `Entreprise : ${entreprise}`;

    if (!client) {
      client = await prisma.client.create({
        data: { firstName, lastName, phone, email, address: adresse, notes: proNote },
      });
    } else {
      const updates: { phone?: string; email?: string; address?: string; notes?: string } = {};
      if (!client.phone && phone) updates.phone = phone;
      if (!client.email && email) updates.email = email;
      if (!client.address && adresse) updates.address = adresse;
      if (!client.notes?.includes(proNote)) {
        updates.notes = client.notes ? `${client.notes}\n${proNote}` : proNote;
      }
      if (Object.keys(updates).length > 0) {
        client = await prisma.client.update({ where: { id: client.id }, data: updates });
      }
    }

    const vehicleLabel = `Renfort professionnel — ${entreprise}`;
    let vehicle = await prisma.vehicle.findFirst({
      where: { clientId: client.id, model: vehicleLabel },
    });
    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: { clientId: client.id, model: vehicleLabel },
      });
    }

    const rate = proEventTypes[proType].hourlyRate;
    const normalPrice = hours != null ? hours * rate : null;
    const dossierFee = normalPrice != null ? (normalPrice * Number(shopSettings.urssafRate)) / 100 : null;

    await prisma.intervention.create({
      data: {
        vehicleId: vehicle.id,
        date: startTime,
        endDate: endTime,
        description: besoin,
        status: "reserved",
        bookedOnline: true,
        calcomBookingUid: uid,
        normalPrice,
        dossierFee,
        estimatedHours: hours,
      },
    });

    return NextResponse.json({ success: true });
  }

  const commune = responses.address?.value || undefined;
  const modele = responses.modele?.value || undefined;
  const immatriculation = responses.immatriculation?.value || undefined;
  const description = responses.description?.value || payload.title || "Réservation en ligne";
  const distanceMatch = responses.notes?.value?.match(/distanceKm=([\d.]+)/);
  const distanceKm = distanceMatch ? parseFloat(distanceMatch[1]) : null;
  const quotedPriceMatch = responses.notes?.value?.match(/estimatedPrice=([\d.]+)/);
  const quotedPrice = quotedPriceMatch ? parseFloat(quotedPriceMatch[1]) : null;

  if (!client) {
    client = await prisma.client.create({
      data: { firstName, lastName, phone, email, address: commune },
    });
  } else {
    const updates: { phone?: string; email?: string; address?: string } = {};
    if (!client.phone && phone) updates.phone = phone;
    if (!client.email && email) updates.email = email;
    if (!client.address && commune) updates.address = commune;
    if (Object.keys(updates).length > 0) {
      client = await prisma.client.update({ where: { id: client.id }, data: updates });
    }
  }

  // Sans plaque (client n'ayant pas rempli l'immatriculation), on retombe sur le véhicule
  // déjà connu du même client portant le même modèle, pour ne pas dupliquer un véhicule/une
  // fiche à chaque nouvelle réservation en ligne du même client pour la même voiture. La
  // comparaison de plaque ignore espaces/tirets (ex: "EN043DQ" vs "EN-043-DQ" ne doivent pas
  // créer deux véhicules).
  const formattedPlate = immatriculation ? formatPlate(immatriculation) : undefined;
  let vehicle = formattedPlate
    ? await findClientVehicleByPlate(client.id, formattedPlate)
    : modele
      ? await prisma.vehicle.findFirst({
          where: { clientId: client.id, model: { equals: modele, mode: "insensitive" } },
        })
      : null;

  if (!vehicle) {
    vehicle = await prisma.vehicle.create({
      data: { clientId: client.id, plate: formattedPlate, model: modele },
    });
  }

  // Le prix réellement affiché au client (selon le gabarit véhicule choisi) prime sur le calcul générique.
  const normalPrice = quotedPrice ?? (hours != null ? hours * Number(shopSettings.hourlyRate) : null);
  const dossierFee = normalPrice != null ? (normalPrice * Number(shopSettings.urssafRate)) / 100 : null;
  const travelFee = distanceKm != null ? distanceKm * Number(shopSettings.travelRatePerKm) : null;

  await prisma.intervention.create({
    data: {
      vehicleId: vehicle.id,
      date: startTime,
      endDate: endTime,
      description,
      status: "reserved",
      bookedOnline: true,
      calcomBookingUid: uid,
      normalPrice,
      dossierFee,
      distanceKm,
      travelFee,
      estimatedHours: hours,
    },
  });

  return NextResponse.json({ success: true });
}
