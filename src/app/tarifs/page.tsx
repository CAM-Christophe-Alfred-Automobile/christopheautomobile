// -----------------------------------------------------------------------------
// FICHIER : src/app/tarifs/page.tsx
// -----------------------------------------------------------------------------
//! 🎯 OBJECTIF :
// Afficher la page des tarifs sous forme de liste filtrable,
// triée par durée, avec un affichage SEO-friendly et une navigation claire.
//
//! 💡 FONCTIONNALITÉS PRINCIPALES :
// - Recherche en temps réel sur les prestations
// - Tri automatique par durée croissante
// - Groupement par catégories avec accordéons (ouverture globale possible)
// - Code couleur par temps d’intervention
// - Modale Autodoc pour les pièces détachées
// - Contenu 100% indexable par Google ✨
//
//! 📦 DONNÉES :
// Chargement des prestations depuis le fichier local :
//   src/app/data/services.json
//
//! 🎨 DESIGN :
// - Fond sombre cohérent avec l'identité du site
// - Columns Masonry responsives (1 → 2 colonnes)
// - Bouton “Tout ouvrir / Tout fermer”
// - Composants réutilisables (Header, Footer, CategoryAccordion, etc.)
//
//! 🔁 MISE À JOUR :
// La date affichée se base sur la date actuelle du navigateur.
// -----------------------------------------------------------------------------


"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic"; 
import { Header, Footer, InfoModal, CategoryAccordion } from "@/components";
import servicesData from "@/app/data/services.json";
import { ColorLegend } from "@/components/services/ServiceCard";
import SearchField from "@/components/search/SearchField";

// ✅ Import dynamique de ta modale (empêche le SSR)
const AutodocModal = dynamic(() => import("@/components/modals/autodocModal"), {
  ssr: false,
});

export default function TarifsPage() {
  const [expandAll, setExpandAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const lastUpdate = new Date().toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  // Fonction pour normaliser la durée (convertir en nombre pour le tri)
  const normalizeDuree = (duree: number | string | null): number => {
    if (duree === null || duree === undefined) return Infinity; // Les null à la fin
    if (typeof duree === "number") return duree;
    // Si c'est une string ("variable", "Sur devis", etc.), mettre à la fin
    return Infinity;
  };

  // Filtrer et trier les services
  const filteredAndSortedServices = useMemo(() => {
    // Filtrer selon la recherche
    const filtered = servicesData.filter((service) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        service.service.toLowerCase().includes(query) ||
        service.categorie.toLowerCase().includes(query) ||
        (service.description && service.description.toLowerCase().includes(query))
      );
    });

    // Trier par durée croissante
    return filtered.sort((a, b) => {
      return normalizeDuree(a.duree) - normalizeDuree(b.duree);
    });
  }, [searchQuery]);

  // Grouper les services filtrés par catégorie
  const categories = Array.from(
    new Set(filteredAndSortedServices.map((s) => s.categorie))
  );

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

          {/* Champ de recherche */}
          <div className="mb-8">
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              resultCount={filteredAndSortedServices.length}
              showResultCount={true}
            />
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
            {categories.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-400 text-lg">Aucune intervention trouvée pour &quot;{searchQuery}&quot;</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              categories.map((categorie) => {
                // Filtrer les services par catégorie
                const services = filteredAndSortedServices.filter(
                  (s) => s.categorie === categorie
                );

                return (
                  <CategoryAccordion
                    key={`${categorie}-${expandAll}-${searchQuery}`}
                    categorie={categorie}
                    services={services}
                    defaultOpen={expandAll || searchQuery !== ""}
                  />
                );
              })
            )}
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
