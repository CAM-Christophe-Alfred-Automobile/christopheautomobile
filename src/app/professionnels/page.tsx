/**
 * Page /professionnels
 *
 * Cible les garages et entreprises qui ont besoin d'un mécanicien
 * indépendant en renfort (surcroît d'activité, remplacement temporaire).
 *
 * Contact uniquement par WhatsApp/téléphone : chaque mission se discute
 * au cas par cas (durée, tarif, dispo), pas de réservation en ligne via Cal.com.
 */

import type { Metadata } from "next";
import { Header, Footer } from "@/components";
import Whatsapp from "@/components/whatsapp/Whatsapp";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Mécanicien indépendant en renfort pour garages | CAM",
  description:
    "Besoin d'un mécanicien indépendant en renfort ponctuel ? Sous-traitance pour garages et professionnels, statut RQTH. Devis rapide par WhatsApp.",
};

export default function ProfessionnelsPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 p-8 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4">
              Renfort mécanique pour garages et professionnels
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Mécanicien indépendant, je propose mes services en sous-traitance
              aux garages et entreprises qui ont besoin d&apos;un renfort
              ponctuel : pic d&apos;activité, remplacement, dépannage.
            </p>
          </div>

          {/* Tarifs */}
          <section className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">Tarifs</h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-4 border-b border-gray-700">
                <div>
                  <p className="font-semibold text-white">Urgence</p>
                  <p className="text-sm text-gray-400">
                    Sous réserve de disponibilité dans mon agenda
                  </p>
                </div>
                <p className="text-xl font-bold text-blue-400">35 €/h</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <p className="font-semibold text-white">Renfort planifié</p>
                  <p className="text-sm text-gray-400">
                    Minimum 1 journée complète, 9h00 - 17h30
                  </p>
                </div>
                <p className="text-xl font-bold text-blue-400">28 €/h</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">
              Tarifs main d&apos;œuvre, hors pièces et frais de déplacement.
              Devis établi selon la mission.
            </p>
          </section>

          {/* RQTH */}
          <section className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              Statut RQTH
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Je suis reconnu travailleur handicapé (RQTH). Faire appel à mes
              services en sous-traitance peut être valorisé par votre
              entreprise dans le cadre de son obligation d&apos;emploi de
              travailleurs handicapés (OETH).
            </p>
            <p className="text-sm text-gray-500 mt-2 italic">
              Modalités précises à vérifier avec votre service RH ou votre
              expert-comptable selon votre situation.
            </p>
          </section>

          {/* Contact */}
          <section className="text-center">
            <p className="text-gray-300 mb-4">
              Chaque mission se discute au cas par cas (durée, planning,
              tarif). Contactez-moi directement pour en parler.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Whatsapp
                message="Bonjour Christophe, je suis un professionnel (garage/entreprise) et j'aimerais discuter d'un renfort mécanique."
                label="Écrire sur WhatsApp"
                size="lg"
              />
              <a
                href={`tel:${siteConfig.phone}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg rounded-lg font-semibold text-white bg-gray-700 hover:bg-gray-600 transition shadow-md"
              >
                📞 {siteConfig.phone}
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
