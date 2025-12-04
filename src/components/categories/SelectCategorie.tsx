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
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { } from "react";

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
  return (
    <div className="w-full">
      <Listbox value={categorie} onChange={setCategorie}>
        {({ open }) => {
          onOpenChange?.(open);
          return (
        <div className="relative z-[9999]">
          <Listbox.Button className="relative z-0 cursor-pointer w-full rounded-xl border-2 border-amber-500 bg-gray-900 py-3 px-4 text-white text-sm md:text-base flex justify-between items-center focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 outline-none transition-all">
            <span className={categorie ? "text-white" : "text-gray-400"}>
              {categorie || "- Sélectionnez une catégorie -"}
            </span>
            <ChevronUpDownIcon className="h-5 w-5 text-amber-400" />
          </Listbox.Button>

            <Listbox.Options className="z-[9999] mt-1 w-full max-h-[70vh] bg-gray-900 border-2 border-amber-500 rounded-xl text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-900 pointer-events-none"></div>
              <div className="relative z-10 overflow-y-auto max-h-[70vh]">
              {categories.map((cat) => (
                <Listbox.Option
                  key={cat}
                  value={cat}
                  className={({ active }) => {
                    // Couleur spéciale pour "Intervention sur devis"
                    const isSpecialCategory = cat === "Intervention sur devis";

                    return `cursor-pointer select-none px-4 py-2 transition-colors ${
                      active
                        ? "bg-gray-500/20 text-amber-400"
                        : isSpecialCategory
                        ? "text-red-400"
                        : "text-white"
                    } ${
                      isSpecialCategory
                        ? "border-t border-gray-700 mt-1 pt-3"
                        : ""
                    }`;
                  }}
                >
                  {({ selected }) => (
                    <div className="flex justify-between items-center">
                      <span
                        className={
                          selected
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
                  )}
                </Listbox.Option>
              ))}
              </div>
            </Listbox.Options>
        </div>
          );
        }}
      </Listbox>
    </div>
  );
}
