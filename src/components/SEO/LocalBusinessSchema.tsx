// ===========================================================================
// Fichier : src/components/SEO/LocalBusinessSchema.tsx
// ===========================================================================
//
//! 🎯 OBJECTIF SIMPLE :
// Dire à Google que ton entreprise est un service local (ex : VTC / Taxi Service)
// et où elle se trouve (ville + zone couverte)
//
//! 📌 UTILITÉ SEO :
// Aide Google à te montrer dans les recherches locales et sur Google Maps.
//
//! 🔗 Ce composant utilise JsonLd pour envoyer ces infos à Google.
//
// ===========================================================================

import JsonLd from "./JsonLd";
import { seoConfig } from "@/seo/config";

export default function LocalBusinessSchema() {
  return (
    <JsonLd
      data={{
        "@type": seoConfig.businessTypes,
        additionalType: seoConfig.additionalType,

        name: seoConfig.name,
        image: `${seoConfig.baseUrl}${seoConfig.images.logo}`,
        telephone: seoConfig.phone,
        email: seoConfig.email,
        priceRange: seoConfig.priceRange,
        address: {
          "@type": "PostalAddress",
          addressLocality: seoConfig.address.city,
          addressCountry: seoConfig.address.country,
        },
        areaServed: [
          {
            "@type": "City",
            name: seoConfig.address.city,
          },
          {
            "@type": "GeoCircle",
            geoMidpoint: {
              "@type": "GeoCoordinates",
              latitude: seoConfig.serviceArea.lat,
              longitude: seoConfig.serviceArea.lon,
            },
            geoRadius: seoConfig.serviceArea.radiusMeters,
          },
        ],
        url: seoConfig.baseUrl,
        description: seoConfig.description,
        openingHours: seoConfig.openingHours,
      }}
    />
  );
}
