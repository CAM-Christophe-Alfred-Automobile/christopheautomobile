/**
 * Layout pour la section Confirmation (/confirmation)
 * 
 * Ce layout s'applique uniquement aux pages du dossier /confirmation.
 * Il configure le rendu dynamique pour garantir que la page de confirmation
 * affiche toujours les dernières informations après un paiement Cal.com.
 * 
 * Configuration :
 * - force-dynamic : Force le rendu côté serveur à chaque requête
 * - revalidate: 0 : Pas de cache
 * 
 * Contexte d'utilisation :
 * Après avoir payé sur Cal.com, le client est redirigé vers /confirmation.
 * On veut s'assurer qu'il voit bien le message de confirmation à jour,
 * avec ses informations de réservation actuelles.
 */

//! Force le rendu dynamique (pas de cache)
export const dynamic = 'force-dynamic';

//! Désactive la révalidation automatique
export const revalidate = 0;

/**
 * Composant Layout pour la page de confirmation
 * Retourne simplement les enfants sans modification
 */
export default function ConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
