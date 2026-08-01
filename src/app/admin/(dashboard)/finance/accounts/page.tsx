import Link from "next/link";
import { listAccounts, getAllCurrentBalances } from "@/services/finance/accounts";
import { reconcileAccountAction, syncCashAction } from "./actions";

export const dynamic = "force-dynamic";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export default async function AccountsPage() {
  const accounts = await listAccounts();
  const balanceByAccountId = await getAllCurrentBalances(accounts);
  const balances = accounts.map((a) => balanceByAccountId.get(a.id) ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Comptes</h1>
        <Link
          href="/admin/finance/accounts/new"
          className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium"
        >
          + Nouveau compte
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {accounts.map((account, i) => (
          <div key={account.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{account.name}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    account.scope === "PRO" ? "bg-blue-500/15 text-blue-300" : "bg-purple-500/15 text-purple-300"
                  }`}
                >
                  {account.scope}
                </span>
              </div>
              <p className={`text-xl font-semibold ${balances[i] < 0 ? "text-red-400" : "text-gray-50"}`}>
                {formatEUR(balances[i])}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Dernière réconciliation :{" "}
              {new Intl.DateTimeFormat("fr-FR").format(new Date(account.balanceAsOf))} (
              {formatEUR(Number(account.currentBalance))})
            </p>
            <form action={reconcileAccountAction.bind(null, account.id)} className="flex gap-2">
              <input
                type="number"
                step="0.01"
                name="balance"
                placeholder="Nouveau solde réel"
                required
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm"
              />
              <button type="submit" className="px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-800 text-sm">
                Réconcilier
              </button>
            </form>

            {account.type === "cash" && (
              <form action={syncCashAction.bind(null, account.id)} className="pt-1 border-t border-gray-800">
                <button type="submit" className="w-full px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-800 text-sm">
                  🔄 Synchroniser les espèces (CAM)
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
