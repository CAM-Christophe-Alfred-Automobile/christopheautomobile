"use client";

import { useState, useMemo } from "react";
import type { Aspsp } from "@/lib/finance/enableBankingClient";
import { startBankConnectionAction } from "./actions";

export default function BankPicker({ accountId, aspsps }: { accountId: string; aspsps: Aspsp[] }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return aspsps.slice(0, 30);
    return aspsps.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 30);
  }, [aspsps, query]);

  async function handlePick(aspsp: Aspsp) {
    setError(null);
    setLoading(`${aspsp.name}|${aspsp.country}`);
    try {
      const { redirectUrl } = await startBankConnectionAction(accountId, aspsp.name, aspsp.country);
      window.location.assign(redirectUrl);
    } catch {
      setError("Impossible de démarrer la connexion. Réessayez.");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher votre banque (ex: Revolut, Nickel...)"
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
        autoFocus
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="border border-gray-800 rounded-xl divide-y divide-gray-800 max-h-96 overflow-y-auto">
        {filtered.length === 0 && <p className="px-3 py-4 text-sm text-gray-500">Aucune banque trouvée.</p>}
        {filtered.map((aspsp) => {
          const key = `${aspsp.name}|${aspsp.country}`;
          return (
            <button
              key={key}
              onClick={() => handlePick(aspsp)}
              disabled={loading !== null}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-900 disabled:opacity-50"
            >
              <span>{aspsp.name}</span>
              <span className="text-xs text-gray-500">
                {loading === key ? "Connexion..." : aspsp.country}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
