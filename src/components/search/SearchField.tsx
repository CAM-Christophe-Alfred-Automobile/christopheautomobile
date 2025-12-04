// -----------------------------------------------------------------------------
// FICHIER : src/components/SearchField.tsx
// -----------------------------------------------------------------------------
//! 🎯 OBJECTIF :
// Afficher un champ de recherche permettant de filtrer dynamiquement
// les interventions proposées par le garage MécaniPro.
//
//! 💡 FONCTIONNALITÉS :
// - Saisie du texte de recherche (value + onChange gestionné par le parent)
// - Icône loupe intégrée dans le champ
// - Bouton pour effacer rapidement la recherche
// - Affichage optionnel du nombre de résultats filtrés
//
//! 📱 PLACEHOLDER RESPONSIVE :
// - Version courte sur mobile pour un affichage plus lisible
// - Version complète sur desktop pour des indications plus détaillées
//   (ex : vidange, freinage, diagnostic...)
//
//! 🧩 DESIGN :
// - Style moderne avec Tailwind CSS (fond sombre, focus doré, transitions douces)
// - Icône et placeholder adaptés aux différentes tailles d’écrans
// - Entièrement responsive
//
//! 🔌 INTÉGRATION :
// Ce composant se base sur les props `value` et `onChange` pour être
// contrôlé par son parent, ce qui permet une utilisation flexible dans
// la page des prestations.
//
// -----------------------------------------------------------------------------


"use client";
import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  showResultCount?: boolean;
}

export default function SearchField({
  value,
  onChange,
  resultCount,
  showResultCount = false,
}: SearchFieldProps) {
  //! Texte placeholder responsive
  const placeholderDesktop =
    "Rechercher une intervention (ex: vidange, freinage, diagnostic...)";
  const placeholderMobile = "Rechercher une intervention... ";

  const [placeholder, setPlaceholder] = useState(placeholderDesktop);

  //! Détecte la largeur écran et applique le placeholder adapté
  useEffect(() => {
    const updatePlaceholder = () => {
      if (window.innerWidth < 768) {
        //! Mobile
        setPlaceholder(placeholderMobile);
      } else {
        //! Desktop
        setPlaceholder(placeholderDesktop);
      }
    };

    updatePlaceholder();
    window.addEventListener("resize", updatePlaceholder);

    return () => window.removeEventListener("resize", updatePlaceholder);
  }, []);

  return (
    <div className="max-w-2xl mx-auto mb-6">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg 
                     text-xs md:text-sm
                     placeholder:text-[13px] md:placeholder:text-sm
                     placeholder-gray-500 focus:outline-none focus:border-amber-500
                     focus:ring-1 focus:ring-amber-500 transition-colors"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Effacer la recherche"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {showResultCount && value && resultCount !== undefined && (
        <p className="mt-2 text-sm text-gray-400 text-center">
          {resultCount} résultat{resultCount > 1 ? "s" : ""} trouvé
          {resultCount > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
