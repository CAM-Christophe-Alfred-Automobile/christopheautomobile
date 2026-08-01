import Link from "next/link";
import { listCategories, getMonthToDateSpendByCategory } from "@/services/finance/categories";
import { updateCategoryBudgetAction } from "./actions";

export const dynamic = "force-dynamic";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export default async function CategoriesPage() {
  const [categories, spendByCategory] = await Promise.all([listCategories(), getMonthToDateSpendByCategory()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Catégories</h1>
        <div className="flex gap-2">
          <Link href="/admin/finance/recurring" className="px-3 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-sm">
            Voir les abonnements / crédits / assurances récurrents →
          </Link>
          <Link href="/admin/finance/categories/new" className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium">
            + Nouvelle catégorie
          </Link>
        </div>
      </div>

      <div className="border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 text-left">
            <tr>
              <th className="px-3 py-2">Nom</th>
              <th className="px-3 py-2">Scope</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Essentiel</th>
              <th className="px-3 py-2">Budget mensuel</th>
              <th className="px-3 py-2 w-48">Ce mois-ci</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {categories.map((c) => {
              const budget = c.monthlyBudget ? Number(c.monthlyBudget) : null;
              const spent = spendByCategory[c.id] ?? 0;
              const ratio = budget ? Math.min(spent / budget, 1) : 0;
              const over = budget !== null && spent > budget;

              return (
                <tr key={c.id}>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      {c.color && <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />}
                      {c.name}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-400">{c.scope}</td>
                  <td className="px-3 py-2 text-gray-400">{c.kind === "income" ? "Entrée" : "Dépense"}</td>
                  <td className="px-3 py-2 text-gray-400">{c.isEssential ? "Oui" : ""}</td>
                  <td className="px-3 py-2">
                    <form action={updateCategoryBudgetAction.bind(null, c.id)} className="flex gap-2 items-center">
                      <input
                        type="number"
                        step="0.01"
                        name="monthlyBudget"
                        defaultValue={budget ?? ""}
                        placeholder="—"
                        className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1"
                      />
                      <button type="submit" className="text-xs text-gray-500 hover:text-emerald-400">
                        OK
                      </button>
                    </form>
                  </td>
                  <td className="px-3 py-2">
                    {budget !== null ? (
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${over ? "bg-red-500" : ratio > 0.85 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${ratio * 100}%` }}
                          />
                        </div>
                        <p className={`text-xs ${over ? "text-red-400" : "text-gray-500"}`}>
                          {formatEUR(spent)} / {formatEUR(budget)}
                        </p>
                      </div>
                    ) : (
                      spent > 0 && <p className="text-xs text-gray-500">{formatEUR(spent)}</p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
