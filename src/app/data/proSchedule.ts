// Types d'événements Cal.com dédiés aux professionnels (garages/entreprises).
// Contrairement à la réservation grand public, pas de secteur géographique ni
// de catégorie de prestation : juste une disponibilité directe dans l'agenda.

export type ProBookingType = "urgence" | "journee";

export const proEventTypes: Record<
  ProBookingType,
  { eventTypeId: number; lengthInMinutes: number; hourlyRate: number }
> = {
  urgence: { eventTypeId: 6468534, lengthInMinutes: 120, hourlyRate: 35 },
  journee: { eventTypeId: 6468535, lengthInMinutes: 510, hourlyRate: 28 },
};

// Pour retrouver le type de réservation pro à partir de l'ID d'event type
// Cal.com reçu dans le webhook de réservation.
export function findProBookingTypeByEventTypeId(
  eventTypeId: number | undefined
): ProBookingType | null {
  if (!eventTypeId) return null;
  const entry = (Object.entries(proEventTypes) as [ProBookingType, (typeof proEventTypes)[ProBookingType]][]).find(
    ([, v]) => v.eventTypeId === eventTypeId
  );
  return entry ? entry[0] : null;
}
