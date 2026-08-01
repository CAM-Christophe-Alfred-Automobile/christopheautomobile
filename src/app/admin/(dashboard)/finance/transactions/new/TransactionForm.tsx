"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createTransactionAction } from "../actions";

type Account = { id: string; name: string; scope: string; balance: number };
type Category = { id: string; name: string; scope: string };

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TransactionForm({ accounts, categories, today }: { accounts: Account[]; categories: Category[]; today: string }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [direction, setDirection] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today);
  const [categoryId, setCategoryId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const parsedAmount = Number(amount.replace(",", "."));
  const hasValidAmount = amount !== "" && Number.isFinite(parsedAmount);

  const balanceAfter = useMemo(() => {
    if (!selectedAccount || !hasValidAmount) return null;
    const signed = direction === "expense" ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);
    return selectedAccount.balance + signed;
  }, [selectedAccount, hasValidAmount, parsedAmount, direction]);

  async function handleReceiptSelected(file: File) {
    setScanError(null);
    setScanned(false);
    setScanning(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await fetch("/api/admin/finance/receipts/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      if (!data.success) {
        setScanError(data.error ?? "Lecture du ticket impossible.");
        return;
      }
      const result = data.result as { amount?: number; date?: string; merchant?: string; category?: string };
      if (result.amount != null) setAmount(String(result.amount));
      if (result.date) setDate(result.date);
      if (result.merchant && !description) setDescription(result.merchant);
      if (result.category) {
        const match = categories.find(
          (c) => c.name.toLowerCase() === result.category!.toLowerCase() && (c.scope === selectedAccount?.scope || c.scope === "BOTH")
        );
        if (match) setCategoryId(match.id);
      }
      setScanned(true);
    } catch {
      setScanError("Lecture du ticket impossible — vérifie ta connexion.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <form action={createTransactionAction} className="space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={scanning}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-sm font-medium py-2.5 disabled:opacity-60"
        >
          {scanning ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-emerald-300/40 border-t-emerald-300 animate-spin" />
              Lecture du ticket…
            </>
          ) : (
            <>📷 Scanner un ticket (remplit le formulaire automatiquement)</>
          )}
        </button>
        {scanError && <p className="text-xs text-red-400 mt-1">{scanError}</p>}
        {scanned && !scanError && (
          <p className="text-xs text-emerald-400 mt-1">Lu automatiquement — vérifie les champs avant d&apos;enregistrer.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Type</label>
          <select
            name="direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as "expense" | "income")}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="expense">Dépense</option>
            <option value="income">Entrée</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Description</label>
        <input
          type="text"
          name="description"
          required
          placeholder="Ex: Plein de carburant"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Montant (€)</label>
          <input
            type="number"
            name="amount"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Compte</label>
          <select
            name="accountId"
            required
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.scope})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedAccount && (
        <div className="text-xs text-gray-400 bg-gray-800/60 rounded-lg px-3 py-2">
          Solde actuel de <span className="text-gray-200">{selectedAccount.name}</span> : {formatEUR(selectedAccount.balance)}
          {balanceAfter !== null && (
            <>
              {" "}
              → après cette transaction :{" "}
              <span className={balanceAfter < 0 ? "text-red-400 font-medium" : "text-emerald-400 font-medium"}>
                {formatEUR(balanceAfter)}
              </span>
              . Vérifie que ça correspond bien à ce que tu attends avant d&apos;enregistrer (si le montant que tu as en tête inclut déjà cette opération, n&apos;ajoute pas de doublon — utilise plutôt «&nbsp;Réconcilier&nbsp;» sur la page Comptes).
            </>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-300 mb-1">Catégorie</label>
        <select
          name="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
        >
          <option value="">Aucune</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.scope})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Notes (optionnel)</label>
        <textarea name="notes" rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Justificatif / ticket (optionnel)</label>
        <input
          ref={fileInputRef}
          type="file"
          name="receipt"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleReceiptSelected(file);
          }}
          className="w-full text-sm text-gray-300 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-gray-700 file:bg-gray-800 file:text-gray-300"
        />
        <p className="text-xs text-gray-500 mt-1">
          Prendre une photo ici la lit automatiquement (montant, date, catégorie) et la garde comme justificatif.
        </p>
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
  );
}
