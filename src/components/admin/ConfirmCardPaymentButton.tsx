"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmCardPaymentButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function confirm() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/finance/payments/${paymentId}/confirm-received`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Erreur : impossible de confirmer la réception de ce paiement.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={confirm}
      disabled={loading}
      className="text-xs px-2 py-1 rounded-md border border-emerald-700 text-emerald-400 hover:bg-emerald-950/40 disabled:opacity-50 flex-shrink-0"
    >
      {loading ? "..." : "✅ Confirmer reçu"}
    </button>
  );
}
