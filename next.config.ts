// -----------------------------------------------------------------------------
// Fichier : next.config.mjs
// -----------------------------------------------------------------------------
// 🎯 Objectif : Configuration Next.js globale
// - Autorise le chargement d'images distantes depuis Cloudinary
// - Prépare la compatibilité avec la dernière version de Next.js
// -----------------------------------------------------------------------------

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
