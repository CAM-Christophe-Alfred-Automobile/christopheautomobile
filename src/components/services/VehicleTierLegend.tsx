"use client";

import { VEHICLE_TIERS } from "@/app/data/vehicleTiers";

// Petite légende visuelle expliquant pourquoi les tarifs sont affichés en fourchette :
// le prix de la main d'œuvre dépend du gabarit du véhicule (citadine -> SUV/utilitaire).
const TIER_ICONS: Record<string, string> = {
  citadine: "🚗",
  standard: "🚙",
  suv: "🚚",
};

export default function VehicleTierLegend() {
  return (
    <div className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-5 sm:p-6">
      <p className="text-center text-gray-300 text-sm sm:text-base mb-4">
        💡 Le prix de la main d&apos;œuvre varie selon le{" "}
        <strong className="text-amber-400">gabarit de votre véhicule</strong> — voici les 3
        catégories :
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {VEHICLE_TIERS.map((tier) => (
          <div
            key={tier.key}
            className="flex items-center gap-3 bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3"
          >
            <span className="text-2xl">{TIER_ICONS[tier.key] ?? "🚘"}</span>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">{tier.label}</p>
              <p className="text-gray-400 text-xs leading-tight truncate">{tier.examples}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-gray-500 text-xs mt-4">
        Pas sûr de la catégorie de votre véhicule ? Le prix exact est confirmé lors de la
        réservation en ligne.
      </p>
    </div>
  );
}
