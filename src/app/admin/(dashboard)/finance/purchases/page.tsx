import Link from "next/link";
import { listPlannedPurchases } from "@/services/finance/plannedPurchases";
import { createPlannedPurchaseAction, markPurchaseStatusAction, deletePlannedPurchaseAction } from "./actions";

export const dynamic = "force-dynamic";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export default async function PurchasesPage() {
  const purchases = await listPlannedPurchases();
  const planned = purchases.filter((p) => p.status === "planned");
  const bought = purchases.filter((p) => p.status === "bought");
  const totalPlanned = planned.reduce((sum, p) => sum + (p.price ? Number(p.price) : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Achats prévus (atelier &amp; perso)</h1>
      </div>

      {planned.length > 0 && (
        <p className="text-sm text-gray-400">
          Total des achats prévus : <span className="text-amber-300 font-medium">{formatEUR(totalPlanned)}</span>
        </p>
      )}

      <form action={createPlannedPurchaseAction} className="space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-medium text-gray-300">+ Ajouter un article</h2>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Article</label>
          <input type="text" name="label" required placeholder="Ex: Cric rouleur pro" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Lien produit (optionnel)</label>
          <input type="url" name="link" placeholder="https://..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Prix (€)</label>
            <input type="number" step="0.01" min="0" name="price" placeholder="0.00" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Jour d&apos;achat prévu</label>
            <input type="date" name="plannedDate" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Pour</label>
            <select name="scope" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <option value="PRO">Atelier (Pro)</option>
              <option value="PERSO">Perso</option>
            </select>
          </div>
        </div>
        <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-sm">
          Ajouter à la liste
        </button>
      </form>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-400">À acheter</h2>
        {planned.length === 0 ? (
          <p className="text-gray-500 text-sm">Rien de prévu pour l&apos;instant.</p>
        ) : (
          <div className="border border-gray-800 rounded-xl divide-y divide-gray-800">
            {planned.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {p.link ? (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-100">
                        {p.label} ↗
                      </a>
                    ) : (
                      p.label
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className={`px-1.5 py-0.5 rounded-full ${p.scope === "PRO" ? "bg-blue-500/15 text-blue-300" : "bg-purple-500/15 text-purple-300"}`}>
                      {p.scope}
                    </span>
                    {p.plannedDate && ` · prévu le ${new Intl.DateTimeFormat("fr-FR").format(new Date(p.plannedDate))}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {p.price != null && <span className="text-amber-300 font-medium">{formatEUR(Number(p.price))}</span>}
                  <form action={markPurchaseStatusAction.bind(null, p.id, "bought")}>
                    <button type="submit" className="text-xs px-2 py-1 rounded-lg border border-gray-700 hover:bg-gray-800">
                      Acheté
                    </button>
                  </form>
                  <form action={deletePlannedPurchaseAction.bind(null, p.id)}>
                    <button className="text-gray-500 hover:text-red-400 text-xs">Supprimer</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {bought.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-gray-400">Déjà acheté</h2>
          <div className="border border-gray-800 rounded-xl divide-y divide-gray-800">
            {bought.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-gray-500">
                <p className="line-through truncate">{p.label}</p>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {p.price != null && <span>{formatEUR(Number(p.price))}</span>}
                  <Link href="/admin/finance/transactions/new" className="text-xs hover:text-gray-300">
                    Enregistrer la dépense →
                  </Link>
                  <form action={deletePlannedPurchaseAction.bind(null, p.id)}>
                    <button className="hover:text-red-400 text-xs">Supprimer</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
