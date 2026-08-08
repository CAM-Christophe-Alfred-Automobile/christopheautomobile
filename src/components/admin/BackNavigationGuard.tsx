"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Contrôle le retour natif (bouton/geste physique du téléphone, distinct du bouton "← Retour"
 * de l'appli) : au lieu de dépendre de la pile d'historique réelle du navigateur — profonde et
 * imprévisible selon le chemin parcouru pour arriver sur une page, ce qui pouvait renvoyer sur
 * un état intermédiaire au lieu d'une vraie page utile — un retour ramène toujours directement
 * à l'accueil (/admin). Sur l'accueil lui-même, un retour ne fait rien : ça évite de quitter
 * l'appli par erreur.
 *
 * Technique : à chaque page, on empile un état "piège" sur l'historique. Quand le retour natif
 * dépile ce piège, l'événement popstate se déclenche ; on redirige alors vers /admin (ou, si on
 * y est déjà, on réempile immédiatement le piège pour absorber le prochain retour aussi).
 */
export default function BackNavigationGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/admin/login") return;

    history.pushState({ camBackGuard: true }, "", location.href);

    function handlePopState() {
      if (pathname === "/admin") {
        history.pushState({ camBackGuard: true }, "", location.href);
      } else {
        router.replace("/admin");
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname, router]);

  return null;
}
