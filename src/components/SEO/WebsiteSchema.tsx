// ===========================================================================
// Fichier : src/components/SEO/WebsiteSchema.tsx
// ===========================================================================
//
//! 🎯 OBJECTIF SIMPLE :
// Dire à Google : "Voici mon site officiel".
// Cela aide à mieux afficher ton site dans la recherche.
//
//! 📌 UTILITÉ SEO :
// Permet à Google de comprendre ton site et d’améliorer l’affichage
// (ex : recherche interne Google si tu as une page de recherche).
//
//! 🔗 Chargé automatiquement via SchemaMount.tsx
//
// ===========================================================================

import JsonLd from "./JsonLd";
import { seoConfig } from "@/seo/config";

export default function WebsiteSchema() {
  return (
    <JsonLd
      data={{
        "@type": "WebSite",
        name: seoConfig.name,
        url: seoConfig.baseUrl,
        description: seoConfig.description,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${seoConfig.baseUrl}/reservation?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}
