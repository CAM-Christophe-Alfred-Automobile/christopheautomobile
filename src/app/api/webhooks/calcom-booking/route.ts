import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getShopSettings } from "@/services/admin/shopSettings";

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

  if (event.triggerEvent !== "BOOKING_CREATED" || !event.payload) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const payload = event.payload as {
    uid: string;
    startTime: string;
    endTime?: string;
    title?: string;
    attendees?: { name?: string; email?: string }[];
    responses?: Record<string, CalResponseField>;
  };

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

  const name = responses.name?.value || attendee?.name || "Client site";
  const email = responses.email?.value || attendee?.email || undefined;
  const phone = responses.attendeePhoneNumber?.value || undefined;
  const commune = responses.address?.value || undefined;
  const modele = responses.modele?.value || undefined;
  const immatriculation = responses.immatriculation?.value || undefined;
  const description = responses.description?.value || payload.title || "Réservation en ligne";

  const startTime = new Date(payload.startTime);
  const endTime = payload.endTime ? new Date(payload.endTime) : null;
  const { firstName, lastName } = splitName(name);

  let client = phone || email
    ? await prisma.client.findFirst({
        where: {
          OR: [...(phone ? [{ phone }] : []), ...(email ? [{ email }] : [])],
        },
      })
    : null;

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

  let vehicle = immatriculation
    ? await prisma.vehicle.findFirst({ where: { clientId: client.id, plate: immatriculation } })
    : null;

  if (!vehicle) {
    vehicle = await prisma.vehicle.create({
      data: { clientId: client.id, plate: immatriculation, model: modele },
    });
  }

  const shopSettings = await getShopSettings();
  const hours = endTime ? (endTime.getTime() - startTime.getTime()) / 3_600_000 : null;
  const normalPrice = hours != null ? hours * Number(shopSettings.hourlyRate) : null;
  const dossierFee = normalPrice != null ? (normalPrice * Number(shopSettings.urssafRate)) / 100 : null;

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
      hoursSpent: hours,
    },
  });

  return NextResponse.json({ success: true });
}
