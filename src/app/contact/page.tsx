/**
 * Page de contact (/contact)
 *
 * Cette page permet aux clients de contacter le garage via :
 * 1. Un formulaire de contact (envoi d'email via Nodemailer)
 * 2. Une carte interactive montrant la zone d'intervention
 *
 * FORMULAIRE DE CONTACT :
 * - Champs : prénom, nom, email, téléphone, sujet, message
 * - Validation côté client (champs requis)
 * - Envoi vers API /api/contact
 * - Email expédié via Nodemailer (Gmail SMTP)
 *
 * CARTE LEAFLET :
 * - Affiche Salon-de-Provence avec un marqueur
 * - Cercle de 30km montrant la zone d'intervention
 * - Chargée dynamiquement côté client (pas de SSR)
 *
 * LAYOUT RESPONSIVE :
 * - Mobile : Formulaire en haut, carte en bas (empilés)
 * - Desktop : Formulaire à gauche, carte à droite (côte à côte)
 */

"use client"; //! Nécessaire pour le formulaire interactif

import { Header, Footer, ContactForm } from "@/components";
import dynamic from "next/dynamic";
import Image from "next/image";
import { siteConfig } from "@/config/site";
/**
 * Chargement dynamique du composant MapZone
 *
 * POURQUOI dynamic avec ssr: false ?
 * Leaflet utilise des APIs du navigateur (window, document) qui n'existent pas
 * côté serveur. En désactivant le SSR, on évite l'erreur "window is not defined".
 * La carte se charge uniquement côté client après le montage du composant.
 *
 * Le composant loading affiche un placeholder pendant le chargement.
 */
const MapZone = dynamic(() => import("@/components/map/MapZone"), {
  ssr: false, //! CRUCIAL : Désactive le Server-Side Rendering pour Leaflet
  loading: () => (
    <div className="h-64 bg-gray-700 rounded flex items-center justify-center text-gray-400">
      Chargement de la carte...
    </div>
  ),
});

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* En-tête avec navigation */}
      <Header />

      {/* Zone principale : formulaire + carte */}
      <main className="flex-1 flex items-center py-8 px-4">
        {/*
         * Grid responsive :
         * - Mobile (< 1024px) : 1 colonne (empilé)
         * - Desktop (≥ 1024px) : 2 colonnes (côte à côte)
         */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLONNE 1 : Formulaire de contact */}
          <div className="space-y-4">
            <ContactForm />
          </div>

          {/* COLONNE 2 : Carte de la zone d'intervention */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6">
            {/* Section Informations de contact */}
            <div>
              <div className="flex items-center justify-between mb-3 gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    📞 Coordonnées
                  </h3>
                  <div className="space-y-1 text-gray-300 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-400 min-w-[70px]">
                        Téléphone :
                      </span>
                      <a
                        href={`tel:${siteConfig.phone}`}
                        className="hover:text-amber-400 transition-colors underline"
                      >
                        {siteConfig.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-400 min-w-[70px]">
                        Mail :
                      </span>
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="hover:text-amber-400 transition-colors  underline"
                      >
                        {siteConfig.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-400 min-w-[70px]">
                        Localisation :
                      </span>
                      <span>{siteConfig.city}</span>
                    </div>
                  </div>
                </div>

                {/* Logo à droite - Visible uniquement sur desktop */}
                <Image 
                  src="/images/CAM-blanc-complet.webp" 
                  alt="Logo CAM" 
                  width={200}
                  height={200}
                  className="hidden sm:block h-20 w-auto opacity-80 flex-shrink-0"
                />
              </div>
            </div>

            {/* Section Horaires */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">
                🕒 Horaires d&apos;ouverture
              </h3>
              <div className="space-y-1.5 text-gray-300 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Lundi au Vendredi :</span>
                  <span className="text-blue-400 font-semibold">
                    8h30 - 17h30
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Samedi & Dimanche :</span>
                  <span className="text-red-400 font-semibold">Fermé</span>
                </div>
              </div>
            </div>

            {/* Section Zone d'intervention avec carte */}
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                📍 Zone d&apos;intervention
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Rayon de{" "}
                <span className="text-blue-400 font-bold">
                  {siteConfig.rayonIntervention} km
                </span>{" "}
                autour de {siteConfig.city}
              </p>
              {/* Carte Leaflet chargée dynamiquement */}
              <MapZone />
            </div>
          </div>
        </div>
      </main>

      {/* Pied de page */}
      <Footer />
    </div>
  );
}
