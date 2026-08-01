import Link from "next/link";
import { createCategoryAction } from "../actions";

export default function NewCategoryPage() {
  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Nouvelle catégorie</h1>
      <form action={createCategoryAction} className="space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nom</label>
          <input type="text" name="name" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Scope</label>
            <select name="scope" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <option value="PRO">Pro</option>
              <option value="PERSO">Perso</option>
              <option value="BOTH">Les deux</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Type</label>
            <select name="kind" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <option value="expense">Dépense</option>
              <option value="income">Entrée</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Budget mensuel (optionnel, €)</label>
          <input type="number" step="0.01" name="monthlyBudget" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" name="isEssential" className="rounded" />
          Dépense essentielle (priorisée dans les prévisions)
        </label>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium">
            Créer
          </button>
          <Link href="/admin/finance/categories" className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
