"use client";

import Link from "next/link";
import Image from "next/image";
import { Header, Footer } from "@/components";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Image 404 avec animation */}
          <div className="relative mb-4 animate-[fadeIn_0.6s_ease-out]">
            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full"></div>
            <Image
              src="/images/404/404.webp"
              alt="Page 404"
              width={600}
              height={600}
              className="mx-auto relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-300 w-[200px] sm:w-[300px] rounded-2xl"
              style={{ width: '200px', height: 'auto' }}
              priority
            />
          </div>

          {/* Titre avec gradient */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent mb-3 animate-[fadeIn_0.8s_ease-out]">
            Oups ! Page introuvable
          </h1>

          {/* Message */}
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-2 animate-[fadeIn_1s_ease-out]">
            il semble que cette page soit tombée en panne.
          </p>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto mb-6 animate-[fadeIn_1.2s_ease-out]">
            Notre mécanicien s&#39;en charge !
          </p>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-[fadeIn_1.4s_ease-out]">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold px-6 py-3 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-amber-600/50 hover:scale-105"
            >
              <svg
                className="w-5 h-5 group-hover:rotate-12 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Retour à l&#39;accueil
            </Link>

          
          </div>

          {/* Suggestions de navigation */}
          <div className="mt-6 pt-6 border-t border-gray-700/50 animate-[fadeIn_1.6s_ease-out]">
            <p className="text-sm text-gray-400 mb-3">
              Vous cherchez peut-être :
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/booking"
                className="px-3 py-1.5 text-sm bg-gray-800/60 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all border border-gray-700 hover:border-amber-600"
              >
                📅 Réserver
              </Link>
              <Link
                href="/tarifs"
                className="px-3 py-1.5 text-sm bg-gray-800/60 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all border border-gray-700 hover:border-amber-600"
              >
                💰 Tarifs
              </Link>
              <Link
                href="/contact"
                className="px-3 py-1.5 text-sm bg-gray-800/60 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all border border-gray-700 hover:border-amber-600"
              >
                📞 Contact
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
