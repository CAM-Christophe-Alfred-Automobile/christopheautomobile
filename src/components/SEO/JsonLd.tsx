// ===========================================================================
// Fichier : src/components/SEO/JsonLd.tsx
// ===========================================================================
//
//! 🎯 OBJECTIF SIMPLE :
// Ajouter discrètement sur la page des infos lisibles par Google pour améliorer le SEO.
// Ce composant sert juste à insérer ces infos dans une balise <script>.
//
//! ⚙️ UTILISATION :
// On lui envoie des données JSON-LD → il les met dans la page.
// Les autres schémas SEO utiliseront ce composant.
//
// ===========================================================================

interface JsonLdProps {
  // Les données JSON-LD à envoyer à Google
  data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      // Google doit comprendre qu’il s’agit d’un schéma JSON-LD
      type="application/ld+json"
      // On injecte les données JSON directement dans la page
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          // Contexte obligatoire pour Google
          "@context": "https://schema.org",
          // On ajoute le contenu reçu du composant
          ...data,
        }),
      }}
    />
  );
}
