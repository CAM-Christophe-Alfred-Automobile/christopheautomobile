// -----------------------------------------------------------------------------
// Fichier : src/app/layout.tsx
// -----------------------------------------------------------------------------
// 🎯 OBJECTIF : Définir le layout racine de l’application Next.js
// -----------------------------------------------------------------------------
//
// Ce fichier est le WRAPPER GLOBAL de ton site.
// Il s’applique à toutes les pages (/, /contact, /booking, etc.) et définit :
//
// 1️⃣ La structure HTML de base (<html> / <body>)
// 2️⃣ Les polices Google utilisées sur tout le site
// 3️⃣ Les styles globaux (Tailwind, Leaflet, etc.)
// 4️⃣ La configuration des icônes FontAwesome
// 5️⃣ Les métadonnées (title, description, OpenGraph...) importées depuis /config
//
// ⚙️ Grâce à ce layout :
// - tu n’as pas besoin de répéter l’import des polices et styles dans chaque page
// - tu peux gérer le SEO global dans un seul fichier (config/metadata.ts)
// - le rendu est uniforme sur toutes les routes
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// 🔹 Import des polices Google (Next.js Font Optimization)
// -----------------------------------------------------------------------------
// - "Geist" : police sans-serif moderne pour le texte principal
// - "Geist_Mono" : police monospace pour le code ou éléments techniques
// -----------------------------------------------------------------------------
import { Geist, Geist_Mono } from "next/font/google";

// -----------------------------------------------------------------------------
// 🔹 Import des styles globaux
// -----------------------------------------------------------------------------
// - globals.css : contient Tailwind CSS et d’autres styles généraux
// - Les styles importés ici s’appliquent à tout le site
// -----------------------------------------------------------------------------
import "./globals.css";
import { SchemaMount } from "@/components/SEO";

// -----------------------------------------------------------------------------
// 🔹 FontAwesome (icônes)
// -----------------------------------------------------------------------------
// - "config.autoAddCss = false" empêche FontAwesome d’ajouter son CSS automatiquement.
//   On l’importe manuellement pour un meilleur contrôle et éviter les doublons.
// -----------------------------------------------------------------------------
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

// -----------------------------------------------------------------------------
// 🔹 Import des métadonnées
// -----------------------------------------------------------------------------
// Les métadonnées (title, description, OpenGraph, etc.) sont centralisées dans
// "src/seo/metadata.ts" pour faciliter la personnalisation des templates.
// -----------------------------------------------------------------------------
export { metadata } from "@/seo/metadata";

import { WhatsappFloat, InstallPWA, IOSInstallPrompt,  } from "@/components";

// -----------------------------------------------------------------------------
// 🔹 Initialisation des polices
// -----------------------------------------------------------------------------
// Chaque police génère une variable CSS ("--font-geist-sans" / "--font-geist-mono")
// qui sera utilisée dans Tailwind ou les styles inline du site.
// -----------------------------------------------------------------------------
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"], // caractères latins uniquement
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// -----------------------------------------------------------------------------
//! 🔹 Composant principal RootLayout
// -----------------------------------------------------------------------------
// - Enveloppe toutes les pages de l’application
// - Définit la structure <html> / <body>
// - Charge les polices et le style global
// -----------------------------------------------------------------------------
export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // contenu dynamique (chaque page)
}) {
  return (
    // ⚠️ Aucun texte ou retour entre <html> et <body>
    // pour éviter l’erreur "Whitespace text nodes cannot be a child of <html>"
    <html lang="fr">
      <head>
        {/* 🔍 Schémas JSON-LD pour le SEO (LocalBusiness, Organization, Website) */}
        <SchemaMount />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        
        {/* 
          {children} = contenu de chaque page :
          - Sur "/"         → app/page.tsx
          - Sur "/contact"  → app/contact/page.tsx
          - Sur "/booking"  → app/booking/page.tsx
          
          Le layout reste toujours présent autour (polices, styles, etc.)
        */}
        {children}
        {/* Bouton flottant WhatsApp sur toutes les pages */}
        <WhatsappFloat />
        {/* 📱 Gestion de l’installation PWA (bouton flottant intelligent) */}
        <InstallPWA /> {/* Android/Chrome */}
        <IOSInstallPrompt /> {/* iOS/Safari */}
      </body>
    </html>
  );
}
