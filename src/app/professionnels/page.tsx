/**
 * Page /professionnels
 *
 * Cible les garages et entreprises qui ont besoin d'un mécanicien
 * indépendant en renfort (surcroît d'activité, remplacement temporaire).
 *
 * Réservation directe dans l'agenda (via des types d'événements Cal.com dédiés,
 * sans secteur géographique ni catégorie de prestation) ou contact WhatsApp/téléphone.
 */

import type { Metadata } from "next";
import { Header, Footer } from "@/components";
import Whatsapp from "@/components/whatsapp/Whatsapp";
import ProBooking from "@/components/booking/ProBooking";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Mécanicien indépendant en renfort pour garages, concessions et centres auto | CAM",
  description:
    "Mécanicien indépendant, Bac Pro et 10+ ans d'expérience : renfort ponctuel pour concessions, garages, vendeurs de véhicules d'occasion et centres auto. Réservation directe ou devis rapide par WhatsApp.",
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
              aux concessions automobiles, garages, vendeurs de véhicules
              d&apos;occasion et centres auto qui ont besoin d&apos;un renfort
              ponctuel : pic d&apos;activité, remplacement, dépannage.
            </p>
          </div>

          {/* Qui je suis / Pourquoi me choisir */}
          <section className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
            <h2 className="text-2xl font-bold text-amber-400 mb-3">Qui je suis</h2>
            <p className="text-gray-300 leading-relaxed mb-5">
              Ancien militaire, titulaire d&apos;un Bac Pro en mécanique
              automobile et mécanicien passionné depuis toujours,
              j&apos;interviens en toute autonomie depuis plus de 10 ans, avec
              la rigueur acquise sous l&apos;uniforme. Mon camion-atelier est
              équipé comme un garage — outillage complet et valise de
              diagnostic — opérationnel dès mon arrivée.
            </p>

            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Compétences
            </h3>
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                "Entretien courant",
                "Freinage",
                "Moteur",
                "Transmission",
                "Suspension / Direction",
                "Électricité",
                "Climatisation",
                "Diagnostic",
              ].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full bg-gray-700 text-gray-200 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-5">
              Hors véhicules électriques. Climatisation : diagnostic et
              remplacement de composants — hors manipulation de gaz
              réfrigérant (non habilité).
            </p>

            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Pourquoi me choisir
            </h3>
            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-gray-300">
              <li>
                <span className="text-amber-400 font-semibold">Autonome</span> — je
                m&apos;intègre sans supervision constante
              </li>
              <li>
                <span className="text-amber-400 font-semibold">Polyvalent</span> — de
                l&apos;entretien courant aux pannes plus complexes
              </li>
              <li>
                <span className="text-amber-400 font-semibold">Équipé</span> —
                opérationnel immédiatement à mon arrivée
              </li>
              <li>
                <span className="text-amber-400 font-semibold">Rigoureux</span> —
                discipline et méthode acquises dans l&apos;armée
              </li>
            </ul>
          </section>

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
            <p className="text-xs text-gray-500 mt-2">
              Par ailleurs, je suis reconnu travailleur handicapé (RQTH) — un
              point à valoriser si votre entreprise est soumise à l&apos;OETH.
            </p>
          </section>

          {/* Réservation directe dans l'agenda */}
          <section id="reservation" className="mb-8 scroll-mt-24">
            <h2 className="text-2xl font-bold text-amber-400 mb-4 text-center">
              Voir mes disponibilités et réserver
            </h2>
            <ProBooking />
          </section>

          {/* Contact */}
          <section className="text-center">
            <p className="text-gray-300 mb-4">
              Vous préférez en discuter d&apos;abord ? Contactez-moi directement.
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
