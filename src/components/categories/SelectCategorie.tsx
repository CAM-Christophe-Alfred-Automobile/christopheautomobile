/**
 * ============================================================================
 * 📄 COMPOSANT : SelectCategorie
 * ============================================================================
 * Menu déroulant personnalisé pour sélectionner une catégorie d'intervention
 * 
 * 🎯 OBJECTIF :
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
import { Listbox, Transition } from "@headlessui/react";
import {  ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { Fragment } from "react";

interface SelectCategorieProps {
  categorie: string;
  setCategorie: (value: string) => void;
  categories: string[];
}

export default function SelectCategorie({
  categorie,
  setCategorie,
  categories,
}: SelectCategorieProps) {
  return (
    <div className="w-full">
      <Listbox value={categorie} onChange={setCategorie}>
        <div className="relative">
          <Listbox.Button className="relative z-0 cursor-pointer w-full rounded-xl border-2 border-amber-500 bg-gray-900 py-3 px-4 text-white text-sm md:text-base flex justify-between items-center focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 outline-none transition-all ">
            <span className={categorie ? "text-white" : "text-gray-400"}>
              {categorie || "- Sélectionnez une catégorie -"}
            </span>
            <ChevronUpDownIcon className="h-5 w-5 text-amber-400" />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-[1] mt-1 w-full max-h-[70vh] overflow-y-auto bg-gray-900 border-2 border-amber-500/40 rounded-xl shadow-2xl text-white webkit-overflow-scrolling-touch">
              {categories.map((cat) => (
                <Listbox.Option
                  key={cat}
                  value={cat}
                  className={({ active }) =>
                    `cursor-pointer select-none px-4 py-2 transition-colors ${
                      active ? "bg-gray-500/20 text-amber-400" : "text-white"
                    }`
                  }
                >
                  {({ selected }) => (
                    <div className="flex justify-between items-center">
                      <span className={selected ? "font-semibold text-amber-400" : "font-normal"}>
                        {cat}
                      </span>
                     
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}