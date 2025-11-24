/**
 * ============================================================================
 * 📄 COMPOSANT : PrestationsSection
 * ============================================================================
 * Section Prestations principales (Section 2 de la page d'accueil)
 * - 4 cartes de prestations avec code couleur :
 *   1. Petites Opérations (vert)
 *   2. Interventions Moyennes (jaune/orange)
 *   3. Gros Chantiers (rouge)
 *   4. Diagnostics & Services (bleu)
 * - Responsive : 1 colonne sur mobile, 2 colonnes sur desktop
 * ============================================================================
 */

"use client";

import Link from "next/link";
import { lato } from "@/fonts";
import { InfoModal } from "@/components";

export default function PrestationsSection() {
  return (
    <section
      aria-labelledby="prestations-title"
      className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 py-12 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* En-tête de section */}
        <div className="text-center mb-6">
          <h2
            id="prestations-title"
            className="sm:text-4xl text-2xl font-bold text-white mb-2"
          >
            Mes prestations principales
          </h2>
          <div className="w-20 h-1 bg-amber-600 mx-auto mb-4"></div>
          <p
            className={`${lato.className} text-lg text-gray-300 max-w-full mx-auto leading-relaxed`}
          >
            Retrouvez ici un aperçu des principales interventions proposées,
            classées par type et durée, de l&#39;entretien courant aux
            réparations plus complexes.
          </p>
        </div>

        {/* Grille de prestations - Code couleur progressif */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-6">
          {/* Carte 1 : Petites opérations - VERT */}
          <div
            className="group relative bg-gray-900/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border-2 border-green-700/50 
md:hover:border-green-500 transition-all duration-300 
md:hover:shadow-2xl md:hover:shadow-green-500/20"
          >
            {" "}
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Badge durée */}
              <div className="absolute top-4 right-4 bg-green-600/20 border border-green-600/50 px-3 py-1 rounded-full">
                <span className="text-green-400 text-xs font-semibold">
                  1h à 2h30
                </span>
              </div>

              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center md:group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 md:group-hover:text-green-400 transition-colors">
                  Petites opérations
                </h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-2 ">
                  Entretien courant et révisions rapides pour garantir la
                  fiabilité de votre véhicule au quotidien :
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Vidange moteur + filtres
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Disques + Plaquettes de frein
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Bougies d&#39;allumage, préchauffage
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Carte 2 : Interventions moyennes - JAUNE/ORANGE */}
          <div className="group relative bg-gray-900/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border-2 border-yellow-600/50 md:hover:border-yellow-500 transition-all duration-300 md:hover:shadow-2xl md:hover:shadow-yellow-500/20">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Badge durée */}
              <div className="absolute top-4 right-4 bg-yellow-600/20 border border-yellow-600/50 px-3 py-1 rounded-full">
                <span className="text-yellow-400 text-xs font-semibold">
                  2h30 à 3h30
                </span>
              </div>

              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center md:group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 md:group-hover:text-yellow-400 transition-colors">
                  Interventions moyennes
                </h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-2">
                  Réparations intermédiaires demandant un temps
                  d&#39;intervention plus long. Exemples :
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    Alternateur / démarreur
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    Courroie accessoires
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    Roulement de roue AV / AR
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Carte 3 : Gros chantiers - ROUGE */}
          <div className="group relative bg-gray-900/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border-2 border-red-700/50 md:hover:border-red-500 transition-all duration-300 md:hover:shadow-2xl md:hover:shadow-red-500/20">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Badge durée */}
              <div className="absolute top-4 right-4 bg-red-600/20 border border-red-600/50 px-3 py-1 rounded-full">
                <span className="text-red-400 text-xs font-semibold">
                  3h30 à plusieurs jours
                </span>
              </div>

              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center md:group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 md:group-hover:text-red-400 transition-colors">
                  Gros chantiers
                </h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-2">
                  Travaux mécaniques complets nécessitant un démontage partiel
                  ou total du moteur. Notamment :
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    Distribution + pompe à eau
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    Embrayage
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    Remplacement moteur complet
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Carte 4 : Diagnostics & Services - BLEU */}
          <div className="group relative bg-gray-900/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border-2 border-blue-700/50 md:hover:border-blue-500 transition-all duration-300 md:hover:shadow-2xl md:hover:shadow-blue-500/20">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center md:group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 md:group-hover:text-blue-400 transition-colors">
                  Diagnostics & Services
                </h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-2">
                  Contrôles complets et diagnostics électroniques pour
                  identifier rapidement toute anomalie et assurer le bon
                  fonctionnement de votre véhicule :
                </p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Diagnostic valise complet
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Contrôle freinage / climatisation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Vérification batterie
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call-to-action */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-gray-400 md:text-lg text-sm ">
              Conditions et informations sur les interventions
            </p>
            <div className="flex-shrink-0">
            <InfoModal />
            </div>
          </div>
          
          {/* Bouton CTA vers la page Tarifs */}
          <Link
            href="/tarifs"
            className="inline-flex items-center justify-center bg-amber-700 text-white font-bold sm:text-lg text-base px-10 py-4 rounded-xl md:hover:bg-amber-600 transition-all duration-300 shadow-lg md:hover:shadow-amber-600/50 md:hover:scale-105"
            aria-label="Voir le catalogue complet des prestations"
          >
            Voir le catalogue & les tarifs
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
