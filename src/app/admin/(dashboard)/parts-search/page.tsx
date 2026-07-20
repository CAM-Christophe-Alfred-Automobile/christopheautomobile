"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SearchField from "@/components/search/SearchField";

interface PartSearchResult {
  partId: string;
  designation: string;
  reference: string | null;
  quantity: string | null;
  interventionId: string;
  interventionDate: string;
  vehicleId: string;
  vehicleLabel: string;
  clientId: string;
  clientLabel: string;
}

function PartsSearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PartSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function runSearch(q: string) {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/parts/search?q=${encodeURIComponent(q)}`).then((r) => r.json());
    if (res.success) setResults(res.results);
    setSearched(true);
    setLoading(false);
  }

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) runSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Recherche pièces &amp; fluides</h1>
      <p className="text-gray-400 text-sm mb-6">
        Retrouve rapidement une pièce, une référence ou une quantité déjà utilisée. Ex : &quot;clio huile&quot;,
        &quot;plaquette 308&quot;.
      </p>

      <SearchField value={query} onChange={runSearch} placeholder="Rechercher..." />

      {loading && <p className="text-gray-400 text-sm">Recherche...</p>}

      {!loading && searched && results.length === 0 && (
        <p className="text-gray-500 text-sm">Aucun résultat pour &quot;{query}&quot;.</p>
      )}

      {!loading && results.length > 0 && (
        <div className="overflow-x-auto border border-gray-700 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">Pièce / fluide</th>
                <th className="px-4 py-3 font-medium">Référence</th>
                <th className="px-4 py-3 font-medium">Quantité</th>
                <th className="px-4 py-3 font-medium">Véhicule</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.partId} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-white">{r.designation}</td>
                  <td className="px-4 py-3 text-gray-400">{r.reference ?? "—"}</td>
                  <td className="px-4 py-3 text-amber-400">{r.quantity ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-300">{r.vehicleLabel}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${r.clientId}`} className="text-amber-400 hover:text-amber-300">
                      {r.clientLabel}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(r.interventionDate).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PartsSearchPage() {
  return (
    <Suspense fallback={<p className="text-gray-400 text-sm">Chargement...</p>}>
      <PartsSearchContent />
    </Suspense>
  );
}
