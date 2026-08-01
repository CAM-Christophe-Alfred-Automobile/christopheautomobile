import Link from "next/link";
import { listTransactions } from "@/services/finance/transactions";
import { listAccounts } from "@/services/finance/accounts";
import { listCategories } from "@/services/finance/categories";
import { deleteTransactionAction } from "./actions";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; accountId?: string; categoryId?: string }>;
}) {
  const params = await searchParams;
  const scope = params.scope === "PRO" || params.scope === "PERSO" ? params.scope : undefined;

  const [transactions, accounts, categories] = await Promise.all([
    listTransactions({
      scope,
      accountId: params.accountId || undefined,
      categoryId: params.categoryId || undefined,
    }),
    listAccounts(),
    listCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Transactions</h1>
        <div className="flex gap-2">
          <a
            href="/api/admin/finance/transactions/export"
            className="px-3 py-2 rounded-lg border border-gray-700 text-sm hover:bg-gray-800"
          >
            Exporter CSV
          </a>
          <Link
            href="/admin/finance/transactions/import"
            className="px-3 py-2 rounded-lg border border-gray-700 text-sm hover:bg-gray-800"
          >
            Importer un CSV
          </Link>
          <Link
            href="/admin/finance/transactions/new"
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium"
          >
            + Nouvelle transaction
          </Link>
        </div>
      </div>

      <form className="flex flex-wrap gap-2 text-sm" method="get">
        <select name="scope" defaultValue={params.scope ?? ""} className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5">
          <option value="">Tous les scopes</option>
          <option value="PRO">Pro</option>
          <option value="PERSO">Perso</option>
        </select>
        <select name="accountId" defaultValue={params.accountId ?? ""} className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5">
          <option value="">Tous les comptes</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select name="categoryId" defaultValue={params.categoryId ?? ""} className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5">
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-800">
          Filtrer
        </button>
      </form>

      <div className="border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 text-left">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Compte</th>
              <th className="px-3 py-2">Catégorie</th>
              <th className="px-3 py-2">Scope</th>
              <th className="px-3 py-2 text-right">Montant</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                  Aucune transaction. Ajoutez-en une ou importez un CSV.
                </td>
              </tr>
            )}
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-900/50">
                <td className="px-3 py-2 whitespace-nowrap">
                  {new Intl.DateTimeFormat("fr-FR").format(new Date(tx.date))}
                </td>
                <td className="px-3 py-2">
                  <Link href={`/admin/finance/transactions/${tx.id}`} className="hover:underline">
                    {tx.description}
                  </Link>
                  {tx.isTransfer && (
                    <span className="ml-2 text-xs text-gray-500">(virement)</span>
                  )}
                  {tx.attachmentPath && (
                    <a
                      href={tx.attachmentPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-xs text-gray-500 hover:text-emerald-400"
                    >
                      📎 justificatif
                    </a>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-400">{tx.account.name}</td>
                <td className="px-3 py-2 text-gray-400">{tx.category?.name ?? "—"}</td>
                <td className="px-3 py-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      tx.scope === "PRO" ? "bg-blue-500/15 text-blue-300" : "bg-purple-500/15 text-purple-300"
                    }`}
                  >
                    {tx.scope}
                  </span>
                </td>
                <td
                  className={`px-3 py-2 text-right font-medium whitespace-nowrap ${
                    Number(tx.amount) < 0 ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {formatEUR(Number(tx.amount))}
                </td>
                <td className="px-3 py-2 text-right">
                  <form action={deleteTransactionAction.bind(null, tx.id)}>
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
}
