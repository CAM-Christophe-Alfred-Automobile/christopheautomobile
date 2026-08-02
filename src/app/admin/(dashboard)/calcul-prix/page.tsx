"use client";

import { useEffect, useState } from "react";
import { VEHICLE_TIERS, getVehicleTierMultiplier, type VehicleTier } from "@/app/data/vehicleTiers";

const PRESETS = [
  { label: "15 min", hours: 0, minutes: 15 },
  { label: "30 min", hours: 0, minutes: 30 },
  { label: "45 min", hours: 0, minutes: 45 },
  { label: "1h", hours: 1, minutes: 0 },
  { label: "1h30", hours: 1, minutes: 30 },
  { label: "2h", hours: 2, minutes: 0 },
  { label: "3h", hours: 3, minutes: 0 },
  { label: "4h", hours: 4, minutes: 0 },
];

export default function CalculPrixPage() {
  const [defaultRate, setDefaultRate] = useState<number | null>(null);
  const [rate, setRate] = useState("60");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [saving, setSaving] = useState(false);
  const [tier, setTier] = useState<VehicleTier>("standard");

  useEffect(() => {
    fetch("/api/admin/shop-settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const r = Number(d.settings.hourlyRate);
          setDefaultRate(r);
          setRate(String(r));
        }
      });
  }, []);

  const totalHours = (Number(hours) || 0) + (Number(minutes) || 0) / 60;
  const basePrice = totalHours * (Number(rate) || 0);
  const multiplier = getVehicleTierMultiplier(tier);
  const price = basePrice * multiplier;
  const rateChanged = defaultRate != null && Number(rate) !== defaultRate && !Number.isNaN(Number(rate));

  function applyPreset(h: number, m: number) {
    setHours(String(h));
    setMinutes(String(m));
  }

  async function saveAsDefaultRate() {
    setSaving(true);
    const res = await fetch("/api/admin/shop-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hourlyRate: Number(rate) }),
    });
    const data = await res.json();
    if (data.success) setDefaultRate(Number(rate));
    setSaving(false);
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-6">Calcul prix main d&apos;œuvre</h1>

      <div className="space-y-5">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Tarif horaire (€/h)</label>
          <input
            type="number"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          {rateChanged && (
            <button
              onClick={saveAsDefaultRate}
              disabled={saving}
              className="mt-1 text-xs text-amber-400 hover:text-amber-300 cursor-pointer disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : `Enregistrer ${rate}€/h comme tarif par défaut`}
            </button>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Temps passé</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-[11px] text-gray-500">heures</span>
            </div>
            <div className="flex-1">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-[11px] text-gray-500">minutes</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.hours, p.minutes)}
                className="px-2.5 py-1 rounded-full border border-gray-700 text-xs text-gray-300 hover:border-amber-500 hover:text-amber-400 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Gabarit du véhicule</label>
          <div className="flex flex-wrap gap-1.5">
            {VEHICLE_TIERS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTier(t.key)}
                title={t.examples}
                className={`px-3 py-1.5 rounded-full border text-xs cursor-pointer ${
                  tier === t.key
                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                    : "border-gray-700 text-gray-300 hover:border-amber-500 hover:text-amber-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {VEHICLE_TIERS.find((t) => t.key === tier)?.examples}
          </p>
        </div>

        <div className="rounded-xl bg-gray-900 border border-gray-700 p-5 text-center">
          <p className="text-xs text-gray-500 mb-1">
            {totalHours.toFixed(2)}h × {rate || 0}€/h
            {multiplier !== 1 && ` × ${multiplier.toFixed(2)} (gabarit)`}
          </p>
          <p className="text-4xl font-bold text-amber-400">
            {price.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </p>
          {multiplier !== 1 && (
            <p className="text-[11px] text-gray-500 mt-1">
              Prix standard (berline) : {basePrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
