// Secteurs géographiques desservis. Chaque secteur n'est plus assigné à un jour de semaine
// fixe (voir DayZoneLock + particulierSlots.ts) : n'importe quel secteur peut réserver
// n'importe quel jour ; c'est la première réservation d'une demi-journée sur une date donnée
// qui verrouille dynamiquement l'autre demi-journée de cette date à la même zone.

export type Zone = {
  key: string;
  label: string;
  lat: number;
  lon: number;
};

// Coordonnées obtenues via l'API Adresse (data.gouv.fr) - centres de secteur.
export const zones: Zone[] = [
  { key: "aix", label: "Aix-en-Provence et alentours", lat: 43.541369, lon: 5.406124 },
  { key: "senas", label: "Sénas et alentours", lat: 43.744186, lon: 5.088084 },
  { key: "plan-de-campagne", label: "Plan-de-Campagne et alentours", lat: 43.418997, lon: 5.362977 },
  { key: "miramas", label: "Miramas et alentours", lat: 43.582796, lon: 5.009776 },
  { key: "salon-autre", label: "Salon-de-Provence / Autre secteur", lat: 43.6377, lon: 5.062036 },
];

const SERVICE_RADIUS_KM = 40;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface ResolvedZone {
  zone: Zone;
  distanceKm: number; // distance depuis Salon-de-Provence (point de départ), utilisée pour le tarif de déplacement
  outOfArea: boolean;
}

// Trouve le secteur le plus proche des coordonnées données (plus proche voisin parmi les 5 centres),
// mais la distance retournée est toujours depuis Salon-de-Provence (point de départ réel des trajets).
export function resolveZone(lat: number, lon: number): ResolvedZone {
  const distanceFromSalon = haversineKm(43.6377, 5.062036, lat, lon);
  let closest = zones[0];
  let closestDistance = Infinity;
  for (const z of zones) {
    const d = haversineKm(z.lat, z.lon, lat, lon);
    if (d < closestDistance) {
      closestDistance = d;
      closest = z;
    }
  }
  return { zone: closest, distanceKm: distanceFromSalon, outOfArea: distanceFromSalon > SERVICE_RADIUS_KM };
}
