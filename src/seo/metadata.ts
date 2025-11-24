// ===========================================================================
// Fichier : src/seo/metadata.ts
// ===========================================================================
//
//! 🎯 OBJECTIF SIMPLE :
// Gérer toutes les balises <meta> globales du site (titre, description,
// réseaux sociaux, favicon, robots, etc.).
// Next.js l’utilise automatiquement dans layout.tsx pour le SEO.
//
//! 📌 UTILITÉ :
// Google s’en sert pour afficher ton site dans les résultats.
// Facebook / WhatsApp / LinkedIn / Twitter s’en servent lors d’un partage.
//
//! 🔗 Lis les données dans seoConfig pour éviter de tout modifier partout.
//
// ===========================================================================


import type { Metadata } from "next";
import { seoConfig } from "./config";

export const metadata: Metadata = {
  // ---------------------------------------------------------------------------
  // 📝 Titre & Description
  // ---------------------------------------------------------------------------
  title: {
    default: `${seoConfig.name} - ${seoConfig.slogan}`,
    template: `%s | ${seoConfig.name}`, // Pour les pages enfants
  },
  description: seoConfig.description,
  keywords: seoConfig.keywords,

  // ---------------------------------------------------------------------------
  // 🔗 URL canonique
  // ---------------------------------------------------------------------------
  alternates: {
    canonical: seoConfig.baseUrl,
  },

  // ---------------------------------------------------------------------------
  // 🖼️ Open Graph (Facebook, LinkedIn, etc.)
  // ---------------------------------------------------------------------------
/*   openGraph: {
    type: "website",
    locale: "fr_FR",
    url: seoConfig.baseUrl,
    siteName: seoConfig.name,
    title: `${seoConfig.name} - ${seoConfig.slogan}`,
    description: seoConfig.description,
    images: [
      {
        url: `${seoConfig.baseUrl}${seoConfig.images.ogImage}`,
        width: 1200,
        height: 630,
        alt: `${seoConfig.name} - ${seoConfig.slogan}`,
      },
    ],
  }, */


  // ---------------------------------------------------------------------------
  // 🎨 Icônes & Manifest
  // ---------------------------------------------------------------------------
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",

  // ---------------------------------------------------------------------------
  // 🤖 Robots
  // ---------------------------------------------------------------------------
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ---------------------------------------------------------------------------
  // 🌍 Informations supplémentaires
  // ---------------------------------------------------------------------------
  authors: [{ name: seoConfig.name }],
  creator: seoConfig.name,
  publisher: seoConfig.name,
  formatDetection: {
    telephone: false, // Évite la détection automatique des numéros
  },
};
