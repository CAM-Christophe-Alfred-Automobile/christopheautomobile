// -----------------------------------------------------------------------------
// FICHIER : src/app/tarifs/page.tsx
// -----------------------------------------------------------------------------
//! 🎯 OBJECTIF :
// Afficher la page des tarifs du garage MécaniPro sous deux formes :
//   1️⃣ Une image Cloudinary (si définie dans .env)
//   2️⃣ Une version texte SEO-friendly (si aucune image n’est définie)
//
//! 💡 LOGIQUE :
// - Si la variable d’environnement NEXT_PUBLIC_TARIFS_IMAGE est présente,
//   la page affiche l’image Cloudinary (utile pour un rendu visuel).
// - Si elle est absente, la page affiche une liste HTML stylisée,
//   parfaitement lisible par Google et meilleure pour le référencement (SEO).
//
//! ⚙️ CONFIGURATION REQUISE (.env) :
//   NEXT_PUBLIC_TARIFS_IMAGE=https://res.cloudinary.com/.../tarifs.png
//   NEXT_PUBLIC_TARIFS_LAST_UPDATE=octobre 2025
//
//! 📌 AVANTAGES SEO :
// - Le texte est indexable par les moteurs de recherche.
// - Chaque prestation contient des mots-clés pertinents (vidange, freinage, etc.).
// - Le code HTML propre améliore la compréhension sémantique de la page.
//
//! 🧩 DESIGN :
// - Fond sombre cohérent avec le reste du site
// - Titres clairs et lisibles
// - Cartes élégantes avec ombre et effet hover
// - Mise en page responsive (2 colonnes sur desktop, 1 colonne sur mobile)
// - Prix séparés par un petit trait vertical “|” pour un visuel plus net
//
//! 🛠️ ASTUCE :
// Pour forcer la version texte, il suffit de commenter la ligne
// NEXT_PUBLIC_TARIFS_IMAGE dans le fichier .env.
//
// -----------------------------------------------------------------------------

"use client";

import { useState } from "react";
import dynamic from "next/dynamic"; // ✅ Ajout
import { Header, Footer, InfoModal } from "@/components";
import servicesData from "@/app/data/services.json";
import { ColorLegend } from "@/components/ServiceCard";
import CategoryAccordion from "@/components/CategoryAccordion";

// ✅ Import dynamique de ta modale (empêche le SSR)
const AutodocModal = dynamic(() => import("@/components/modals/autodocModal"), {
  ssr: false,
});

export default function TarifsPage() {
  //! Grouper les services par catégorie
  const categories = Array.from(new Set(servicesData.map((s) => s.categorie)));
  const [expandAll, setExpandAll] = useState(false);

  const lastUpdate = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* 🔹 En-tête du site avec navigation principale */}
      {/* ------------------------------------------------------------------ */}
      <Header />

      <main className="flex-1 p-8 text-white">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Les Tarifs
              </h1>
              <InfoModal />
            </div>
            <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed mb-2">
              Découvrez mes prestations et tarifs pour l&apos;entretien et la
              réparation de votre véhicule.
              <br />
              Les prix concernent{" "}
              <strong>la main d&#39;oeuvre uniquement</strong>
            </p>

            {/* 💡 Bouton ouverture modale Autodoc */}
            <div className="text-center mb-2">
              <AutodocModal />
            </div>

            {/* Légende des couleurs */}
            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-sm text-gray-400 text-center">
              <span className="w-full sm:w-auto">Code couleur par durée :</span>
              <ColorLegend />
            </div>
          </div>
          {/* Bouton Tout ouvrir/fermer */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setExpandAll(!expandAll)}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
            >
              {expandAll ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  Tout fermer
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  Tout ouvrir
                </>
              )}
            </button>
          </div>
          {/* Layout en colonnes type masonry avec accordéons */}
          <div className="lg:columns-2 gap-6 space-y-6">
            {categories.map((categorie) => {
              // Filtrer les services : afficher tous ceux sans restriction + ceux marqués pour "tarifs"
              const services = servicesData.filter(
                (s) =>
                  s.categorie === categorie &&
                  (!s.afficherDans || s.afficherDans.includes("tarifs"))
              );

              return (
                <CategoryAccordion
                  key={`${categorie}-${expandAll}`}
                  categorie={categorie}
                  services={services}
                  defaultOpen={expandAll}
                />
              );
            })}
          </div>

          {/* Note et date */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-gray-400 text-sm">
              💡 <strong>Besoin d&apos;un devis personnalisé ?</strong>{" "}
              Contactez moi pour une estimation précise adaptée à votre
              véhicule.
            </p>
            <p className="text-gray-500 text-sm italic">
              Dernière mise à jour : {lastUpdate}
            </p>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* 🔹 Pied de page du site */}
      {/* ------------------------------------------------------------------ */}
      <Footer />
    </div>
  );
}
