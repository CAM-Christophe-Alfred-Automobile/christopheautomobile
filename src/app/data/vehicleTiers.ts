// Tarif selon la taille/motorisation du véhicule (multiplicateur appliqué au tarif standard).
// Partagé entre l'UI (affichage du prix) et l'API (recalcul serveur du prix, pour ne jamais
// faire confiance à un prix envoyé directement par le client).

export type VehicleTier = "citadine" | "standard" | "suv";

export const VEHICLE_TIERS: { key: VehicleTier; label: string; examples: string; multiplier: number }[] = [
  { key: "citadine", label: "Citadine", examples: "Clio, 208, Twingo...", multiplier: 50 / 60 },
  { key: "standard", label: "Berline / Standard", examples: "308, Golf, Mégane...", multiplier: 1 },
  { key: "suv", label: "SUV / Utilitaire", examples: "Duster, Kangoo, Trafic...", multiplier: 65 / 60 },
];

export function getVehicleTierMultiplier(tier: string | undefined | null): number {
  return VEHICLE_TIERS.find((t) => t.key === tier)?.multiplier ?? 1;
}
