import { prisma } from "@/lib/prisma";
import { listRecurringItems } from "@/services/finance/recurringItems";
import { getOccurrencesInRange } from "@/services/finance/forecast";

export type AgendaEntryKind = "recurring-income" | "intervention" | "card-payment-pending";

// Paiements carte (Stripe / terminal) : l'argent met environ 10 jours à arriver
// réellement en banque — voir Payment.receivedConfirmedAt et le bouton "Confirmer reçu".
export const CARD_PAYMENT_DELAY_DAYS = 10;

export interface AgendaEntry {
  kind: AgendaEntryKind;
  date: string; // YYYY-MM-DD
  label: string;
  amount: number; // estimation si non connue précisément
  isEstimate: boolean;
  href?: string;
  paymentId?: string; // présent uniquement pour kind === "card-payment-pending"
}

// Rassemble les rentrées d'argent futures connues sur une période : occurrences des revenus
// récurrents actifs, et interventions réservées/en cours (prix facturé ou estimé). Sert à
// afficher un agenda visuel de trésorerie à venir plutôt qu'une simple liste.
export async function getIncomeAgenda(rangeStart: Date, rangeEnd: Date): Promise<AgendaEntry[]> {
  const entries: AgendaEntry[] = [];

  const recurringItems = await listRecurringItems(true);
  for (const item of recurringItems) {
    if (item.direction !== "income") continue;
    const occurrences = getOccurrencesInRange(item, rangeStart, rangeEnd);
    for (const date of occurrences) {
      entries.push({
        kind: "recurring-income",
        date: date.toISOString().slice(0, 10),
        label: item.label,
        amount: Number(item.amount),
        isEstimate: item.amountIsEstimate,
      });
    }
  }

  const interventions = await prisma.intervention.findMany({
    where: {
      status: { in: ["reserved", "draft"] },
      date: { gte: rangeStart, lte: rangeEnd },
    },
    include: { vehicle: { include: { client: true } } },
    orderBy: { date: "asc" },
  });
  for (const it of interventions) {
    const amount = Number(it.price ?? it.normalPrice ?? 0);
    if (amount <= 0) continue;
    const clientName = it.vehicle?.client
      ? `${it.vehicle.client.firstName} ${it.vehicle.client.lastName}`
      : "Client";
    entries.push({
      kind: "intervention",
      date: it.date.toISOString().slice(0, 10),
      label: clientName,
      amount,
      isEstimate: it.status === "reserved",
      href: `/admin/interventions/${it.id}/live`,
    });
  }

  // Paiements carte pas encore confirmés arrivés en banque : on affiche leur date d'arrivée
  // attendue (paiement + délai), avec un bouton pour confirmer une fois vérifié sur le compte.
  // Fenêtre de recherche large (6 mois) car un paiement en retard doit rester visible tant
  // qu'il n'est pas confirmé, même s'il a été enregistré bien avant le mois affiché.
  const cardPaymentLookbackStart = new Date(rangeStart.getTime() - 180 * 24 * 60 * 60 * 1000);
  const pendingCardPayments = await prisma.payment.findMany({
    where: {
      method: "card",
      receivedConfirmedAt: null,
      date: { gte: cardPaymentLookbackStart, lte: rangeEnd },
    },
    include: { intervention: { include: { vehicle: { include: { client: true } } } } },
  });
  const now = new Date();
  const rangeStartStr = rangeStart.toISOString().slice(0, 10);
  const rangeEndStr = rangeEnd.toISOString().slice(0, 10);
  const todayStr = now.toISOString().slice(0, 10);
  // Le mois affiché contient-il aujourd'hui ? Si oui, on y regroupe aussi les paiements en
  // retard d'un mois antérieur — sinon ils resteraient invisibles tant qu'on ne va pas
  // spécifiquement rechercher dans le mois où ils étaient initialement attendus.
  const viewIncludesToday = rangeStart <= now && now <= rangeEnd;
  for (const p of pendingCardPayments) {
    const expectedDate = new Date(p.date.getTime() + CARD_PAYMENT_DELAY_DAYS * 24 * 60 * 60 * 1000);
    const expectedStr = expectedDate.toISOString().slice(0, 10);
    const inRange = expectedStr >= rangeStartStr && expectedStr <= rangeEndStr;
    const isOverdueIntoCurrentView = viewIncludesToday && expectedStr < todayStr;
    if (!inRange && !isOverdueIntoCurrentView) continue;
    const clientName = p.intervention.vehicle?.client
      ? `${p.intervention.vehicle.client.firstName} ${p.intervention.vehicle.client.lastName}`
      : "Client";
    entries.push({
      kind: "card-payment-pending",
      date: expectedStr,
      label: `${clientName} — carte`,
      amount: Number(p.amount),
      isEstimate: false,
      paymentId: p.id,
    });
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date));
}
