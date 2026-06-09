// -----------------------------------------------------------------------------
// Fichier : next.config.mjs
// -----------------------------------------------------------------------------
// 🎯 Objectif : Configuration Next.js globale
// - Autorise le chargement d'images distantes depuis Cloudinary
// - Prépare la compatibilité avec la dernière version de Next.js
// -----------------------------------------------------------------------------

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisation des images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // Configuration des qualités d'images autorisées
    qualities: [25, 50, 75, 85, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    // Optimisation du chargement des images
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Optimisation du build
  compiler: {
    // Supprime console.log en production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Optimisation des performances
  experimental: {
    // Optimise le chargement des CSS
    optimizeCss: true,
    // Optimise les fonts
    optimizePackageImports: ["@heroicons/react", "@fortawesome/react-fontawesome"],
  },

  // Headers de sécurité et performance
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|gif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
