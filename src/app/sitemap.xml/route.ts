// -----------------------------------------------------------------------------
// 📄 Fichier : app/sitemap.xml/route.ts
// -----------------------------------------------------------------------------
// 🎯 OBJECTIF :
// Générer automatiquement le fichier `sitemap.xml` du site LVTC afin d’aider les
// moteurs de recherche (Google, Bing, etc.) à explorer et indexer les pages clés
// du site plus efficacement.
//
// 🧩 FONCTIONNEMENT :
// 1. Le fichier utilise la configuration centralisée `siteConfig` pour récupérer
//    l’URL de base (`baseUrl`) définie dans le `.env` via `NEXT_PUBLIC_BASE_URL`.
// 2. Les routes statiques principales du site (accueil, tarifs, réservation, contact)
//    sont listées dans le tableau `staticRoutes`.
// 3. Un XML conforme au standard des sitemaps est généré dynamiquement.
// 4. Chaque route est insérée dans une balise `<url>` contenant son `<loc>` complet.
// 5. La réponse est renvoyée au format `application/xml` pour être lisible
//    par les moteurs de recherche.
//
// 💡 BON À SAVOIR :
// - Ce fichier est automatiquement servi à l’adresse `/sitemap.xml`.
// - En production, `baseUrl` pointera vers `https://www.lvtc.fr` (injection via Coolify).
// - Tu peux facilement y ajouter des routes dynamiques (par exemple des pages
//   de trajets ou d’articles) si ton site en contient.
// - Le sitemap améliore la visibilité SEO et accélère l’indexation des nouvelles pages.
//
// 🔗 Pour le relier ensuite : soumets l’URL `https://www.lvtc.fr/sitemap.xml` dans Google Search Console.
// -----------------------------------------------------------------------------

import { NextResponse } from 'next/server';
import { siteConfig } from '@/config/site'; 

export async function GET() {
  // ---------------------------------------------------------------------------
  // 🌐 Base URL du site (utilisée depuis la config centralisée)
  // ---------------------------------------------------------------------------
  const baseUrl = siteConfig.url || 'http://localhost:3000';

  // ---------------------------------------------------------------------------
  // 🗺️ Routes statiques à inclure dans le sitemap
  // ---------------------------------------------------------------------------
  const staticRoutes: string[] = [
    '', // page d'accueil
    '/tarifs',
    '/booking',
    '/contact',
    // ajoute ici d'autres pages importantes si besoin
  ];

  // ------------------------------------------------------a---------------------
  // 🧩 Génération dynamique du XML
  // ---------------------------------------------------------------------------
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticRoutes
      .map(
        (route) => `
      <url>
        <loc>${baseUrl}${route}</loc>
      </url>
    `
      )
      .join('')}
  </urlset>`;

  // ---------------------------------------------------------------------------
  // 📦 Réponse HTTP avec le contenu XML et bon type MIME
  // ---------------------------------------------------------------------------
  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
