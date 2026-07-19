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
  slogan: "Mécanicien automobile à domicile à Salon-de-Provence et alentours",
  description: siteConfig.description,
  serviceType: "Mécanicien automobile à domicile",
  baseUrl: siteConfig.url,

  // 🏷️ Types Schema.org configurables
  businessTypes: ["LocalBusiness", "AutoRepair"],
  additionalType: "https://schema.org/AutoRepair",

  // 📞 Contact
  phone: siteConfig.phone,
  email: siteConfig.email,

  // 📍 Localisation & zone de service
  address: {
    streetAddress: siteConfig.address,
    city: siteConfig.city,
    country: "FR",
    countryName: "France",
  },
  serviceArea: {
    lat: 43.6403, // Salon-de-Provence
    lon: 5.0970,
    radiusMeters: Number(siteConfig.rayonIntervention) * 1000, // conversion km -> mètres
    cities: ["Salon-de-Provence", "Aix-en-Provence", "Marseille", "Bouches-du-Rhône"],
  },

  // 🖼️ Images
  images: {
    logo: "/images/seo/logo.png",
     ogImage: "/images/seo/logo-og.png", //1200x630
  },

  // 🌐 Réseaux sociaux & Liens externes
  socialLinks: [
    "https://www.pappers.fr/entreprise/alfred-christophe-888962883",
    "https://annuaire-entreprises.data.gouv.fr/etablissement/88896288300037",
    "https://www.pagesjaunes.fr/pros/64414245"
  ],
  googleBusinessUrl: "https://www.google.com/search?q=Christophe+AutoMobile+(CAM)&kgmid=/g/11mrhqnz4m",
  siret: "88896288300037",

  // 💰 Prix & horaires
  priceRange: "€€",
  openingHours: "Mo-Fr 09:00-17:30",

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
