/**
 * Layout pour la section Contact (/contact)
 * 
 * Ce layout s'applique uniquement aux pages du dossier /contact.
 * Il configure le rendu dynamique pour garantir que le formulaire de contact
 * et la carte Leaflet sont toujours à jour.
 * 
 * Configuration :
 * - force-dynamic : Force le rendu côté serveur à chaque requête
 * - revalidate: 0 : Pas de cache, toujours frais
 * 
 * Cas d'usage :
 * Si vous modifiez la zone d'intervention ou les coordonnées de la carte,
 * les changements seront visibles immédiatement sans avoir à purger le cache.
 */

//! Force le rendu dynamique (pas de cache)
export const dynamic = "force-dynamic";

//! Désactive la révalidation automatique
export const revalidate = 0;

/**
 * Composant Layout pour la page contact
 * Retourne simplement les enfants sans wrapper supplémentaire
 */
export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
