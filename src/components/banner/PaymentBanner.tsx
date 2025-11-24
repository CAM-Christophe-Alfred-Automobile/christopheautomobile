// ===========================================================================
// 🚨 COMPOSANT : PaymentBanner
// ===========================================================================
//
// ⚠️ FICHIER À SUPPRIMER APRÈS PAIEMENT DU CLIENT ⚠️
//
// 🎯 OBJECTIF :
// Afficher une bannière discrète en haut du site pour indiquer que le site
// est en phase de test avant validation du paiement.
//
// ===========================================================================
// 🔄 MARCHE À SUIVRE APRÈS PAIEMENT :
// ===========================================================================
//
// 1️⃣ ALLER dans le fichier .env
//    Changer : NEXT_PUBLIC_SHOW_PAYMENT_BANNER=true
//    En :      NEXT_PUBLIC_SHOW_PAYMENT_BANNER=false
//
// 2️⃣ ALLER dans src/app/layout.tsx
//    SUPPRIMER la ligne : import { PaymentBanner } from "@/components";
//    SUPPRIMER la ligne : <PaymentBanner />
//
// 3️⃣ SUPPRIMER ce fichier (PaymentBanner.tsx)
//
// 4️⃣ ALLER dans src/components/index.ts
//    SUPPRIMER la ligne : export { default as PaymentBanner } from "./PaymentBanner";
//
// 5️⃣ REDÉPLOYER le site sur Vercel
//
// 6️⃣ MODIFIER le fichier public/robots.txt (voir instructions dans ce fichier)
//
// ===========================================================================

"use client";

export default function PaymentBanner() {
  // ---------------------------------------------------------------------------
  // 📌 Vérification de la variable d'environnement
  // ---------------------------------------------------------------------------
  // Si NEXT_PUBLIC_SHOW_PAYMENT_BANNER n'est pas "true", ne rien afficher
  const showBanner = process.env.NEXT_PUBLIC_SHOW_PAYMENT_BANNER === "true";

  if (!showBanner) return null;

  // ---------------------------------------------------------------------------
  // 🎨 Affichage de la bannière
  // ---------------------------------------------------------------------------
  return (
  <div className="bg-orange-600 text-white py-2 px-4 text-center text-sm font-medium sticky top-0 z-50 shadow-md">
      🚧 Site en cours de finalisation - version de démonstration
    </div>
  );
}
