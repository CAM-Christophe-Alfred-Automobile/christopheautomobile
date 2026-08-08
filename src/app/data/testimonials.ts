// Avis clients réels, repris de la fiche Google Business de Christophe (avis vérifiés Google).
// Ne pas inventer/modifier un avis : uniquement des textes réels, avec attribution.
// TODO: demander à Christophe la note globale + nombre total d'avis affichés en haut de sa
// fiche Google pour renseigner reviewCount ci-dessous (actuellement omis, pas de valeur confirmée).

export const aggregateRating = {
  ratingValue: 5,
  reviewCount: undefined as number | undefined,
  sourceLabel: "Avis Google",
  sourceUrl: "https://www.google.com/search?q=Christophe+AutoMobile+(CAM)&kgmid=/g/11mrhqnz4m",
};

export const testimonials = [
  {
    author: "Jaqel Hral",
    date: "2026-04-01",
    rating: 5,
    text: "Un service exceptionnel qui mérite bien plus que 5 étoiles. Christophe fait preuve d'un professionnalisme rare et d'une minutie exemplaire. Je suis plus que satisfait du résultat. Merci encore pour ce travail de précision.",
  },
  {
    author: "Julie B.",
    date: "2026-07-01",
    rating: 5,
    text: "Bonne prestation. Personne sérieuse & aimable. Je recommande ce Monsieur.",
  },
  {
    author: "Ianis Medjdoub",
    date: "2026-05-01",
    rating: 5,
    text: "Super garage au top, n'hésitez pas !!",
  },
  {
    author: "Alois Marignane",
    date: "2026-04-01",
    rating: 5,
    text: "Grand merci Christophe pour les échanges, la réactivité et le travail efficace.",
  },
  {
    author: "OLTX",
    date: "2026-02-01",
    rating: 5,
    text: "Personne très compétente et très professionnelle.",
  },
];
