// ===========================================================================
// 📱 Composant : IOSInstallPrompt
// ===========================================================================
// 🎯 OBJECTIF
// Afficher une bannière d'installation uniquement sur iPhone/iPad sous Safari,
// afin de guider l’utilisateur pour ajouter la PWA à son écran d’accueil.
//
// ⚠️ Pourquoi ce composant existe ?
// Apple bloque l’événement `beforeinstallprompt` utilisé par Android/Chrome.
// → Aucune bannière native ne s’affiche sur iOS.
// → L’utilisateur ne sait pas comment installer la PWA.
// Ce composant recrée donc une bannière d'installation spécialement pour iOS.
//
// 🧩 Fonctionnement
// 1️⃣ Détection iOS (compatibilité iOS 17+ qui masque l'User-Agent)
// 2️⃣ Vérification si l'app est déjà installée (display-mode: standalone)
// 3️⃣ Vérification si l'utilisateur a déjà refusé (LocalStorage, durée 7 jours)
// 4️⃣ Détection du navigateur (Safari vs Chrome/Firefox/Edge)
// 5️⃣ Affichage de la bannière au bout de 5s si toutes les conditions sont réunies
//
// 🕵️‍♂️ Conditions d'affichage :
// - iPhone ou iPad (tous navigateurs)
// - L'app n'est PAS déjà en mode PWA installée
// - L'utilisateur n'a pas récemment refusé l'installation
// - Si Chrome/Firefox : message spécial pour guider vers Safari
//
// 💾 Mémoire du refus :
// Si l’utilisateur ferme la bannière → stockage local `ios-install-declined`
// La bannière ne réapparaît qu’après 7 jours.
//
// 🔁 Android & Chrome :
// Chrome gère déjà `beforeinstallprompt` → aucune action ici.
// Ce composant ne doit s’afficher que sur iOS.
//
// Créé pour : Lamis VTC
// ===========================================================================


"use client";

import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";

