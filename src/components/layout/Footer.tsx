/**
 * ============================================================================
 * 📄 COMPOSANT : Footer
 * ============================================================================
 * Pied de page du site
 * 
 * 🎯 OBJECTIF :
 * - Afficher le logo, les mentions légales et le copyright
 * - Fournir une navigation secondaire en bas de page
 * - Design responsive (empilé sur mobile, horizontal sur desktop)
 * 
 * 📍 UTILISÉ DANS :
 * - Toutes les pages du site (/, /booking, /tarifs, /contact, etc.)
 * 
 * 🎨 FONCTIONNALITÉS :
 * - Logo cliquable qui ramène à l'accueil
 * - Lien vers les mentions légales
 * - Copyright avec année dynamique
 * - Layout responsive
 * 
 * 💡 AVANTAGES :
 * - Footer cohérent sur tout le site
 * - Informations légales accessibles
 * - Design épuré et professionnel
 * ============================================================================
 */

"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname(); //! Récupère le chemin actuel

  /**
   * Fonction helper pour vérifier si un lien est actif
   * Gère aussi le cas de la page d'accueil ("/")
   */
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };
  return (
    <footer className="bg-gray-800 shadow-lg border-t border-gray-400 py-2">
      <div className="max-w mx-auto px-4 sm:px-6 lg:px-8">
        {/* Flex responsive : colonne sur mobile, ligne sur desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-between">
          {/* Logo du site */}
          <div className="flex items-center mb-2 sm:mb-0">
            <Image
              src="/images/footer/CAM-blanc-reduit.webp"
              alt="CAM - Mécanique à domicile"
              width={120}
              height={80}
              className="h-10 w-auto"
              style={{ width: 'auto', height: '40px' }}
            /> 
          </div>

          {/* Liens légaux */}
          <div className="flex space-x-4 mb-2 sm:mb-0">
            <Link
              href="/mentions-legales"
              className="relative text-gray-200 hover:text-white transition-colors text-sm group"
            >
              Mentions légales
              {/* Ligne de soulignement animée */}
              <span
                className={`absolute left-0 bottom-0 h-px bg-amber-500 transition-all duration-300 ${
                  isActive("/mentions-legales")
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
          </div>

          {/* Copyright avec année dynamique */}
          <p className="text-gray-200 text-xs">
            © {new Date().getFullYear()} CAM{" "}
            {/* new Date().getFullYear() = année actuelle */}
          </p>
        </div>
      </div>
    </footer>
  );
}
