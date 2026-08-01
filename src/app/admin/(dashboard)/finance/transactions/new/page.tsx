import Link from "next/link";
import { listAccounts, getAllCurrentBalances } from "@/services/finance/accounts";
import { listCategories } from "@/services/finance/categories";
import TransactionForm from "./TransactionForm";

export const dynamic = "force-dynamic";

export default async function NewTransactionPage() {
  const [accounts, categories] = await Promise.all([listAccounts(), listCategories()]);
  const balanceByAccountId = await getAllCurrentBalances(accounts);
  const accountsWithBalance = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    scope: a.scope,
    balance: balanceByAccountId.get(a.id) ?? 0,
  }));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Nouvelle transaction</h1>
        <Link href="/admin/finance/transactions/transfer" className="text-sm text-gray-400 hover:text-white">
          Virement interne pro ↔ perso →
        </Link>
      </div>

      <TransactionForm accounts={accountsWithBalance} categories={categories} today={today} />
    </div>
  );
}
