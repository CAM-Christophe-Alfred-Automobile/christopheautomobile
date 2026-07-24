// Répartition des secteurs géographiques par jour de la semaine.
// weekday : 1 = lundi ... 5 = vendredi (0 = dimanche, 6 = samedi, non utilisés ici)

export type Zone = {
  key: string;
  label: string;
  weekday: number | null; // null = jour libre, toutes zones acceptées
  lat: number;
  lon: number;
};

// Coordonnées obtenues via l'API Adresse (data.gouv.fr) - centres de secteur.
export const zones: Zone[] = [
  { key: "aix", label: "Aix-en-Provence et alentours", weekday: 1, lat: 43.541369, lon: 5.406124 },
  { key: "senas", label: "Sénas et alentours", weekday: 2, lat: 43.744186, lon: 5.088084 },
  { key: "plan-de-campagne", label: "Plan-de-Campagne et alentours", weekday: 3, lat: 43.418997, lon: 5.362977 },
  { key: "miramas", label: "Miramas et alentours", weekday: 4, lat: 43.582796, lon: 5.009776 },
  { key: "salon-autre", label: "Salon-de-Provence / Autre secteur", weekday: null, lat: 43.6377, lon: 5.062036 },
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
  distanceKm: number;
  outOfArea: boolean;
}

// Trouve le secteur le plus proche des coordonnées données (plus proche voisin parmi les 5 centres).
export function resolveZone(lat: number, lon: number): ResolvedZone {
  const centerDistance = haversineKm(43.6377, 5.062036, lat, lon);
  let closest = zones[0];
  let closestDistance = Infinity;
  for (const z of zones) {
    const d = haversineKm(z.lat, z.lon, lat, lon);
    if (d < closestDistance) {
      closestDistance = d;
      closest = z;
    }
  }
  return { zone: closest, distanceKm: closestDistance, outOfArea: centerDistance > SERVICE_RADIUS_KM };
}

// Mapping durée (minutes) -> ID de type d'événement Cal.com
export const eventTypeIdByDuration: Record<number, number> = {
  60: 3700522,
  90: 3701109,
  120: 3703088,
  150: 3703100,
  180: 3703111,
  210: 3710256,
  240: 3703124,
  270: 3710260,
  300: 3703144,
  330: 3710261,
  360: 3703162,
  480: 3703180,
};

export function getEventTypeId(dureeMinutes: number): number | null {
  if (dureeMinutes in eventTypeIdByDuration) return eventTypeIdByDuration[dureeMinutes];
  // Pour les durées "sur devis" personnalisées, on arrondit au palier supérieur existant.
  const paliers = Object.keys(eventTypeIdByDuration)
    .map(Number)
    .sort((a, b) => a - b);
  const palier = paliers.find((p) => p >= dureeMinutes);
  return palier ? eventTypeIdByDuration[palier] : null;
}
