import Link from "next/link";
import { createAccountAction } from "../actions";

export default function NewAccountPage() {
  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Nouveau compte</h1>
      <form action={createAccountAction} className="space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nom</label>
          <input type="text" name="name" required placeholder="Ex: Livret A" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Type</label>
            <select name="type" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <option value="checking">Compte courant</option>
              <option value="savings">Épargne</option>
              <option value="cash">Espèces</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Scope</label>
            <select name="scope" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <option value="PRO">Pro</option>
              <option value="PERSO">Perso</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Solde actuel (€)</label>
          <input type="number" step="0.01" name="currentBalance" defaultValue={0} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium">
            Créer
          </button>
          <Link href="/admin/finance/accounts" className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
