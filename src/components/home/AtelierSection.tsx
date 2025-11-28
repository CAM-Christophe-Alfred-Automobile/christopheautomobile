/**
 * ============================================================================
 * 📄 COMPOSANT : AtelierSection
 * ============================================================================
 * Section Atelier Mobile (Section 3 de la page d'accueil)
 * - Image du camion atelier
 * - 4 cartes d'engagements (Équipement pro, Devis clair, etc.)
 * - Zone d'intervention
 * - CTA Prendre rendez-vous
 * ============================================================================
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { lato } from "@/fonts";

export default function AtelierSection() {
  return (
    <section
      aria-labelledby="atelier-title"
      className="relative bg-gray-900 py-16 px-4 border-t border-gray-700/50"
    >
      <div className="max-w-7xl mx-auto">
        {/* En-tête compact */}
        <div className="text-center mb-12">
          <h2
            id="atelier-title"
            className="sm:text-4xl text-2xl font-bold text-white mb-2"
          >
            Mécanique à domicile, exigence garantie
          </h2>
          <div className="w-20 h-1 bg-amber-600 mx-auto mb-4"></div>
          <p
            className={`${lato.className} sm:text-lg text-base text-gray-300 max-w-full mx-auto leading-relaxed`}
          >
            Je me déplace avec tout l&apos;équipement d&apos;un garage, pour
            que votre véhicule soit entre de bonnes mains, où que vous soyez.
          </p>
        </div>

        {/* Layout principal en grille */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Colonne 1 : Image du camion (réduite) */}
          <div className="lg:col-span-1 flex justify-center">
            <div className="relative group w-full max-w-[250px] sm:max-w-xs">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative">
                <Image
                  src="/images/camion2.webp"
                  alt="Camion atelier mobile équipé"
                  width={350}
                  height={220}
                  className="rounded-xl shadow-xl w-full h-auto object-cover"
                  priority
                  sizes="(max-width: 768px) 250px, 350px"

                />
              </div>
            </div>
          </div>

          {/* Colonne 2 : 4 Cartes d'engagements en grille 2x2 */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {/* Carte 1 : Équipement pro */}
            <div className="group bg-gray-800/60 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1 sm:mb-1.5 group-hover:text-blue-400 transition-colors">
                Équipement pro
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Outillage complet, valise de diagnostic
              </p>
            </div>

            {/* Carte 2 : Devis clair */}
            <div className="group bg-gray-800/60 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-gray-700 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-emerald-500/30">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-1 sm:mb-1.5 group-hover:text-emerald-400 transition-colors">
                Devis clair
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Prix fixe, aucune surprise ni frais caché
              </p>
            </div>

            {/* Carte 3 : Zéro déplacement */}
            <div className="group bg-gray-800/60 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-gray-700 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-cyan-500/30">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
              <h3 className="text-sm sm:text-base font-bold text-white mb-1 sm:mb-1.5 group-hover:text-cyan-400 transition-colors">
                Zéro déplacement
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Je viens chez vous, vous gagnez du temps
              </p>
            </div>

            {/* Carte 4 : Expérience 10+ ans */}
            <div className="group bg-gray-800/60 backdrop-blur-sm p-3 sm:p-5 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-purple-500/30">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
              <h3 className="text-sm sm:text-base font-bold text-white mb-1 sm:mb-1.5 group-hover:text-purple-400 transition-colors">
                Expérience 10+ ans
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Soin et professionnalisme garantis
              </p>
            </div>
          </div>
        </div>

        {/* Zone d'intervention + CTA Rendez-vous */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          {/* 🗺️ Zone d'intervention */}
          <div className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-teal-600 transition-all duration-300 flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-600/30">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-3">
              Zone d&apos;intervention
            </h3>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
              Je me déplace dans un rayon de{" "}
              <span className="text-amber-500 font-semibold">
                {siteConfig.rayonIntervention} km
              </span>{" "}
              autour de{" "}
              <span className="text-amber-500 font-semibold">
                {siteConfig.city}
              </span>
              , pour toutes interventions à domicile.
            </p>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-teal-900 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-teal-600/50 hover:scale-105"
              aria-label="Voir la carte interactive de la zone d'intervention"
            >
              Voir la carte interactive
              <svg
                className="w-4 h-4 ml-2"
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

          {/* 📅 CTA Prendre rendez-vous */}
          <div className="bg-gradient-to-br from-yellow-700/25 via-yellow-600/15 to-yellow-700/25 border border-yellow-700/50 rounded-xl p-6 flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Prêt à prendre rendez-vous ?
            </h3>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
              Réservez votre créneau en ligne
            </p>

            <Link
              href="/booking"
              className="inline-flex items-center justify-center bg-orange-900 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-orange-600/50 hover:scale-105"
              aria-label="Réserver un rendez-vous maintenant"
            >
              Réserver maintenant
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
