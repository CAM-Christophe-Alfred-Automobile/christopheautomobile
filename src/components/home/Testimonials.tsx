// Avis clients réels (voir src/app/data/testimonials.ts pour la source et l'attribution).
// Utilisé sur la page d'accueil (particuliers) et /professionnels, pour renforcer la
// crédibilité avant l'appel à l'action de réservation.

import { testimonials, aggregateRating } from "@/app/data/testimonials";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < rating ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

interface TestimonialsProps {
  // "section" (par défaut) : bloc pleine largeur, pour la page d'accueil.
  // "card" : contenu seul, sans habillage de section, pour l'intégrer dans une carte existante.
  variant?: "section" | "card";
}

export default function Testimonials({ variant = "section" }: TestimonialsProps) {
  const content = (
    <>
      <div className="text-center mb-8">
        <h2 id="avis-clients-heading" className="text-3xl font-bold text-white mb-2">
          Ce que disent mes clients
        </h2>
        <div className="flex items-center justify-center gap-2 text-gray-300 flex-wrap">
          <Stars rating={Math.round(aggregateRating.ratingValue)} />
          <span className="font-semibold text-white">{aggregateRating.ratingValue}/5</span>
          <span className="text-sm">
            basé sur {aggregateRating.reviewCount} avis vérifiés (
            <a
              href={aggregateRating.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline hover:text-amber-400"
            >
              {aggregateRating.sourceLabel}
            </a>
            )
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.map((t) => (
          <figure
            key={`${t.author}-${t.date}`}
            className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col"
          >
            <Stars rating={t.rating} />
            <blockquote className="text-gray-200 text-sm leading-relaxed mt-3 flex-1">
              &laquo; {t.text} &raquo;
            </blockquote>
            <figcaption className="text-xs text-gray-400 mt-4">
              {t.author} — {formatDate(t.date)}
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );

  if (variant === "card") {
    return (
      <section aria-labelledby="avis-clients-heading">
        {content}
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gray-900" aria-labelledby="avis-clients-heading">
      <div className="max-w-5xl mx-auto">{content}</div>
    </section>
  );
}
