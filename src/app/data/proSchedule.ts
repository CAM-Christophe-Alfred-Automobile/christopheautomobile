// Types d'événements Cal.com dédiés aux professionnels (garages/entreprises).
// Contrairement à la réservation grand public, pas de secteur géographique ni
// de catégorie de prestation : juste une disponibilité directe dans l'agenda.

export type ProBookingType = "urgence" | "journee";

// "journee" représente désormais un engagement de 2 jours CONSÉCUTIFS minimum (et non plus
// une seule journée) : la réservation crée 2 réservations Cal.com successives sur le même
// event type (voir pro-book/route.ts), chacune correspondant à une journée de 510 min.
export const proEventTypes: Record<
  ProBookingType,
  { eventTypeId: number; lengthInMinutes: number; hourlyRate: number; consecutiveDays: number }
> = {
  urgence: { eventTypeId: 6468534, lengthInMinutes: 120, hourlyRate: 35, consecutiveDays: 1 },
  journee: { eventTypeId: 6468535, lengthInMinutes: 510, hourlyRate: 28, consecutiveDays: 2 },
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
