import Link from "next/link";
import { listAccounts } from "@/services/finance/accounts";
import { listCategories } from "@/services/finance/categories";
import { getRecurringItem } from "@/services/finance/recurringItems";
import { updateRecurringItemAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditRecurringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, accounts, categories] = await Promise.all([
    getRecurringItem(id),
    listAccounts(),
    listCategories(),
  ]);
  const updateAction = updateRecurringItemAction.bind(null, id);

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Modifier {item.label}</h1>
      <form action={updateAction} className="space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Libellé</label>
          <input
            type="text"
            name="label"
            required
            defaultValue={item.label}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Type</label>
            <select name="direction" defaultValue={item.direction} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <option value="expense">Dépense</option>
              <option value="income">Entrée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Montant (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="amount"
              required
              defaultValue={Number(item.amount)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Compte</label>
            <select name="accountId" required defaultValue={item.accountId} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.scope})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Scope</label>
            <select name="scope" defaultValue={item.scope} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <option value="PRO">Pro</option>
              <option value="PERSO">Perso</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Catégorie</label>
          <select name="categoryId" defaultValue={item.categoryId ?? ""} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
            <option value="">Aucune</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.scope})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Fréquence</label>
            <select name="frequency" defaultValue={item.frequency} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <option value="monthly">Mensuelle</option>
              <option value="quarterly">Trimestrielle</option>
              <option value="annual">Annuelle</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="custom_days">Intervalle (jours)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Jour du mois (optionnel)</label>
            <input
              type="number"
              name="dayOfMonth"
              min="1"
              max="31"
              defaultValue={item.dayOfMonth ?? ""}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Intervalle en jours (si fréquence = intervalle)</label>
          <input
            type="number"
            name="intervalDays"
            min="1"
            defaultValue={item.intervalDays ?? ""}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Date de début</label>
            <input
              type="date"
              name="startDate"
              defaultValue={new Date(item.startDate).toISOString().slice(0, 10)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Date de fin (optionnel)</label>
            <input
              type="date"
              name="endDate"
              defaultValue={item.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : ""}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" name="amountIsEstimate" defaultChecked={item.amountIsEstimate} className="rounded" />
          Montant estimé (variable, ex: revenus clients) — élargit la fourchette de prévision
        </label>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium">
            Enregistrer
          </button>
          <Link href="/admin/finance/recurring" className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
