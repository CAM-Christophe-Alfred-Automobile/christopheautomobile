// -----------------------------------------------------------------------------
// Fichier : src/components/index.ts
// -----------------------------------------------------------------------------
// 🎯 Objectif : centraliser les exports des composants communs de l’application.
//
// ⚠️ IMPORTANT :
// Le composant `MapZone` (Leaflet) n’est **pas exporté ici** volontairement,
// car Leaflet dépend de l’objet `window` et ne fonctionne qu’au **rendu client**.
//
// Si `MapZone` était exporté depuis ce fichier, il serait importé
// automatiquement côté serveur par Next.js (SSR), ce qui provoquerait
// l’erreur : "ReferenceError: window is not defined".
//
// 👉 Pour utiliser `MapZone`, il faut l’importer uniquement dans un composant
// client avec un import dynamique :
//
//     import dynamic from "next/dynamic";
//     const MapZone = dynamic(() => import("@/components/MapZone"), { ssr: false });
//
// -----------------------------------------------------------------------------

export { default as AutodocModal } from "./modals/autodocModal";
export { default as Footer } from "./layout/Footer";
export { default as Header } from "./layout/Header";
export { default as CategoryAccordion } from "./categories/CategoryAccordion";
export { default as ContactForm } from "./forms/ContactForm";
export { default as InfoModal } from "./modals/InfoModal";
export { default as ConceptBanner } from "./ui/ConceptBanner";
export { default as NeonCAM } from "./ui/NeonCAM";
export { default as Whatsapp } from "./whatsapp/Whatsapp";
export { default as WhatsappFloat } from "./whatsapp/WhatsappFloat";


export { default as ServiceCard } from "./services/ServiceCard";
export { default as SearchField } from "./search/SearchField";




// 🚫 Ne pas exporter `MapZone` ici (voir explication ci-dessus)
