/**
 * ============================================================================
 * 📄 COMPOSANT : Header
 * ============================================================================
 * En-tête de navigation principal du site
 *
 * 🎯 OBJECTIF :
 * - Afficher le logo et le menu de navigation
 * - Menu burger responsive sur mobile
 * - Indiquer visuellement la page active
 *
 * 📍 UTILISÉ DANS :
 * - Toutes les pages du site (/, /booking, /tarifs, /contact, etc.)
 *
 * 🎨 FONCTIONNALITÉS :
 * - Logo cliquable qui ramène à l'accueil
 * - Menu desktop avec liens soulignés pour la page active
 * - Menu burger sur mobile avec animation
 * - Liens : Accueil, Réserver, Tarifs, Contact
 *
 * 💡 AVANTAGES :
 * - Navigation cohérente sur tout le site
 * - Responsive et accessible
 * - Feedback visuel clair de la page active
 * ============================================================================
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname(); //! Récupère le chemin actuel (ex: "/contact", "/booking")

  /**
   * Fonction helper pour vérifier si un lien est actif
   * Gère aussi le cas de la page d'accueil ("/")
   */
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-400">
      <div className="max-w mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          {/* LOGO - Cliquable, ramène à l'accueil */}
          <Link href="/" className="flex items-center">
            {/* Image du logo */}
            <Image
              src="/images/CAM-blanc-complet.webp"
              alt="Logo MécaniPro"
              width={70} //! largeur du logo
              height={70} //! hauteur du logo
              priority
            />
          </Link>

          {/* NAVIGATION DESKTOP */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="relative font-medium text-gray-100 py-2 transition-colors group"
            >
              Accueil
              {/* Ligne de soulignement animée */}
              <span
                className={`absolute left-0 bottom-2 h-px bg-amber-500 transition-all duration-300 ${
                  isActive("/") ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
            <Link
              href="/tarifs"
              className="relative font-medium text-gray-100 py-2 transition-colors group"
            >
              Tarifs
              {/* Ligne de soulignement animée */}
              <span
                className={`absolute left-0 bottom-2 h-px bg-amber-500 transition-all duration-300 ${
                  isActive("/tarifs") ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
            <Link
              href="/booking"
              className="relative font-medium text-gray-100 py-2 transition-colors group"
            >
              Réserver
              {/* Ligne de soulignement animée */}
              <span
                className={`absolute left-0 bottom-2 h-px bg-amber-500 transition-all duration-300 ${
                  isActive("/booking") ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
            <Link
              href="/contact"
              className="relative font-medium text-gray-100 py-2 transition-colors group"
            >
              Contact
              {/* Ligne de soulignement animée */}
              <span
                className={`absolute left-0 bottom-2 h-px bg-amber-500 transition-all duration-300 ${
                  isActive("/contact") ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
          </nav>

          {/* MENU BURGER MOBILE */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"} // ✅ label dynamique
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* MENU MOBILE */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium text-center text-gray-100 hover:text-white hover:bg-gray-700 ${
                  isActive("/") ? "bg-gray-700 text-white" : ""
                }`}
              >
                Accueil
              </Link>
              <Link
                href="/tarifs"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium text-center text-gray-100 hover:text-white hover:bg-gray-700 ${
                  isActive("/tarifs") ? "bg-gray-700 text-white" : ""
                }`}
              >
                Tarifs
              </Link>
              <Link
                href="/booking"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium text-center text-gray-100 hover:text-white hover:bg-gray-700 ${
                  isActive("/booking") ? "bg-gray-700 text-white" : ""
                }`}
              >
                Réserver
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium text-center text-gray-100 hover:text-white hover:bg-gray-700 ${
                  isActive("/contact") ? "bg-gray-700 text-white" : ""
                }`}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
