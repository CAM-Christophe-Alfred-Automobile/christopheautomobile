import Link from "next/link";
import { notFound } from "next/navigation";
import { getTransaction } from "@/services/finance/transactions";
import { listCategories } from "@/services/finance/categories";
import { updateTransactionAction } from "../actions";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [transaction, categories] = await Promise.all([getTransaction(id), listCategories()]);

  if (!transaction) notFound();

  const boundAction = updateTransactionAction.bind(null, id);
  const dateValue = new Date(transaction.date).toISOString().slice(0, 10);
  const amount = Number(transaction.amount);

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Modifier la transaction</h1>

      <form action={boundAction} className="space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Date</label>
            <input type="date" name="date" defaultValue={dateValue} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Type</label>
            <select name="direction" defaultValue={amount < 0 ? "expense" : "income"} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <option value="expense">Dépense</option>
              <option value="income">Entrée</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Description</label>
          <input type="text" name="description" defaultValue={transaction.description} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Montant (€)</label>
          <input type="number" name="amount" step="0.01" min="0" defaultValue={Math.abs(amount)} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Catégorie</label>
          <select name="categoryId" defaultValue={transaction.categoryId ?? ""} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
            <option value="">Aucune</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.scope})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Notes</label>
          <textarea name="notes" rows={2} defaultValue={transaction.notes ?? ""} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium">
            Enregistrer
          </button>
          <Link href="/admin/finance/transactions" className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
