/**
 * ============================================================================
 * 📄 COMPOSANT : HeroSection
 * ============================================================================
 * Section Hero (première section de la page d'accueil)
 * - Badge "Mécanicien indépendant"
 * - Panneau néon CAM
 * - Texte de présentation
 * - Image du camion
 * - Boutons CTA (Réserver / Contacter)
 * - Stats (100%, 24h, 60km)
 * ============================================================================
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { NeonCAM } from "@/components"; //Panneau néon CAM
import { lato } from "@/fonts";
import { Wrench, Clock, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function HeroSection() {
  return (
    <section
      aria-label="Section principale"
      className="relative py-4 sm:py-8 px-4 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
    >
      <div className="relative max-w-7xl mx-auto">
        {/* Badge "Mécanicien indépendant" */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center bg-amber-600/10 border border-amber-600/20 rounded-full px-4 py-2">
            <svg
              className="w-5 h-5 text-amber-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-amber-400 font-semibold sm:text-sm text-xs">
              Mécanicien indépendant - Service à domicile
            </span>
          </div>
        </div>

        {/* Grid 2 colonnes : Texte + Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-4">
          {/* Colonne gauche : Panneau + Texte */}
          <div className="flex flex-col items-center space-y-4 lg:space-y-6">
            {/* Panneau néon CAM */}
            <NeonCAM />
            {/* Texte de présentation */}
            <p
              className={`${lato.className} max-w-2xl text-base sm:text-lg text-gray-200 leading-relaxed text-center`}
            >
              Ancien militaire et passionné de mécanique depuis toujours,
              j&apos;ai choisi de mettre ma{" "}
              <span className="text-amber-700 font-semibold">rigueur</span> et
              mon{" "}
              <span className="text-amber-700 font-semibold">expérience</span>{" "}
              au service des particuliers. Aujourd&apos;hui, j&apos;interviens
              directement à votre domicile, avec la même exigence qu&apos;en
              atelier : un{" "}
              <span className="text-amber-700 font-semibold">
                travail soigné
              </span>
              , des{" "}
              <span className="text-amber-700 font-semibold">
                tarifs transparents
              </span>{" "}
              et un{" "}
              <span className="text-amber-700 font-semibold">
                service de confiance
              </span>
              .
              <br />
              <br />
              Chaque intervention est réalisée avec{" "}
              <span className="text-amber-700 font-semibold">
                précision
              </span> et{" "}
              <span className="text-amber-700 font-semibold">
                respect du client
              </span>
              .
            </p>
            {/* Image ronde visible uniquement sur mobile */}
            <div className="flex justify-center lg:hidden">
              <Image
                src="/images/accueil2.webp"
                alt="Christophe AutoMobile"
                width={200}
                height={200}
                quality={85}
                priority
                className="w-38 h-38 rounded-full object-cover shadow-2xl transition-all duration-300"
              />
            </div>
          </div>

          {/* Colonne droite : Image visible uniquement sur desktop */}
          <div className="hidden lg:flex justify-center lg:justify-start">
            <Image
              src="/images/accueil2.webp"
              alt="Christophe AutoMobile"
              width={600}
              height={600}
              quality={85}
              priority
              className="w-full max-w-md h-auto rounded-lg object-cover shadow-2xl transition-all duration-300"
            />
          </div>
        </div>

        {/* Boutons CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/booking"
            className="group inline-flex items-center justify-center bg-amber-700 text-white font-bold text-lg px-6 py-2 sm:px-8 sm:py-4 rounded-lg shadow-lg hover:bg-amber-800 transition-all duration-200 transform hover:scale-105"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Prendre rendez-vous
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-gray-800 text-white font-semibold text-lg px-6 py-2 sm:px-8 sm:py-4 rounded-lg border-2 border-gray-700 hover:border-amber-700 hover:bg-gray-700 transition-all duration-200"
            aria-label="Nous contacter pour plus d'informations"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Me contacter
          </Link>
        </div>

        {/* Stats : 100%, 24h, 60km */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto mt-10 text-center">
          {/* Indicateur 1 : 100% Interventions à domicile */}
          <div className="flex flex-col items-center">
            <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-orange-500">
              100%
            </p>
            <p className="text-gray-300 text-xs sm:text-sm leading-tight">
              Interventions à domicile
            </p>
          </div>

          {/* Indicateur 2 : 24h Réponse rapide */}
          <div className="flex flex-col items-center">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-orange-500">24h</p>
            <p className="text-gray-300 text-xs sm:text-sm leading-tight">
              Réponse rapide
            </p>
          </div>

          {/* Indicateur 3 : 60 km autour de Salon */}
          <div className="flex flex-col items-center">
            <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-orange-500">
             { siteConfig.rayonIntervention} km
            </p>
            <p className="text-gray-300 text-xs sm:text-sm leading-tight">
              Autour de Salon de Provence
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
