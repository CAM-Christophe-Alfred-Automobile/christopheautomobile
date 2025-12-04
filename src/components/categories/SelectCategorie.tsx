/**
 * ============================================================================
 * 📝 COMPOSANT : SelectCategorie
 * ============================================================================
 * Menu déroulant personnalisé pour sélectionner une catégorie d'intervention
 *
 * 🎨 OBJECTIF :
 * - Remplace le <select> natif HTML par un composant stylé et contrôlable
 * - Utilise Headless UI (Listbox) pour un meilleur contrôle sur mobile
 * - Évite les problèmes d'affichage du dropdown natif sur mobile
 *
 * 📍 UTILISÉ DANS :
 * - /src/app/booking/page.tsx (page de réservation)
 *
 * 🔧 PROPS :
 * - categorie: La catégorie actuellement sélectionnée
 * - setCategorie: Fonction pour changer la catégorie
 * - categories: Liste des catégories disponibles
 *
 * 💡 AVANTAGES :
 * - Style cohérent sur tous les navigateurs et appareils
 * - Dropdown bien centré et positionné sur mobile
 * - Animations fluides avec Transition
 * - Icône checkmark pour la sélection active
 * ============================================================================
 */

"use client";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useRef } from "react";

interface SelectCategorieProps {
  categorie: string;
  setCategorie: (value: string) => void;
  categories: string[];
  onOpenChange?: (open: boolean) => void;
}

export default function SelectCategorie({
  categorie,
  setCategorie,
  categories,
  onOpenChange,
}: SelectCategorieProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onOpenChange]);

  // Notifier le parent quand l'état du dropdown change
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectOption = (cat: string) => {
    setCategorie(cat);
    setIsOpen(false);
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="relative z-0 cursor-pointer w-full rounded-xl border-2 border-amber-500 bg-gray-900 py-3 px-4 text-white text-sm md:text-base flex justify-between items-center focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 outline-none transition-all"
      >
        <span className={categorie ? "text-white" : "text-gray-400"}>
          {categorie || "- Sélectionnez une catégorie -"}
        </span>
        <ChevronUpDownIcon className={`h-5 w-5 text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="z-[9999] mt-1 w-full max-h-[70vh] bg-gray-900 border-2 border-amber-500 rounded-xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gray-900 pointer-events-none"></div>
          <div className="relative z-10 overflow-y-auto max-h-[70vh]">
            {categories.map((cat) => {
              // Couleur spéciale pour "Intervention sur devis"
              const isSpecialCategory = cat === "Intervention sur devis";
              const isSelected = cat === categorie;
              
              return (
                <div
                  key={cat}
                  onClick={() => handleSelectOption(cat)}
                  className={`cursor-pointer select-none px-4 py-2 transition-colors ${
                    isSelected
                      ? "bg-gray-500/20 text-amber-400"
                      : isSpecialCategory
                      ? "text-red-400"
                      : "text-white"
                  } ${
                    isSpecialCategory
                      ? "border-t border-gray-700 mt-1 pt-3"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={
                        isSelected
                          ? "font-semibold text-amber-400"
                          : cat === "Intervention sur devis"
                          ? "font-medium text-red-400"
                          : "font-normal"
                      }
                    >
                      {cat === "Intervention sur devis" && "⚠️ "}
                      {cat}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
