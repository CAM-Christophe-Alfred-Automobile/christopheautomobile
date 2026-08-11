import { prisma } from "@/lib/prisma";
import { listRecurringItems } from "@/services/finance/recurringItems";
import { getOccurrencesInRange } from "@/services/finance/forecast";

export type AgendaEntryKind = "recurring-income" | "intervention";

export interface AgendaEntry {
  kind: AgendaEntryKind;
  date: string; // YYYY-MM-DD
  label: string;
  amount: number; // estimation si non connue précisément
  isEstimate: boolean;
  href?: string;
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

  return entries.sort((a, b) => a.date.localeCompare(b.date));
}
