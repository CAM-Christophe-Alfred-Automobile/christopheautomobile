import Link from "next/link";
import { listAccounts, getAllCurrentBalances, getNetWorthHistory } from "@/services/finance/accounts";
import {
  listTransactions,
  getMonthlyFlows,
  listRecentCrmCashPayments,
  listPendingTransferReviews,
  LARGE_DEPOSIT_THRESHOLD,
} from "@/services/finance/transactions";
import { recomputeAdvice, listAdvice } from "@/services/finance/advice";
import { getSettings } from "@/services/finance/settings";
import { getSimpleSummary, getBestTransferDay, getRevenueTarget } from "@/services/finance/coach";
import MonthlyFlowChart from "@/components/admin/finance/MonthlyFlowChart";
import NetWorthChart from "@/components/admin/finance/NetWorthChart";
import {
  quickCashExpenseAction,
  quickTransferAction,
  confirmCashTransferAction,
  dismissTransferReviewAction,
} from "./transactions/actions";

const QUICK_CASH_CATEGORIES = ["Courses", "Carburant", "Péage", "Santé", "Autre"];

export const dynamic = "force-dynamic";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-red-500/30 bg-red-500/10 text-red-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  info: "border-gray-700 bg-gray-900 text-gray-300",
};

export default async function FinanceDashboardPage() {
  await recomputeAdvice();
  const [
    recentTransactions,
    advice,
    monthlyFlows,
    accounts,
    recentCashPayments,
    netWorthHistory,
    settings,
    simpleSummary,
    bestTransferDay,
    revenueTarget,
    pendingTransferReviews,
  ] = await Promise.all([
    listTransactions({ take: 8 }),
    listAdvice().then((items) => items.slice(0, 3)),
    getMonthlyFlows(6),
    listAccounts(),
    listRecentCrmCashPayments(5),
    getNetWorthHistory(6),
    getSettings(),
    getSimpleSummary(),
    getBestTransferDay(),
    getRevenueTarget(),
    listPendingTransferReviews(),
  ]);
  const balanceByAccountId = await getAllCurrentBalances(accounts);
  const accountBalances = accounts.map((a) => balanceByAccountId.get(a.id) ?? 0);
  const balances = accounts.reduce(
    (acc, a, i) => {
      const b = accountBalances[i];
      if (a.scope === "PRO") acc.pro += b;
      else acc.perso += b;
      acc.combined += b;
      return acc;
    },
    { pro: 0, perso: 0, combined: 0 }
  );
  const savingsGoal = settings.savingsGoalAmount != null ? Number(settings.savingsGoalAmount) : null;
  const goalProgress = savingsGoal ? Math.min(100, Math.max(0, (balances.combined / savingsGoal) * 100)) : null;
  const cashAccounts = accounts.filter((a) => a.type === "cash");

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-emerald-950/40 to-gray-900 border border-emerald-900/40 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-medium text-emerald-300">En résumé</h2>
        <p className="text-gray-200">
          Tu as <span className="font-semibold text-gray-50">{formatEUR(simpleSummary.available)}</span> sur tes comptes aujourd&apos;hui.
        </p>
        {simpleSummary.upcomingItems.length > 0 && (
          <p className="text-gray-300 text-sm">
            Dans les 30 prochains jours, tu dois garder{" "}
            <span className="font-medium text-amber-300">{formatEUR(simpleSummary.upcomingCommitted)}</span> de côté pour tes charges
            à venir, dont{" "}
            {[...simpleSummary.upcomingItems]
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((i) => `${i.label} (${formatEUR(i.amount)})`)
              .join(", ")}
            {simpleSummary.upcomingItems.length > 5 && ` et ${simpleSummary.upcomingItems.length - 5} autres`}.
          </p>
        )}
        {simpleSummary.upcomingIncomeItems.length > 0 && (
          <p className="text-gray-300 text-sm">
            Tu devrais aussi recevoir{" "}
            <span className="font-medium text-emerald-300">{formatEUR(simpleSummary.upcomingIncome)}</span> sur la même
            période ({simpleSummary.upcomingIncomeItems.map((i) => `${i.label} (${formatEUR(i.amount)})`).join(", ")}).
          </p>
        )}
        {simpleSummary.safeToSpend >= 0 ? (
          <p className="text-gray-200">
            Il te reste donc environ{" "}
            <span className="font-semibold text-emerald-400">{formatEUR(simpleSummary.safeToSpend)}</span> que tu peux
            utiliser librement, une fois tes charges à venir couvertes et en comptant tes rentrées attendues.
          </p>
        ) : (
          <p className="text-gray-200">
            Même en comptant tes rentrées attendues, il te manquerait encore environ{" "}
            <span className="font-semibold text-red-400">{formatEUR(Math.abs(simpleSummary.safeToSpend))}</span> pour
            couvrir tout ça —{" "}
            <span className="text-gray-400">
              ce calcul ne compte que les rentrées régulières déjà enregistrées (pas les paiements clients ponctuels), donc
              ce n&apos;est pas forcément un vrai trou, mais un signal à surveiller de près.
            </span>
          </p>
        )}
        {bestTransferDay && (
          <p className="text-gray-400 text-sm border-t border-gray-800 pt-3">
            💡 Le jour le plus sûr pour faire tes virements ce mois-ci : <span className="text-gray-200 font-medium">le {bestTransferDay.day}</span> — juste après{" "}
            {bestTransferDay.afterLabel}, avec {bestTransferDay.gapDays} jours de tranquillité avant le prochain prélèvement ({bestTransferDay.beforeLabel}).
          </p>
        )}
      </div>

      {cashAccounts.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-medium text-gray-300">Dépense espèces rapide</h2>
          <form action={quickCashExpenseAction} className="flex flex-wrap gap-2 items-center">
            {cashAccounts.length > 1 ? (
              <select
                name="accountId"
                className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                {cashAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.scope})
                  </option>
                ))}
              </select>
            ) : (
              <input type="hidden" name="accountId" value={cashAccounts[0].id} />
            )}
            <input
              type="number"
              step="0.01"
              min="0"
              name="amount"
              required
              placeholder="Montant (€)"
              className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm w-32"
            />
            <select
              name="category"
              className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              {QUICK_CASH_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="description"
              placeholder="Détails (optionnel)"
              className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg px-4 py-2"
            >
              Enregistrer
            </button>
          </form>
        </div>
      )}

      {cashAccounts.length > 0 && accounts.length > 1 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-medium text-gray-300">Virement rapide (ex: déposer les espèces en banque)</h2>
          <form action={quickTransferAction} className="flex flex-wrap gap-2 items-center">
            <select
              name="fromAccountId"
              defaultValue={cashAccounts[0].id}
              className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.scope})
                </option>
              ))}
            </select>
            <span className="text-gray-500 text-sm">→</span>
            <select
              name="toAccountId"
              defaultValue={accounts.find((a) => a.type !== "cash" && a.scope === "PRO")?.id ?? accounts[0].id}
              className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.scope})
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              name="amount"
              required
              placeholder="Montant (€)"
              className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm w-32"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg px-4 py-2"
            >
              Virer
            </button>
          </form>
        </div>
      )}

      {pendingTransferReviews.length > 0 && (
        <div className="bg-amber-950/20 border border-dashed border-amber-700/50 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-medium text-amber-300">
            💰 Grosses entrées à vérifier ({pendingTransferReviews.length})
          </h2>
          <p className="text-xs text-gray-500">
            Une entrée de plus de {formatEUR(LARGE_DEPOSIT_THRESHOLD)} vient d&apos;arriver sur un compte —
            est-ce un virement que tu as fait depuis tes espèces, ou un vrai encaissement ?
          </p>
          <ul className="space-y-2">
            {pendingTransferReviews.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 bg-gray-950/50 rounded-lg px-3 py-2 text-sm"
              >
                <span className="text-gray-300">
                  {new Date(t.date).toLocaleDateString("fr-FR")} — {t.account.name} — {t.description}
                </span>
                <span className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-amber-300 font-medium">{formatEUR(Number(t.amount))}</span>
                  <form action={confirmCashTransferAction.bind(null, t.id)}>
                    <button
                      type="submit"
                      className="text-xs px-2 py-1 rounded-md border border-emerald-700 text-emerald-400 hover:bg-emerald-950/40 cursor-pointer"
                      title="Oui, c'est un virement depuis mes espèces — met aussi à jour le compte espèces"
                    >
                      💵 Depuis mes espèces
                    </button>
                  </form>
                  <form action={dismissTransferReviewAction.bind(null, t.id)}>
                    <button
                      type="submit"
                      className="text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-300 cursor-pointer"
                      title="Non, c'est un vrai encaissement"
                    >
                      Non, revenu réel
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400">Trésorerie Pro</p>
          <p className={`text-2xl font-semibold mt-1 ${balances.pro < 0 ? "text-red-400" : "text-blue-300"}`}>
            {formatEUR(balances.pro)}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400">Trésorerie Perso</p>
          <p className={`text-2xl font-semibold mt-1 ${balances.perso < 0 ? "text-red-400" : "text-purple-300"}`}>
            {formatEUR(balances.perso)}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400">Total combiné</p>
          <p className={`text-2xl font-semibold mt-1 ${balances.combined < 0 ? "text-red-400" : "text-gray-50"}`}>
            {formatEUR(balances.combined)}
          </p>
        </div>
      </div>

      {savingsGoal != null && goalProgress != null && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-300">{settings.savingsGoalLabel || "Objectif d'épargne"}</span>
            <span className="text-gray-400">
              {formatEUR(balances.combined)} / {formatEUR(savingsGoal)} ({goalProgress.toFixed(0)}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${goalProgress >= 100 ? "bg-emerald-500" : "bg-emerald-600"}`}
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
        <p className="text-sm text-gray-300">
          Pour couvrir tes charges{revenueTarget.monthlySavingsNeeded ? " et atteindre ton objectif d'épargne" : ""}, il te
          faudrait environ{" "}
          <span className="font-semibold text-amber-300">{formatEUR(revenueTarget.monthlyRevenueTarget)}</span> de
          chiffre d&apos;affaires par mois.
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-gray-950/50 border border-gray-800 rounded-lg px-3 py-2">
            <p className="text-[11px] text-gray-500">Par semaine</p>
            <p className="text-lg font-semibold text-amber-300">{formatEUR(revenueTarget.weeklyRevenueTarget)}</p>
          </div>
          <div className="bg-gray-950/50 border border-gray-800 rounded-lg px-3 py-2">
            <p className="text-[11px] text-gray-500">Par jour ({revenueTarget.workingDaysPerWeek}j/sem.)</p>
            <p className="text-lg font-semibold text-amber-300">{formatEUR(revenueTarget.dailyRevenueTarget)}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Détail : {formatEUR(revenueTarget.monthlyExpenses)}/mois de charges (hors URSSAF)
          {revenueTarget.monthlyOtherIncome > 0 && ` − ${formatEUR(revenueTarget.monthlyOtherIncome)}/mois déjà couverts par tes autres rentrées (pension...)`}
          {revenueTarget.monthlySavingsNeeded != null &&
            ` + ${formatEUR(revenueTarget.monthlySavingsNeeded)}/mois pour ${settings.savingsGoalLabel || "ton objectif"} (${revenueTarget.monthsUntilGoal} mois restants)`}
          , puis remis à l&apos;échelle pour laisser {revenueTarget.urssafRatePct}% pour l&apos;URSSAF.
        </p>
        <p className="text-[11px] text-gray-600">
          Ce sont des objectifs de facturation, pas ta trésorerie réelle : l&apos;argent facturé n&apos;arrive pas le
          jour même (carte via Abby ≈ 7 jours, certains encaissements jusqu&apos;à 10 jours).
        </p>
      </div>

      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-2">Argent restant par compte</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {accounts.map((account, i) => (
            <Link
              key={account.id}
              href="/admin/finance/accounts"
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
            >
              <p className="text-sm text-gray-400 truncate">{account.name}</p>
              <p className={`text-lg font-semibold mt-1 ${accountBalances[i] < 0 ? "text-red-400" : "text-gray-50"}`}>
                {formatEUR(accountBalances[i])}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {advice.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Conseils</h2>
            <Link href="/admin/finance/advice" className="text-sm text-gray-400 hover:text-white">
              Tout voir →
            </Link>
          </div>
          {advice.map((item) => (
            <div key={item.id} className={`border rounded-xl p-3 text-sm ${SEVERITY_STYLES[item.severity]}`}>
              <p className="font-medium">{item.title}</p>
              <p className="opacity-90 mt-0.5">{item.detail}</p>
            </div>
          ))}
        </div>
      )}

      {recentCashPayments.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Derniers encaissements espèces</h2>
          <div className="border border-gray-800 rounded-xl divide-y divide-gray-800">
            {recentCashPayments.map((tx) => {
              const [clientName, ...rest] = tx.description.split(" — ");
              return (
                <div key={tx.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{clientName}</p>
                    {rest.length > 0 && <p className="text-gray-500 text-xs truncate">{rest.join(" — ")}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-emerald-400 font-medium">{formatEUR(Number(tx.amount))}</p>
                    <p className="text-gray-500 text-xs">{new Intl.DateTimeFormat("fr-FR").format(new Date(tx.date))}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/finance/transactions/new" className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium">
          + Transaction
        </Link>
        <Link href="/admin/finance/transactions/transfer" className="px-3 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-sm">
          Virement pro ↔ perso
        </Link>
        <Link href="/admin/finance/transactions/import" className="px-3 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-sm">
          Importer un CSV
        </Link>
        <Link href="/admin/finance/forecast" className="px-3 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-sm">
          Voir les prévisions
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Évolution de l&apos;argent total (6 derniers mois)</h2>
        <NetWorthChart data={netWorthHistory} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Revenus / dépenses (6 derniers mois)</h2>
        <MonthlyFlowChart data={monthlyFlows} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Transactions récentes</h2>
          <Link href="/admin/finance/transactions" className="text-sm text-gray-400 hover:text-white">
            Tout voir →
          </Link>
        </div>
        <div className="border border-gray-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-800">
              {recentTransactions.length === 0 && (
                <tr>
                  <td className="px-3 py-8 text-center text-gray-500">
                    Aucune transaction pour le moment.
                  </td>
                </tr>
              )}
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-900/50">
                  <td className="px-3 py-2 whitespace-nowrap text-gray-400">
                    {new Intl.DateTimeFormat("fr-FR").format(new Date(tx.date))}
                  </td>
                  <td className="px-3 py-2">{tx.description}</td>
                  <td className="px-3 py-2 text-gray-400">{tx.account.name}</td>
                  <td
                    className={`px-3 py-2 text-right font-medium ${
                      Number(tx.amount) < 0 ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {formatEUR(Number(tx.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
