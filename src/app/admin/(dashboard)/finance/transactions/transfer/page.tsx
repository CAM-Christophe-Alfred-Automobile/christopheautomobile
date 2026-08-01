import Link from "next/link";
import { listAccounts } from "@/services/finance/accounts";
import { createTransferAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function TransferPage() {
  const accounts = await listAccounts();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Virement interne pro ↔ perso</h1>
      <p className="text-sm text-gray-400">
        Utilisez ceci quand vous déplacez de l&apos;argent entre vos comptes pro et perso. Ce
        mouvement sera exclu de vos statistiques de revenus/dépenses et de vos prévisions.
      </p>

      <form action={createTransferAction} className="space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Depuis</label>
            <select name="fromAccountId" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.scope})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Vers</label>
            <select name="toAccountId" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.scope})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Date</label>
            <input type="date" name="date" defaultValue={today} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Montant (€)</label>
            <input type="number" name="amount" step="0.01" min="0" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Description</label>
          <input type="text" name="description" defaultValue="Virement interne" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium">
            Enregistrer le virement
          </button>
          <Link href="/admin/finance/transactions" className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
