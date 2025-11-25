/**
 * ============================================================================
 * 📄 COMPOSANT : WhatsappFloat
 * ============================================================================
 * Bouton flottant WhatsApp fixe en bas à droite
 * 
 * 🎯 OBJECTIF :
 * - Permettre un contact rapide via WhatsApp depuis n'importe quelle page
 * - Toujours visible et accessible (position fixe)
 * - Tooltip informatif au survol
 * 
 * 📍 UTILISÉ DANS :
 * - Toutes les pages du site (via layout ou inclusion globale)
 * 
 * 🎨 FONCTIONNALITÉS :
 * - Bouton rond vert avec icône WhatsApp
 * - Animation au survol (scale + shadow)
 * - Tooltip "Contactez-moi sur WhatsApp"
 * - Ouvre WhatsApp avec message pré-rempli
 * 
 * 💡 AVANTAGES :
 * - Contact instantané disponible partout
 * - Discret mais toujours accessible
 * - UX optimale pour la conversion
 * ============================================================================
 */

"use client";
import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function WhatsAppFloatingButton() {
  const whatsappLink = `https://wa.me/${siteConfig.whatsapp.number}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
      {/* 🟢 Bouton WhatsApp */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter via WhatsApp"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/30 transition-all duration-300 hover:scale-110"
      >
        <MessageCircle className="w-7 h-7 transition-transform duration-300 hover:rotate-12" />
      </a>

      {/* 💬 Texte sous le bouton */}
      <div className="bg-neutral-900/90 text-green-500 text-sm font-medium px-6 py-1.5 rounded-lg shadow-md border border-green-500/30 backdrop-blur-md text-center hidden sm:block">
        Une question ?<br /> Contactez-moi<br />sur WhatsApp
      </div>
    </div>
  );
}
