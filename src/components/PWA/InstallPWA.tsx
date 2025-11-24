// ===========================================================================
// Composant : InstallPWA
// ===========================================================================
// 🎯 OBJECTIF
// Gestion de l’installation PWA sur **Android** et navigateurs mobiles compatibles.
//
// ⚠️ Spécificité plateforme
// - 📱 Android : supporte `beforeinstallprompt` → ce composant capture l’événement
// - 🍎 iOS / Safari : **NE supporte PAS** `beforeinstallprompt` → ne pas utiliser ici
//   → iOS utilise le composant séparé : `IOSInstallPrompt.tsx`
//
// 🧩 Ce que fait ce composant
// ✔ Capture `beforeinstallprompt` déclenché par Chrome/Android
// ✔ Affiche un bouton personnalisé "Installer l'application"
// ✔ Déclenche l’installation manuellement via `deferredPrompt.prompt()`
// ✔ Cache le bouton si l’app est déjà installée (`appinstalled`)
//
// 🚫 Ce que ce composant ne fait PAS
// ✖ Pas d'affichage sur iPhone/iPad (exclusion iOS dans la détection mobile)
// ✖ Pas d'aide visuelle pour iOS (géré dans `IOSInstallPrompt.tsx`)
//
// 📌 Où l’utiliser ?
// → Dans le layout global (affiché sur toutes les pages)
// → Ou sur les pages d’accueil / réservation uniquement (expérience plus douce)
//
// Créé pour : Lamis VTC 🚗⚡
// ===========================================================================


"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détection mobile (ANDROID uniquement, pas iOS)
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      // Exclure iOS car il a sa propre bannière (IOSInstallPrompt)
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isMobileOther = /mobile/.test(userAgent) && !isIOS;
      
      return (isAndroid || isMobileOther) && !isIOS;
    };
    setIsMobile(checkMobile());
  }, []);

  useEffect(() => {
    // ---------------------------------------------------------------------------
    // 📱 Enregistrement du Service Worker
    // ---------------------------------------------------------------------------
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("✅ Service Worker enregistré:", registration.scope);
          })
          .catch((error) => {
            console.error("❌ Erreur Service Worker:", error);
          });
      });
    }

    // ---------------------------------------------------------------------------
    // 🎁 Capture de l'événement beforeinstallprompt
    // ---------------------------------------------------------------------------
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêche l'affichage automatique de l'invite
      e.preventDefault();
      console.log("🎁 beforeinstallprompt capturé");
      
      // ⚠️ Vérification mobile AVANT d'afficher le bouton
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isMobileOther = /mobile/.test(userAgent) && !isIOS;
      const isMobileDevice = (isAndroid || isMobileOther) && !isIOS;
      
      // N'affiche le bouton QUE sur mobile (pas sur PC)
      if (!isMobileDevice) {
        console.log("🖥️ Desktop détecté - bouton PWA masqué");
        return;
      }
      
      // ⏰ Vérifier si l'utilisateur a cliqué sur "Plus tard" récemment
      const dismissedTime = localStorage.getItem("pwa-install-dismissed");
      if (dismissedTime) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) {
          console.log(`⏳ PWA dismissed - encore ${Math.ceil(7 - daysSinceDismissed)} jours avant de réafficher`);
          return;
        }
      }
      
      // Stocke l'événement pour l'utiliser plus tard
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Affiche notre bouton personnalisé
      setShowInstallButton(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    // ---------------------------------------------------------------------------
    // ✅ Détection si l'app est déjà installée
    // ---------------------------------------------------------------------------
    window.addEventListener("appinstalled", () => {
      console.log("✅ PWA installée avec succès !");
      setShowInstallButton(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 🚀 Fonction pour déclencher l'installation manuellement
  // ---------------------------------------------------------------------------
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("❌ Pas d'événement beforeinstallprompt disponible");
      return;
    }

    // Affiche l'invite d'installation native
    deferredPrompt.prompt();

    // Attends la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`🎯 Choix utilisateur: ${outcome}`);

    // Réinitialise l'événement
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  // ---------------------------------------------------------------------------
  // 🎨 Affichage du bouton si l'événement est disponible ET sur mobile
  // ---------------------------------------------------------------------------
  if (!showInstallButton || !isMobile) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-4 z-40 animate-slideUp">
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-neutral-950 p-4 rounded-xl shadow-2xl border border-yellow-500/30 max-w-sm">
        {/* Bouton fermeture */}
        <button
          onClick={() => setShowInstallButton(false)}
          className="absolute -top-2 -right-2 bg-neutral-800 text-white rounded-full p-1.5 hover:bg-neutral-700 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Contenu */}
        <div className="flex items-start gap-3">
          <Download className="w-6 h-6 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              Installer CAM
            </h3>
            <p className="text-sm text-neutral-900 mb-3">
              Accédez rapidement à l&apos;app depuis votre écran d&apos;accueil.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-neutral-950 text-yellow-500 px-4 py-2 rounded-lg font-semibold hover:bg-neutral-900 transition-colors text-sm"
              >
                Installer
              </button>
              <button
                onClick={() => {
                  // Stocker la date de rejet dans localStorage (7 jours)
                  localStorage.setItem("pwa-install-dismissed", Date.now().toString());
                  console.log("⏰ PWA dismissed - ne réapparaîtra pas pendant 7 jours");
                  setShowInstallButton(false);
                }}
                className="px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors text-sm"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
