// ===========================================================================
// Fichier : src/components/SEO/SchemaMount.tsx
// ===========================================================================
//
//! 🎯 OBJECTIF SIMPLE :
// Charger tous les schémas SEO importants en une seule fois.
// On met ce composant dans <head> pour que Google lise tout.
//
//! 📌 UTILITÉ SEO :
// Mobile, ↑ visibilité locale, ↑ info business fiable pour Google.
//
//! 🔗 Au lieu d'importer plusieurs schémas dans layout.tsx,
//! on importe seulement <SchemaMount />.
//
// ===========================================================================

import LocalBusinessSchema from "./LocalBusinessSchema";
import OrganizationSchema from "./OrganizationSchema";
import WebsiteSchema from "./WebsiteSchema";

export default function SchemaMount() {
  return (
    <>
      <LocalBusinessSchema />
      <OrganizationSchema />
      <WebsiteSchema />
    </>
  );
}
