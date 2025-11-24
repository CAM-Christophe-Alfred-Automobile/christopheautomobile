// ===========================================================================
// Fichier : src/components/SEO/index.ts
// ===========================================================================
//
//! 🎯 OBJECTIF SIMPLE :
// Faciliter les imports des composants SEO.
// Au lieu d'importer chaque fichier manuellement,
// on peut faire : import { SchemaMount } from "@/components/SEO"
//
//! 💡 Remarque :
// Même si on utilise seulement SchemaMount, ce fichier permet
// d'organiser proprement le code et de simplifier les imports.
//
// ===========================================================================

export { default as JsonLd } from "./JsonLd";
export { default as LocalBusinessSchema } from "./LocalBusinessSchema";
export { default as OrganizationSchema } from "./OrganizationSchema";
export { default as WebsiteSchema } from "./WebsiteSchema";
export { default as SchemaMount } from "./SchemaMount";
