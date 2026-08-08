// Types d'événements Cal.com dédiés aux professionnels (garages/entreprises).
// Contrairement à la réservation grand public, pas de secteur géographique ni
// de catégorie de prestation : juste une disponibilité directe dans l'agenda.

export type ProBookingType = "journee";

// "journee" représente un engagement de 2 jours CONSÉCUTIFS minimum : la réservation crée
// 2 réservations Cal.com successives sur le même event type (voir pro-book/route.ts), chacune
// correspondant à une journée de 510 min. La formule "urgence" a été retirée (plus proposée).
export const proEventTypes: Record<
  ProBookingType,
  { eventTypeId: number; lengthInMinutes: number; hourlyRate: number; consecutiveDays: number }
> = {
  journee: { eventTypeId: 6468535, lengthInMinutes: 510, hourlyRate: 30, consecutiveDays: 2 },
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
