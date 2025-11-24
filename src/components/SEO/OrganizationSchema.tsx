// ===========================================================================
// Fichier : src/components/SEO/OrganizationSchema.tsx
// ===========================================================================
//
//! 🎯 OBJECTIF SIMPLE :
// Dire à Google qui est ton entreprise : nom, site web, logo, contact.
//
//! 📌 UTILITÉ SEO :
// Aide Google à bien présenter ton business dans les résultats :
// description, liens réseaux sociaux (sameAs), téléphone, etc.
//
//! 🔗 Utilisé globalement via SchemaMount.tsx
//
// ===========================================================================
import JsonLd from "./JsonLd";
import { seoConfig } from "@/seo/config";

export default function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@type": "Organization",
        name: seoConfig.name,
        url: seoConfig.baseUrl,
        logo: `${seoConfig.baseUrl}${seoConfig.images.logo}`,
        description: seoConfig.description,
        telephone: seoConfig.phone,
        email: seoConfig.email,
        address: {
          "@type": "PostalAddress",
          addressLocality: seoConfig.address.city,
          addressCountry: seoConfig.address.country,
        },
        sameAs: seoConfig.socialLinks,
      }}
    />
  );
}
