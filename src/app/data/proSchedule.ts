// Types d'événements Cal.com dédiés aux professionnels (garages/entreprises).
// Contrairement à la réservation grand public, pas de secteur géographique ni
// de catégorie de prestation : juste une disponibilité directe dans l'agenda.

export type ProBookingType = "urgence" | "journee";

export const proEventTypes: Record<ProBookingType, { eventTypeId: number; lengthInMinutes: number }> = {
  urgence: { eventTypeId: 6468534, lengthInMinutes: 120 },
  journee: { eventTypeId: 6468535, lengthInMinutes: 510 },
};
