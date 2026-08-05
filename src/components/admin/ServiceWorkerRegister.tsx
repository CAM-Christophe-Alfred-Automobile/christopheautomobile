"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// En PWA installée sur téléphone, l'app reste souvent chargée en mémoire (avec le code JS déjà
// en place) au lieu d'être vraiment rechargée quand on la rouvre — même après un déploiement.
// Ça a déjà causé un bug corrigé côté serveur mais silencieusement absent côté client, sur du
// code resté en cache en RAM : un tap sur "Démarrer" changeait le statut d'une intervention sans
// la protection appui-long pourtant déployée. Force un rechargement complet si l'app est restée
// en arrière-plan plus de STALE_AFTER_MS, pour retomber sur la dernière version déployée.
const STALE_AFTER_MS = 2 * 60 * 1000;

export default function ServiceWorkerRegister() {
  const pathname = usePathname();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin/" }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    // Sauf sur l'intervention en direct : le formulaire de finalisation peut contenir des
    // données pas encore enregistrées, un rechargement forcé les perdrait.
    if (pathname.startsWith("/admin/interventions/")) return;

    let hiddenAt: number | null = null;
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
      } else if (document.visibilityState === "visible" && hiddenAt != null) {
        const hiddenDuration = Date.now() - hiddenAt;
        hiddenAt = null;
        if (hiddenDuration > STALE_AFTER_MS) window.location.reload();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pathname]);

  return null;
}
