// Questionnaire guidé pour les clients qui ne connaissent pas la mécanique.
// Chaque symptôme mène soit directement à une catégorie, soit à une sous-question.
// "services" (optionnel) restreint les prestations affichées à cette liste précise
// (par nom exact, tous catégorie confondues) plutôt que toute la catégorie —
// pour ne proposer que des choix vraiment pertinents au client novice.

export type SymptomKey =
  | "voyant"
  | "bruit"
  | "entretien"
  | "panne"
  | "autre";

export type SubAnswer = {
  key: string;
  label: string;
  categorie: string;
  explication: string;
  services?: string[];
};

export type Symptom = {
  key: SymptomKey;
  emoji: string;
  label: string;
  // Si categorie est défini, on saute la sous-question.
  categorie?: string;
  explication?: string;
  services?: string[];
  subQuestion?: string;
  subAnswers?: SubAnswer[];
};

// Prestations "diagnostic" réutilisées comme option de secours ("venir voir le problème")
const DIAGNOSTIC_GENERIQUE = ["Diagnostic valise complet", "Inspection / contrôle panne"];

export const symptoms: Symptom[] = [
  {
    key: "voyant",
    emoji: "🔔",
    label: "Un voyant est allumé au tableau de bord",
    categorie: "Diagnostic",
    explication:
      "Un voyant allumé nécessite un diagnostic pour identifier précisément la cause avant toute réparation.",
    services: DIAGNOSTIC_GENERIQUE,
  },
  {
    key: "bruit",
    emoji: "🔊",
    label: "Un bruit anormal",
    subQuestion: "D'où semble venir le bruit ?",
    subAnswers: [
      {
        key: "freinage",
        label: "En freinant (grincement, frottement)",
        categorie: "Freinage",
        explication:
          "Un bruit au freinage évoque souvent des plaquettes ou disques usés.",
        services: ["Détection panne de freinage /bruit", "Plaquettes (essieu)", "Disques + plaquettes"],
      },
      {
        key: "moteur",
        label: "Sous le capot, au moteur",
        categorie: "Moteur",
        explication: "Un bruit moteur peut avoir plusieurs origines — un contrôle est recommandé.",
        services: [
          "Problème moteur / Bruit provenant du moteur",
          "Courroie accessoire",
          "Courroie distribution + pompe à eau",
        ],
      },
      {
        key: "direction",
        label: "En tournant le volant ou sur les bosses",
        categorie: "Suspension / Direction",
        explication:
          "Ce type de bruit est souvent lié à la suspension ou à la direction.",
        services: [
          "Détection bruit de suspension / direction",
          "Amortisseurs (paire)",
          "Biellettes de barre stabilisatrice (paire)",
        ],
      },
      {
        key: "autre-bruit",
        label: "Je ne sais pas trop",
        categorie: "Diagnostic",
        explication: "Un contrôle général permettra d'identifier l'origine du bruit.",
        services: DIAGNOSTIC_GENERIQUE,
      },
    ],
  },
  {
    key: "entretien",
    emoji: "🛠️",
    label: "Entretien régulier (vidange, révision...)",
    categorie: "Entretien",
    explication: "Voici les prestations d'entretien courantes.",
  },
  {
    key: "panne",
    emoji: "🚗",
    label: "La voiture ne démarre pas / a une panne",
    subQuestion: "Que se passe-t-il quand vous tournez la clé ?",
    subAnswers: [
      {
        key: "rien",
        label: "Rien ne se passe, aucun bruit",
        categorie: "Électricité",
        explication:
          "C'est souvent un problème de batterie ou de démarreur.",
        services: [
          "Batterie",
          "Alternateur",
          "Démarreur",
          "Relais / fusible / faisceau",
          "Inspection / contrôle panne",
        ],
      },
      {
        key: "tourne",
        label: "Le moteur tourne mais ne démarre pas",
        categorie: "Diagnostic",
        explication: "Un diagnostic est nécessaire pour identifier la panne.",
        services: DIAGNOSTIC_GENERIQUE,
      },
    ],
  },
  {
    key: "autre",
    emoji: "❓",
    label: "Autre / je ne sais pas décrire",
    categorie: "Diagnostic",
    explication:
      "Un contrôle général permettra d'identifier précisément ce dont votre véhicule a besoin.",
    services: DIAGNOSTIC_GENERIQUE,
  },
];
