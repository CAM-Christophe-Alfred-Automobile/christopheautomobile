/**
 * ============================================================================
 * 📄 COMPOSANT : CategoryAccordion
 * ============================================================================
 * Accordéon (section repliable) pour afficher une catégorie d'interventions
 *
 * 🎯 OBJECTIF :
 * - Organiser les services par catégorie avec possibilité de replier/déplier
 * - Améliorer la lisibilité quand il y a beaucoup de catégories
 * - Permettre à l'utilisateur de naviguer facilement vers ce qui l'intéresse
 *
 * 📍 UTILISÉ DANS :
 * - /src/app/tarifs/page.tsx (page des tarifs)
 *
 * 🔧 PROPS :
 * - categorie: Nom de la catégorie (ex: "Entretien & vidanges")
 * - services: Liste des services de cette catégorie
 * - defaultOpen: Si l'accordéon est ouvert par défaut (optionnel)
 *
 * 🎨 FONCTIONNALITÉS :
 * - Clic sur le titre pour ouvrir/fermer
 * - Icône chevron qui tourne selon l'état (ouvert/fermé)
 * - Compteur d'interventions affiché dans le titre
 * - Animation fluide lors de l'ouverture/fermeture
 * - Utilise ServiceCard pour afficher chaque intervention
 *
 * 💡 AVANTAGES :
 * - Page moins chargée visuellement
 * - Navigation ciblée (l'utilisateur ouvre ce qui l'intéresse)
 * - Scalable : peut gérer 20+ catégories sans problème
 * ============================================================================
 */

"use client";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { ServiceCard } from "@/components";

interface Service {
  service: string;
  duree: number | string | null;
  description?: string;
  prix?: number | string | null;
}

interface CategoryAccordionProps {
  categorie: string;
  services: Service[];
  defaultOpen?: boolean;
}

export default function CategoryAccordion({
  categorie,
  services,
  defaultOpen = false,
}: CategoryAccordionProps) {
  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <section
          className={`bg-gray-800/30 rounded-xl overflow-hidden break-inside-avoid mb-6 transition-all duration-300 ${
            open
              ? "border-1 border-amber-500 shadow-lg shadow-amber-500/20"
              : "border border-gray-700"
          }`}
        >
          <Disclosure.Button className="cursor-pointer w-full flex items-start justify-between px-4 py-2 sm:py-3 bg-gray-800/50 text-amber-400 border-b border-gray-700 hover:bg-gray-800/70 transition-colors"
>
<h2 className="text-sm sm:text-lg font-bold text-left leading-tight">
  {categorie}
</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-normal">
                {services.length} intervention{services.length > 1 ? "s" : ""}
              </span>
              <ChevronDownIcon
                className={`w-5 h-5 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
          </Disclosure.Button>

          <Transition
            enter="transition duration-200 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-150 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0 "
          >
            <Disclosure.Panel className="p-3 space-y-2">
              {services.map((service) => {
                // Gérer l'affichage du prix : ajouter € seulement si c'est un nombre
                let prixAffiche = "Sur devis";
                if (service.prix !== null && service.prix !== undefined) {
                  prixAffiche =
                    typeof service.prix === "number"
                      ? `${service.prix}€`
                      : service.prix;
                }

                // Gérer l'affichage de la durée : "Sur devis" si null
                let dureeAffichee = service.duree;
                if (service.duree === null || service.duree === undefined) {
                  dureeAffichee = "Sur devis";
                }

                return (
                  <ServiceCard
                    key={service.service}
                    service={service.service}
                    duree={dureeAffichee}
                    description={service.description}
                    prix={prixAffiche}
                    showCheckbox={false}
                  />
                );
              })}
            </Disclosure.Panel>
          </Transition>
        </section>
      )}
    </Disclosure>
  );
}
