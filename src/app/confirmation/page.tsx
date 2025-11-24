"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header, Footer, InfoModal } from "@/components";
import Link from "next/link";

//!. On force le rendu côté client car cette page dépend des paramètres de l'URL
export const dynamic = "force-dynamic";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const [bookingId, setBookingId] = useState<string | null>(null);

  //! On attend le montage client pour récupérer l'ID de réservation
  useEffect(() => {
    setBookingId(searchParams.get("booking"));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Carte principale compacte */}
        <div className="text-center max-w-2xl mx-auto bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-amber-600/30">
          {/* Icône horloge animée */}
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-2 border-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-600/30">
            <svg
              className="w-8 h-8 text-amber-400 animate-[spin_3s_linear_infinite]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="9" strokeWidth="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 7v5l3 3"
              />
            </svg>
          </div>

          {/* Titre */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Demande enregistrée !
          </h1>

          {/* Description */}
          <p className="text-gray-300 mb-6">
            Votre réservation est <span className="text-amber-400 font-semibold">en attente de confirmation</span> par Christophe.
          </p>

          {/* Référence */}
          {bookingId && (
            <div className="bg-gradient-to-r from-amber-900/25 via-orange-900/25 to-amber-900/25 border border-amber-500/50 rounded-lg p-4 mb-6 shadow-md">
              <p className="text-sm text-amber-300 mb-1">Référence</p>
              <p className="text-xl font-mono font-bold text-amber-400">
                {bookingId}
              </p>
            </div>
          )}

          {/* Info importante */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <p className="text-sm text-gray-400">Consultez les conditions d’intervention</p>
            <InfoModal />
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-orange-900 text-white font-semibold px-6 py-3 rounded-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-600/50"
            >
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/booking"
              className="inline-flex items-center justify-center bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-600 transition-all border border-gray-600"
            >
              Nouvelle demande
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
