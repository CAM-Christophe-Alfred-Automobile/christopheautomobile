import { VEHICLE_TIERS } from "@/app/data/vehicleTiers";

// Fourchette de prix main d'œuvre selon le gabarit du véhicule (citadine -> SUV/utilitaire),
// à partir du prix de référence (tarif "Berline / Standard") stocké dans services.json.
export function priceRange(basePrice: number): { min: number; max: number } {
  const multipliers = VEHICLE_TIERS.map((t) => t.multiplier);
  return {
    min: Math.round(basePrice * Math.min(...multipliers)),
    max: Math.round(basePrice * Math.max(...multipliers)),
  };
}

export function formatPriceRange(basePrice: number): string {
  const { min, max } = priceRange(basePrice);
  return min === max ? `${min}€` : `${min}€ – ${max}€`;
}
