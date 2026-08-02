import { VEHICLE_TIERS, getVehicleTierMultiplier, type VehicleTier } from "@/app/data/vehicleTiers";

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

// Applique le multiplicateur du gabarit sélectionné à un prix de service (page booking :
// une fois le gabarit choisi, on affiche le prix ajusté plutôt que la fourchette générique).
// Gère les prix numériques et les chaînes "À partir de X€" ; laisse le reste inchangé (null, "Sur devis"...).
export function applyTierToPrice(
  prix: number | string | null | undefined,
  tier: VehicleTier
): number | string | null | undefined {
  if (prix === null || prix === undefined) return prix;
  const multiplier = getVehicleTierMultiplier(tier);

  if (typeof prix === "number") {
    return Math.round(prix * multiplier);
  }

  const match = prix.match(/(\d+)/);
  if (match) {
    const amount = parseInt(match[1], 10);
    if (!isNaN(amount)) {
      return prix.replace(/\d+/, String(Math.round(amount * multiplier)));
    }
  }
  return prix;
}
