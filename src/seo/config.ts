// ===========================================================================
// Fichier : src/seo/config.ts
// ===========================================================================
//
//! 🎯 OBJECTIF SIMPLE :
// Centraliser toutes les informations SEO de l’entreprise (nom, ville,
// description, images, réseaux sociaux, etc.).
// Les composants SEO vont venir lire ici — pas besoin de tout modifier ailleurs.
//
//! 📌 UTILITÉ :
// Si tu changes un élément (téléphone, logo, ville, description...),
// toutes les données SEO sur le site se mettront à jour automatiquement.
//
//! 🔗 Utilisé par :
// - Les schémas JSON-LD (LocalBusinessSchema, OrganizationSchema, WebsiteSchema)
// - metadata.ts pour les balises SEO Next.js
//
// ===========================================================================

import { siteConfig } from "@/config/site";

export const seoConfig = {
  // 📱 Informations de base
  name: siteConfig.name,
  slogan: "Mécanicien automobile à domicile à Salon-de-Provence",
  description: siteConfig.description,
  serviceType: "Mécanicien automobile à domicile",
  baseUrl: siteConfig.url,

  // 🏷️ Types Schema.org configurables
  businessTypes: ["LocalBusiness", "AutomotiveBusiness"],
  additionalType: "https://schema.org/AutomotiveBusiness",

  // 📞 Contact
  phone: siteConfig.phone,
  email: siteConfig.email,

  // 📍 Localisation & zone de service
  address: {
    city: siteConfig.city,
    country: "FR",
    countryName: "France",
  },
  serviceArea: {
    lat: 43.6403, // Salon-de-Provence
    lon: 5.0970,
    radiusMeters: Number(siteConfig.rayonIntervention) * 1000, // conversion km -> mètres
  },

  // 🖼️ Images
  images: {
    logo: "/images/seo/logo.png",
     ogImage: "/images/seo/logo-og.png", //1200x630
  },

  // 🌐 Réseaux sociaux
  socialLinks: [], // à compléter si besoin

  // 💰 Prix & horaires
  priceRange: "€€",
  openingHours: "Mo-Sa 08:00-19:00",

  // 🏷️ Mots-clés SEO optimisés
  keywords: [
    "mécanicien auto Salon-de-Provence",
    "réparation voiture Salon-de-Provence",
    "dépannage auto domicile Salon",
    "garage mobile Salon-de-Provence",
    "entretien auto domicile Salon",
    "révision automobile Salon",
    "diagnostic auto domicile Salon",
    "réparation moteur Salon-de-Provence",
    "intervention mécanique 40km Salon",
  ],
};
