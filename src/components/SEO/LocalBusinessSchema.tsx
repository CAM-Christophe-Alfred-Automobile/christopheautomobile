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
import { testimonials, aggregateRating } from "@/app/data/testimonials";

export default function LocalBusinessSchema() {
  return (
    <JsonLd
      data={{
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: aggregateRating.ratingValue,
          // Nombre réel d'avis affichés tant que le total exact de la fiche Google n'est pas confirmé.
          reviewCount: aggregateRating.reviewCount ?? testimonials.length,
        },
        review: testimonials.map((t) => ({
          "@type": "Review",
          author: { "@type": "Person", name: t.author },
          datePublished: t.date,
          reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5 },
          reviewBody: t.text,
        })),
        "@type": seoConfig.businessTypes,
        additionalType: seoConfig.additionalType,

        name: seoConfig.name,
        taxID: seoConfig.siret,
        sameAs: [
          seoConfig.googleBusinessUrl,
          ...seoConfig.socialLinks,
        ],
        image: `${seoConfig.baseUrl}${seoConfig.images.logo}`,
        telephone: seoConfig.phone,
        email: seoConfig.email,
        priceRange: seoConfig.priceRange,
        address: {
          "@type": "PostalAddress",
          addressLocality: seoConfig.address.city,
          addressRegion: "Bouches-du-Rhône",
          addressCountry: seoConfig.address.country,
        },
        areaServed: [
          ...seoConfig.serviceArea.cities.map((location) => ({
            "@type": location === "Bouches-du-Rhône" ? "AdministrativeArea" : "City",
            name: location,
          })),
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
