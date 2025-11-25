/**
 * ============================================================================
 * 📝 COMPOSANT : InfoModal
 * ============================================================================
 * Modale d'informations importantes réutilisable
 *
 * 🎯 OBJECTIF :
 * - Afficher les conditions de travail de CAM Auto-Mobile
 * - Informer sur les tarifs (main-d'œuvre uniquement)
 * - Préciser les engagements et délais
 * - Composant réutilisable sur plusieurs pages
 *
 * 📍 UTILISÉ DANS :
 * - /src/app/tarifs/page.tsx (icône à côté du titre)
 * - /src/app/contact/page.tsx (bannière avant formulaire)
 * - /src/app/confirmation/page.tsx (après réservation)
 * - /src/components/home/PrestationsSection.tsx (section prestations)
 *
 * 🔧 PROPS :
 * - triggerText : Texte du bouton (si asIcon=false)
 * - asIcon : Afficher comme icône (true) ou bouton (false)
 * - triggerClassName : Classes CSS additionnelles
 *
 * 🎨 DESIGN :
 * - Style sobre et professionnel
 * - Fond gris foncé avec bordures subtiles
 * - Sections bien séparées et lisibles
 * - Icône ambre discrète mais visible
 *
 * ⚠️ IMPORTANT :
 * - Z-index élevé (9999) pour passer au-dessus de la map Leaflet
 * - Fermeture possible : clic backdrop, bouton X, bouton "J'ai compris"
 *
 * 💡 UTILISATION :
 * ```tsx
 * // Icône (par défaut)
 * <InfoModal />
 *
 * // Bouton texte
 * <InfoModal asIcon={false} triggerText="Voir les infos" />
 * ```
 * ============================================================================
 */

"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";

interface InfoModalProps {
  triggerText?: string;
  asIcon?: boolean;
  triggerClassName?: string;
}

export default function InfoModal({
  triggerText = "Informations importantes",
  asIcon = true,
  triggerClassName = "",
}: InfoModalProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Déclencheur */}
      {asIcon ? (
        <button
          onClick={() => setShowModal(true)}
          className={`cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 hover:brightness-110 shadow-md transition-all duration-300 animate-pulse hover:animate-none ${triggerClassName}`}
          aria-label="Informations importantes"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className={`px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-white font-semibold rounded-md shadow-md transition-all ${triggerClassName}`}
        >
          {triggerText}
        </button>
      )}

      {/* Modale */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 rounded-xl shadow-2xl border border-amber-500/30 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-500/30 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/40">
                    <svg
                      className="w-6 h-6 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Informations importantes
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer w-9 h-9 bg-gray-700/50 hover:bg-gray-600/50 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors border border-gray-600/50"
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
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-0 text-base">
              {/* Introduction */}
              <div className="pb-5 border-b border-amber-500/20">
                <p className="text-base text-gray-300 leading-relaxed font-normal text-left">
                  Je travaille{" "}
                  <strong className="text-amber-400 font-bold">seul</strong> sur
                  vos véhicules, sans équipe ni structure de concession. Chaque
                  intervention est réalisée avec{" "}
                  <strong className="text-amber-400 font-bold">
                    soin, rigueur et transparence
                  </strong>
                  .
                </p>
              </div>

              {/* Tarifs */}
              <div className="py-5 border-b border-amber-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-amber-500/40">
                    <svg
                      className="w-5 h-5 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-[18px] font-bold text-amber-400">
                    Tarifs = Main d&apos;œuvre uniquement
                  </h3>
                </div>
                <div   className="text-base text-gray-300 leading-relaxed font-normal text-left">
                  <span  className="text-gray-400 leading-relaxed">
                    Les{" "}
                    <strong className="text-white font-bold">
                      pièces nécessaires aux réparations
                    </strong>{" "}
                    doivent être disponibles le jour du rendez-vous afin
                    d&apos;assurer le bon déroulement de l&apos;intervention. Si
                    vous le souhaitez, je peux me charger de la commande des
                    pièces, après versement d&apos;un{" "}
                    <strong className="text-amber-400 font-semibold">
                      acompte de 40 %
                    </strong>{" "}
                    du montant total, à régler avant toute commande.
                  </span>
                </div>
              </div>

              {/* À savoir */}
              <div className="py-5 border-b border-amber-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-500/40">
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-[18px] font-bold text-white">À savoir</h3>
                </div>
                <ul className="space-y-2 text-base text-gray-300 font-normal text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5 flex-shrink-0">
                      •
                    </span>
                    <span className="text-base font-normal">
                      Les délais peuvent varier selon la complexité des travaux.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5 flex-shrink-0">
                      •
                    </span>
                    <span className="text-base font-normal">
                      Certains imprévus (pièce défectueuse, grippage, panne
                      cachée) peuvent nécessiter un délai supplémentaire.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5 flex-shrink-0">
                      •
                    </span>
                    <span className="text-base font-normal">
                      Les réparations sont faites{" "}
                      <strong className="text-white font-bold">
                        dans la mesure du possible
                      </strong>
                      , avec un suivi personnalisé.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Engagement */}
              <div className="py-5 border-b border-amber-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-green-500/40">
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-[18px] font-bold text-green-400">
                    Tarif fixe après acceptation du devis
                  </h3>
                </div>
                <p className="text-base text-gray-300 leading-relaxed font-normal text-left">
                  Aucune hausse ou baisse ne sera appliquée, sauf si un élément
                  nouveau est constaté et{" "}
                  <strong className="text-white font-bold">
                    validé ensemble
                  </strong>{" "}
                  avant toute intervention supplémentaire.
                </p>
              </div>

              {/* Engagement délais */}
              <div className="py-5 border-b border-amber-500/20">
                <p className="text-base text-gray-300 leading-relaxed font-normal text-left">
                  Je m&apos;engage à faire le{" "}
                  <strong className="text-amber-400 font-bold">
                    nécessaire dans les meilleurs délais
                  </strong>{" "}
                  et à toujours vous tenir informé de l&apos;avancement.
                </p>
              </div>

              {/* Signature */}
              <div className="pt-5 text-center">
                <p className="text-sm italic text-gray-400">
                  Merci pour votre confiance et votre compréhension.
                </p>
                <p className="text-base font-semibold text-amber-400 mt-2">
                  {siteConfig.name}
                </p>
              </div>
            </div>

            {/* Footer avec bouton */}
            <div className="border-t border-amber-500/30 bg-gray-900/50 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-base rounded-lg shadow-lg hover:shadow-amber-500/50 transition-all duration-200"
              >
                J&apos;ai compris
              </button>
            </div>
          </div>
          
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
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
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
