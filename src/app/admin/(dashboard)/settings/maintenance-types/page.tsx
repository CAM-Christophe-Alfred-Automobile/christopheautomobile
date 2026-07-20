"use client";

import { useEffect, useState } from "react";

const inputClass =
  "w-24 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white " +
  "focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors";

interface MaintenanceType {
  id: string;
  key: string;
  label: string;
  defaultIntervalMonths: number | null;
  defaultIntervalKm: number | null;
  isActive: boolean;
}

export default function MaintenanceTypesPage() {
  const [types, setTypes] = useState<MaintenanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [newInterval, setNewInterval] = useState("");
  const [newIntervalKm, setNewIntervalKm] = useState("");

  async function load() {
    const res = await fetch("/api/admin/maintenance-types").then((r) => r.json());
    if (res.success) setTypes(res.types);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateInterval(id: string, months: string) {
    setTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, defaultIntervalMonths: months ? Number(months) : null } : t))
    );
    await fetch(`/api/admin/maintenance-types/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultIntervalMonths: months ? Number(months) : null }),
    });
  }

  async function updateIntervalKm(id: string, km: string) {
    setTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, defaultIntervalKm: km ? Number(km) : null } : t))
    );
    await fetch(`/api/admin/maintenance-types/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultIntervalKm: km ? Number(km) : null }),
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel) return;
    const key = newLabel
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "_");

    await fetch("/api/admin/maintenance-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        label: newLabel,
        defaultIntervalMonths: newInterval ? Number(newInterval) : null,
        defaultIntervalKm: newIntervalKm ? Number(newIntervalKm) : null,
        sortOrder: types.length,
      }),
    });
    setNewLabel("");
    setNewInterval("");
    setNewIntervalKm("");
    load();
  }

  async function handleDeactivate(id: string, label: string) {
    if (!confirm(`Désactiver le type d'entretien "${label}" ? Il n'apparaîtra plus sur les fiches véhicules.`)) return;
    await fetch(`/api/admin/maintenance-types/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-gray-400 text-sm">Chargement...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Types d&apos;entretien</h1>

      <div className="border border-gray-700 rounded-xl divide-y divide-gray-800">
        {types
          .filter((t) => t.isActive)
          .map((type) => (
            <div key={type.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm">{type.label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className={inputClass}
                  value={type.defaultIntervalMonths ?? ""}
                  onChange={(e) => updateInterval(type.id, e.target.value)}
                />
                <span className="text-xs text-gray-500">mois</span>
                <span className="text-xs text-gray-600">ou</span>
                <input
                  type="number"
                  className={inputClass}
                  value={type.defaultIntervalKm ?? ""}
                  onChange={(e) => updateIntervalKm(type.id, e.target.value)}
                />
                <span className="text-xs text-gray-500">km</span>
                <button
                  onClick={() => handleDeactivate(type.id, type.label)}
                  className="text-xs text-gray-500 hover:text-red-400 cursor-pointer"
                >
                  Désactiver
                </button>
              </div>
            </div>
          ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mt-4">
        <input
          placeholder="Nouveau type (ex: Liquide de frein)"
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <input
          type="number"
          placeholder="Mois"
          className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          value={newInterval}
          onChange={(e) => setNewInterval(e.target.value)}
        />
        <input
          type="number"
          placeholder="Km"
          className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          value={newIntervalKm}
          onChange={(e) => setNewIntervalKm(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold cursor-pointer"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
