"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StockPhoto {
  id: string;
  url: string;
}

interface StockPart {
  id: string;
  name: string;
  quantity: number;
  location: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  photos: StockPhoto[];
}

export default function StockListPage() {
  const [query, setQuery] = useState("");
  const [parts, setParts] = useState<StockPart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(`/api/admin/stock?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setParts(d.parts);
          setLoading(false);
        });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Stock</h1>
        <Link
          href="/admin/stock/nouvelle"
          className="px-4 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold"
        >
          + Nouvelle pièce
        </Link>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher : nom, référence, véhicule, emplacement..."
        className="w-full px-3 py-2 mb-6 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
      />

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : parts.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {query ? "Aucune pièce ne correspond à votre recherche." : "Aucune pièce enregistrée pour le moment."}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {parts.map((part) => (
            <Link
              key={part.id}
              href={`/admin/stock/${part.id}`}
              className="rounded-lg border border-gray-700 overflow-hidden hover:border-amber-500/50 transition-colors"
            >
              <div className="aspect-square bg-gray-800 flex items-center justify-center">
                {part.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={part.photos[0].url} alt={part.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl opacity-30">🔩</span>
                )}
              </div>
              <div className="p-2 space-y-0.5">
                <p className="text-sm font-medium text-white truncate">{part.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {[part.vehicleMake, part.vehicleModel].filter(Boolean).join(" ") || "Véhicule non identifié"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  Qté {part.quantity}
                  {part.location ? ` · ${part.location}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
