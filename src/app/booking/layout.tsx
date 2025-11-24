/**
 * Layout pour la section Booking (/booking)
 * 
 * Ce layout s'applique uniquement aux pages du dossier /booking.
 * Il configure le rendu dynamique pour garantir que le calendrier Cal.com
 * affiche toujours les créneaux disponibles en temps réel.
 * 
 * Configuration :
 * - force-dynamic : Force le rendu côté serveur à chaque requête (pas de cache statique)
 * - revalidate: 0 : Désactive complètement l'ISR (Incremental Static Regeneration)
 * 
 * Pourquoi c'est important ?
 * Sans ces paramètres, Next.js pourrait cacher la page et afficher des créneaux
 * qui ne sont plus disponibles. Avec force-dynamic, les données sont toujours fraîches.
 */

//! Force le rendu dynamique (pas de cache)
export const dynamic = 'force-dynamic';

//! Désactive la révalidation automatique
export const revalidate = 0;

/**
 * Composant Layout pour la réservation
 * Ne fait que retourner les enfants sans modification
 * (pas de wrapper spécifique, juste la config de rendu)
 */
export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
