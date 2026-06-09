// -----------------------------------------------------------------------------
// FICHIER : src/components/modals/AutodocModal.tsx
// -----------------------------------------------------------------------------
//! 🎯 OBJECTIF :
// Afficher une modale indépendante "Où acheter vos pièces"
// permettant d’expliquer au client où commander ses pièces
// (via ton lien de parrainage Autodoc).
//
//! 💡 LOGIQUE :
// - Le bouton qui ouvre cette modale est placé sur la page tarifs.
// - Le lien Autodoc est cliquable, s’ouvre dans un nouvel onglet.
// - Le texte reste professionnel, sobre et cohérent avec ton ton visuel.
//
//! 🎨 DESIGN :
// - Fond sombre semi-transparent avec effet blur.
// - Carte centrale avec fond dégradé gris foncé et bordure ambre.
// - Animation d’apparition en slide-up.
// - Bouton de fermeture arrondi cohérent avec ta charte.
//
//! 📌 ASTUCE :
// Tu peux importer et afficher le logo Autodoc juste au-dessus du titre :
//   <img src="/autodoc-logo.png" alt="Autodoc" className="h-8 mb-2 mx-auto" />
//
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// FICHIER : src/components/modals/AutodocModal.tsx
// -----------------------------------------------------------------------------
//! 🎯 OBJECTIF :
// Modale "Où acheter vos pièces" + bloc CODE PARRAINAGE (avantage client uniquement).
//
//! ⚙️ ENV :
// - NEXT_PUBLIC_AUTODOC_REF_CODE=AC30897615   // Code affiché et copiable
//
// -----------------------------------------------------------------------------

"use client";

import { useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";

export default function AutodocModal() {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { referralCode } = siteConfig.autodoc;

  const handleCopy = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* 🔘 Bouton d'ouverture */}
      {/* ------------------------------------------------------------------ */}
      <div className="text-center">
        <button
          onClick={() => setShowModal(true)}
          className="text-sm text-amber-400 hover:text-amber-300 underline underline-offset-4 transition-colors cursor-pointer"
        >
          💡 Où acheter vos pièces auto ?
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 🧩 Modale principale */}
      {/* ------------------------------------------------------------------ */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 text-gray-100 rounded-2xl shadow-2xl border border-amber-500/30 w-full max-w-md p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold text-amber-400 tracking-wide">
                Où acheter vos pièces auto
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer w-9 h-9 bg-gray-700/40 hover:bg-gray-600/40 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors border border-gray-600/40"
                aria-label="Fermer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Illustration */}
            <div className="flex justify-center mb-5">
              <Image
                src="/images/pieces.webp"
                alt="Illustration pièces auto"
                width={180}
                height={180}
                quality={85}
                priority
                className="rounded-full object-cover shadow-lg ring-2 ring-amber-500/20"
                style={{ width: "auto", height: "auto" }}
              />
            </div>

            {/* Texte principal */}
            <div className="space-y-5 text-center">
              <p className="text-sm text-gray-300 leading-relaxed">
                Commandez vos pièces sur{" "}
                <a
                  href="https://www.auto-doc.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
                >
                  Autodoc.fr
                </a>
                , une plateforme fiable et reconnue pour son large choix de
                références à prix avantageux.
              </p>

              {/* Code Parrainage */}
              {referralCode && (
                <div className="bg-gray-800/60 border border-amber-500/40 rounded-xl p-5 shadow-inner">
                  <h4 className="text-lg font-semibold text-amber-400 mb-1">
                    🎁 -10€ sur votre 1ʳᵉ commande 
                  </h4>
                  <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                    Utilisez ce code sur{" "}
                   {" "}
                    pour bénéficier de{" "}
                    <strong className="text-amber-400">
                      10€ de réduction dès 50€ d’achat
                    </strong>{" "}
                    <span className="opacity-70">(hors pneus)</span>.
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    <code className="bg-gray-700 px-3 py-2 rounded-md text-amber-400 font-mono text-sm">
                      {referralCode}
                    </code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy();
                      }}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                    >
                      {copied ? "Copié ✓" : "Copier"}
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 italic">
                ⚙️ En cas de doute sur le choix des pièces, contactez-moi avant
                de commander.
              </p>

              <div className="border-t border-amber-500/20 pt-3 text-sm text-gray-300">
                Si je m’occupe de la commande, un acompte de{" "}
                <strong className="text-amber-400">40%</strong> du montant des
                pièces sera demandé <strong>avant l’achat</strong>.
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
