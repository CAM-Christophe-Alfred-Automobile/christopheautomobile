// Créneaux de réservation pour les particuliers : Matin / Après-midi / Journée en semaine,
// et 3 créneaux dédiés le lundi (jour réservé à l'entretien rapide, cf. MONDAY_ELIGIBLE_SERVICES).
// Remplace l'ancien système de mapping durée -> event type (zoneSchedule.ts).

// Event types créés sur Cal.com (compte christophe-am), chacun avec son propre schedule
// dédié (jours + horaires) et les mêmes bookingFields/location que les event types existants
// (address, modele, immatriculation, description, devis, piece, notes — cf. cal-book/route.ts).
export type ParticulierSlotKey = "matin" | "apres-midi" | "journee" | "lundi-1" | "lundi-2" | "lundi-3";

export interface ParticulierSlotDef {
  key: ParticulierSlotKey;
  label: string;
  startTime: string; // HH:mm, heure de Paris
  endTime: string; // HH:mm
  durationMinutes: number;
  eventTypeId: number;
  isMonday: boolean;
}

export const PARTICULIER_SLOTS: ParticulierSlotDef[] = [
  { key: "matin", label: "Matin", startTime: "09:00", endTime: "12:00", durationMinutes: 180, eventTypeId: 6550877, isMonday: false },
  { key: "apres-midi", label: "Après-midi", startTime: "12:30", endTime: "17:30", durationMinutes: 300, eventTypeId: 6550909, isMonday: false },
  { key: "journee", label: "Journée", startTime: "09:00", endTime: "17:30", durationMinutes: 510, eventTypeId: 6550910, isMonday: false },
  { key: "lundi-1", label: "9h30 – 11h30", startTime: "09:30", endTime: "11:30", durationMinutes: 120, eventTypeId: 6550911, isMonday: true },
  { key: "lundi-2", label: "12h00 – 14h00", startTime: "12:00", endTime: "14:00", durationMinutes: 120, eventTypeId: 6550912, isMonday: true },
  { key: "lundi-3", label: "14h30 – 17h30", startTime: "14:30", endTime: "17:30", durationMinutes: 180, eventTypeId: 6550913, isMonday: true },
];

export function getSlotDef(key: string): ParticulierSlotDef | undefined {
  return PARTICULIER_SLOTS.find((s) => s.key === key);
}

export const MONDAY_SLOT_KEYS: ParticulierSlotKey[] = ["lundi-1", "lundi-2", "lundi-3"];
export const WEEKDAY_SLOT_KEYS: ParticulierSlotKey[] = ["matin", "apres-midi", "journee"];

// Interventions autorisées le lundi (jour dédié à l'entretien rapide). Toute intervention
// hors de cette liste exclut le lundi des dates proposées pour la réservation en cours.
export const MONDAY_ELIGIBLE_SERVICES: string[] = [
  "Inspection / contrôle panne",
  "Vidange moteur seule",
  "Vidange + filtre à huile",
  "Vidange liquide de frein",
  "Vidange liquide refroidissement",
  "Vidange boîte manuelle",
  "Vidange boîte auto",
  "Vidange direction assistée",
  "Vidange pont AV/AR unité",
  "Plaquettes (essieu)",
];

// Vrai si TOUTES les interventions sélectionnées sont éligibles au lundi (sinon le lundi
// doit être exclu des dates proposées, quelle que soit la zone).
export function isMondayEligible(selectedServiceNames: string[]): boolean {
  if (selectedServiceNames.length === 0) return false;
  return selectedServiceNames.every((s) => MONDAY_ELIGIBLE_SERVICES.includes(s));
}
