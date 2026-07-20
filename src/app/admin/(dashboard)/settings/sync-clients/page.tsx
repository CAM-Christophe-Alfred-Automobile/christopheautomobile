"use client";

import { useState } from "react";

interface SyncResultRow {
  name: string;
  matched: boolean;
  clientId?: string;
  fieldsUpdated: string[];
}

export default function SyncClientsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SyncResultRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResults(null);

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/settings/sync-clients", { method: "POST", body: fd }).then((r) => r.json());

    setLoading(false);
    if (res.success) setResults(res.results);
    else setError(res.error || "Erreur lors de l'import.");
  }

  const updatedCount = results?.filter((r) => r.matched && r.fieldsUpdated.length > 0).length ?? 0;
  const unmatched = results?.filter((r) => !r.matched) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Mise à jour des clients</h1>
      <p className="text-gray-400 text-sm mb-6">
        Complète les coordonnées manquantes (email, téléphone, adresse) des clients déjà présents dans l&apos;outil, à
        partir d&apos;un export CSV des contacts Abby. Les champs déjà renseignés ne sont jamais écrasés.
        <br />
        Dans Abby : Contacts → Télécharger en CSV.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-gray-800 file:text-white file:text-sm hover:file:bg-gray-700 cursor-pointer"
        />
        <button
          type="submit"
          disabled={!file || loading}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-medium rounded-lg text-sm transition-colors cursor-pointer"
        >
          {loading ? "Import..." : "Importer"}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {results && (
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            {updatedCount} client(s) mis à jour sur {results.length} contact(s) lu(s).
          </p>

          <div className="overflow-x-auto border border-gray-700 rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-gray-400 text-left">
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Résultat</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-t border-gray-800">
                    <td className="px-4 py-3 text-white">{r.name}</td>
                    <td className="px-4 py-3">
                      {!r.matched ? (
                        <span className="text-gray-500">Aucun client correspondant</span>
                      ) : r.fieldsUpdated.length > 0 ? (
                        <span className="text-green-400">Mis à jour : {r.fieldsUpdated.join(", ")}</span>
                      ) : (
                        <span className="text-gray-500">Déjà à jour</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {unmatched.length > 0 && (
            <p className="text-xs text-gray-500">
              {unmatched.length} contact(s) du fichier ne correspondent à aucun client existant (nom/prénom
              différents) — ils n&apos;ont pas été créés automatiquement.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
