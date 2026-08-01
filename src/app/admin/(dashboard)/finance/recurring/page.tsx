import Link from "next/link";
import { listRecurringItems } from "@/services/finance/recurringItems";
import { toggleRecurringItemAction, deleteRecurringItemAction, markRecurringItemPaidAction } from "./actions";
import SubmitOnceButton from "@/components/admin/finance/SubmitOnceButton";

export const dynamic = "force-dynamic";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  annual: "Annuel",
  weekly: "Hebdomadaire",
  custom_days: "Intervalle (jours)",
};

const OCCURRENCES_PER_YEAR: Record<string, number> = {
  monthly: 12,
  quarterly: 4,
  annual: 1,
  weekly: 52,
};

function annualCost(item: { amount: unknown; frequency: string; intervalDays: number | null }): number {
  const perYear =
    item.frequency === "custom_days" && item.intervalDays
      ? 365 / item.intervalDays
      : (OCCURRENCES_PER_YEAR[item.frequency] ?? 12);
  return Number(item.amount) * perYear;
}

function dayLabel(item: { dayOfMonth: number | null; frequency: string; startDate: Date }): string {
  if (item.dayOfMonth) return `Le ${item.dayOfMonth}`;
  if (item.frequency === "weekly" || item.frequency === "custom_days") return "Variable";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(item.startDate);
}

export default async function RecurringPage() {
  const items = await listRecurringItems();

  const groups = new Map<string, typeof items>();
  for (const item of items) {
    const key = item.category?.name ?? "Sans catégorie";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  for (const group of groups.values()) {
    group.sort((a, b) => (b.direction === "expense" ? annualCost(b) : 0) - (a.direction === "expense" ? annualCost(a) : 0));
  }
  const sortedGroupNames = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b, "fr"));

  const activeExpenses = items.filter((i) => i.direction === "expense" && i.isActive);
  const totalAnnual = activeExpenses.reduce((sum, i) => sum + annualCost(i), 0);
  const topCosts = [...activeExpenses].sort((a, b) => annualCost(b) - annualCost(a)).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Charges et entrées récurrentes</h1>
        <Link href="/admin/finance/recurring/new" className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium">
          + Nouveau récurrent
        </Link>
      </div>

      {items.length === 0 && (
        <p className="text-gray-500 text-sm px-1">
          Aucun récurrent. Ajoutez vos abonnements, crédits, assurances, URSSAF, revenus attendus...
        </p>
      )}

      {activeExpenses.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
          <p className="text-sm text-gray-300">
            Toutes tes charges récurrentes actives représentent environ{" "}
            <span className="font-semibold text-amber-300">{formatEUR(totalAnnual)} par an</span>.
          </p>
          <p className="text-xs text-gray-500">
            Les plus lourdes : {topCosts.map((i) => `${i.label} (${formatEUR(annualCost(i))}/an)`).join(", ")}. Chaque
            groupe ci-dessous est trié du plus cher au moins cher — regarde en premier ce qui coûte le plus sur l&apos;année
            pour repérer ce qui vaut vraiment le coup de garder. Le bouton «&nbsp;Actif/Inactif&nbsp;» arrête la
            prise en compte d&apos;une charge sans effacer son historique.
          </p>
        </div>
      )}

      {sortedGroupNames.map((groupName) => {
        const group = groups.get(groupName)!;
        const groupTotal = group
          .filter((i) => i.direction === "expense" && i.isActive)
          .reduce((sum, i) => sum + Number(i.amount), 0);

        return (
          <div key={groupName} className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-medium text-gray-300">{groupName}</h2>
              {groupTotal > 0 && <span className="text-xs text-gray-500">{formatEUR(groupTotal)} / mois environ</span>}
            </div>
            <div className="border border-gray-800 rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-900 text-gray-400 text-left">
                  <tr>
                    <th className="px-3 py-2">Organisme</th>
                    <th className="px-3 py-2">Jour</th>
                    <th className="px-3 py-2">Compte</th>
                    <th className="px-3 py-2">Fréquence</th>
                    <th className="px-3 py-2 text-right">Montant</th>
                    <th className="px-3 py-2 text-right">Coût annuel</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {group.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        {item.label}
                        {item.amountIsEstimate && <span className="ml-2 text-xs text-gray-500">(estimé)</span>}
                      </td>
                      <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{dayLabel(item)}</td>
                      <td className="px-3 py-2 text-gray-400">{item.account.name}</td>
                      <td className="px-3 py-2 text-gray-400">{FREQUENCY_LABELS[item.frequency] ?? item.frequency}</td>
                      <td
                        className={`px-3 py-2 text-right font-medium whitespace-nowrap ${
                          item.direction === "expense" ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        {item.direction === "expense" ? "-" : "+"}
                        {formatEUR(Number(item.amount))}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-500 whitespace-nowrap">
                        {item.direction === "expense" ? formatEUR(annualCost(item)) : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <form action={toggleRecurringItemAction.bind(null, item.id, !item.isActive)}>
                          <button
                            type="submit"
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              item.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            {item.isActive ? "Actif" : "Inactif"}
                          </button>
                        </form>
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        {item.isActive && (
                          <form action={markRecurringItemPaidAction.bind(null, item.id)} className="inline">
                            <SubmitOnceButton
                              pendingText="Ajout en cours…"
                              className="text-xs px-2 py-0.5 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300"
                              title="Crée la transaction correspondante avec la date d'aujourd'hui"
                            >
                              {item.direction === "expense" ? "Payé aujourd'hui" : "Reçu aujourd'hui"}
                            </SubmitOnceButton>
                          </form>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <Link href={`/admin/finance/recurring/${item.id}/edit`} className="text-gray-500 hover:text-gray-200 text-xs">
                          Modifier
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <form action={deleteRecurringItemAction.bind(null, item.id)}>
                          <button className="text-gray-500 hover:text-red-400 text-xs">Supprimer</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