export default function IOSInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isChrome, setIsChrome] = useState(false);

  useEffect(() => {
  // ---------------------------------------------------------------------------
    // 🍎 ÉTAPE 1 : Détection iOS (y compris iOS 17+ qui masque l'User-Agent)
    // ---------------------------------------------------------------------------
    const isIOSDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Méthode 1 : Détection classique via User-Agent (iOS < 17)
      // Fonctionne sur iOS 16 et versions antérieures
      if (/iphone|ipad|ipod/.test(userAgent)) {
        return true;
      }
      
      // 🚫 Exclure explicitement les PC (Windows, Mac, Linux)
      if (userAgent.includes('windows') || userAgent.includes('linux') || userAgent.includes('x11')) {
        return false;
      }
      
      // Méthode 2 : Détection avancée pour iOS 17+ (User-Agent masqué par Apple)
      // iOS 17+ renvoie un User-Agent générique, on doit donc détecter via d'autres moyens
      // Note : Sur iOS, Chrome/Firefox/Edge utilisent tous WebKit (moteur Safari imposé par Apple)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isNotAndroid = !userAgent.includes('android');
      const isMacOS = userAgent.includes('mac os x');
      
      // iOS 17+ se présente comme "Mac OS X" avec support tactile
      // Mais un vrai Mac n'a pas de support tactile (sauf iPad en mode desktop)
      const isLikelyIOS = isTouchDevice && isNotAndroid && isMacOS;
      
      return isLikelyIOS;
    };

    // ---------------------------------------------------------------------------
    // 📱 ÉTAPE 2 : Vérifier si l'app est déjà installée (mode standalone)
    // ---------------------------------------------------------------------------
    // Si l'utilisateur ouvre déjà l'app depuis l'écran d'accueil (PWA installée),
    // ne pas afficher la bannière d'installation
    const isInStandaloneMode = 
      // Détection standard (Chrome, Edge, Safari moderne)
      window.matchMedia("(display-mode: standalone)").matches ||
      // Détection spécifique iOS (propriété non-standard mais fiable)
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    // ---------------------------------------------------------------------------
    // 🚫 ÉTAPE 3 : Vérifier si l'utilisateur a déjà refusé (localStorage)
    // ---------------------------------------------------------------------------
    // Si l'utilisateur a cliqué sur "Fermer", on mémorise sa décision pendant 7 jours
    const declinedDate = localStorage.getItem("ios-install-declined");
    
    // Vérifier si le délai de 7 jours est expiré (on peut réafficher)
    const hasExpired = declinedDate ? new Date(declinedDate) < new Date() : true;

    // ---------------------------------------------------------------------------
    // 🌐 ÉTAPE 4 : Détecter si l'utilisateur est sur Chrome/Firefox (pas Safari)
    // ---------------------------------------------------------------------------
    const userAgent = navigator.userAgent.toLowerCase();
    const isChromeOrOtherBrowser = userAgent.includes('crios') || userAgent.includes('fxios') || userAgent.includes('edgios');
    setIsChrome(isChromeOrOtherBrowser);

    // ---------------------------------------------------------------------------
    // ✅ ÉTAPE 5 : Décider d'afficher ou non la bannière
    // ---------------------------------------------------------------------------
    // Conditions pour afficher :
    // 1. C'est un appareil iOS (iPhone, iPad, ou iOS 17+)
    // 2. L'app n'est PAS déjà installée (pas en mode standalone)
    // 3. Pour Safari : toujours afficher (même si fermé sur Chrome)
    //    Pour Chrome/autres : vérifier si l'utilisateur n'a pas refusé
    const shouldShow = isChromeOrOtherBrowser ? hasExpired : true;
    
    if (isIOSDevice() && !isInStandaloneMode && shouldShow) {
      // Attendre 5 secondes avant d'afficher la bannière (moins intrusif)
      // Laisse le temps à l'utilisateur de voir le site avant d'être interrompu
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // 🔴 Fonction appelée quand l'utilisateur ferme la bannière
  // ---------------------------------------------------------------------------
  const handleClose = () => {
    // Masquer immédiatement la bannière
    setShowPrompt(false);
    
    // ---------------------------------------------------------------------------
    // 💾 Mémoriser le refus dans localStorage pendant 7 jours
    // ---------------------------------------------------------------------------
    // On calcule la date d'expiration : aujourd'hui + 7 jours
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    // Sauvegarder la date d'expiration en ISO (format universel)
    // Ex: "2025-11-24T14:05:00.000Z"
    localStorage.setItem("ios-install-declined", expiryDate.toISOString());
    
    // Après 7 jours, la bannière pourra réapparaître car hasExpired sera true
  };

  // ---------------------------------------------------------------------------
  // 🚫 Ne rien afficher si showPrompt est false
  // ---------------------------------------------------------------------------
  if (!showPrompt) return null;

  // ---------------------------------------------------------------------------
  // 🎨 RENDU : Bannière d'installation iOS
  // ---------------------------------------------------------------------------
  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 animate-slideUp">
      {/* Container principal jaune (couleur Lamis VTC) */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-neutral-950 p-4 rounded-xl shadow-2xl border border-yellow-500/30">
        
        {/* ❌ Bouton de fermeture (coin supérieur droit) */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-neutral-800 text-white rounded-full p-1.5 hover:bg-neutral-700 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 📄 Contenu principal : Icône + Texte */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 bg-neutral-950 text-yellow-500 rounded-full p-2">
            <Share className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-base mb-1">
              Installer l&lsquo;application CAM
            </h3>

            {/* 📝 Description du bénéfice pour l'utilisateur */}
            <p className="text-sm text-neutral-900 mb-3 leading-relaxed">
              Pour réserver en quelques secondes, directement depuis votre iPhone.
            </p>

            {/* ⚠️ Message différent selon le navigateur */}
            {isChrome ? (
              // Chrome/Firefox : juste dire d'ouvrir dans Safari
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3 mb-3">
                <p className="text-sm text-neutral-950 font-semibold">
                  ⚠️ Vous utilisez Chrome/Firefox. Pour installer l&apos;app, ouvrez ce site dans <strong>Safari</strong>.
                </p>
              </div>
            ) : (
              // Safari : afficher les étapes d'installation
              <div className="bg-neutral-950/20 rounded-lg p-3 mb-3 space-y-2">
                {/* Étape 1 : Appuyer sur le bouton Partager */}
                <div className="flex items-center gap-2 text-sm text-neutral-900">
                  <span className="font-bold">1.</span>
                  <span>
                    Appuyez sur le bouton{" "}
                    <Share className="w-4 h-4 inline mx-0.5" /> partager
                  </span>
                </div>
                
                {/* Étape 2 : Sélectionner "Ajouter à l'écran d'accueil" */}
                <div className="flex items-center gap-2 text-sm text-neutral-900">
                  <span className="font-bold">2.</span>
                  <span>
                    Choisissez <strong>Ajouter à l&rsquo;écran d&rsquo;accueil</strong>
                  </span>
                </div>
              </div>
            )}

            {/* ✅ Bouton de confirmation (ferme la bannière) */}
            <button
              onClick={handleClose}
              className="w-full bg-neutral-950 text-yellow-500 px-4 py-2 rounded-lg font-semibold hover:bg-neutral-900 transition-colors text-sm"
            >
              J&apos;ai compris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
