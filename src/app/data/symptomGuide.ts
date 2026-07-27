// Questionnaire guidé pour les clients qui ne connaissent pas la mécanique.
// Chaque symptôme mène soit directement à une catégorie, soit à une sous-question.
// "services" (optionnel) restreint les prestations affichées à cette liste précise
// (par nom exact, tous catégorie confondues) plutôt que toute la catégorie —
// pour ne proposer que des choix vraiment pertinents au client novice.
// "nonPropose" (optionnel) : au lieu de prestations, affiche un message poli
// expliquant que cette intervention n'est pas proposée (ex: boîte auto, airbag).

export type SymptomKey =
  | "voyant"
  | "bruit"
  | "entretien"
  | "panne"
  | "fuite"
  | "moteurProbleme"
  | "trainRoulant"
  | "boite"
  | "lumiere"
  | "autre";

export type SubAnswer = {
  key: string;
  label: string;
  categorie?: string;
  explication?: string;
  services?: string[];
  nonPropose?: string;
  // Sous-sous-question (un seul niveau supplémentaire, ex: voyant -> type de voyant)
  subQuestion?: string;
  subAnswers?: SubAnswer[];
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

const MESSAGE_BOITE_AUTO =
  "Je n'interviens pas sur les boîtes de vitesses automatiques : ces réparations demandent un outillage et une expertise spécifiques que je ne propose pas actuellement. Je vous conseille de contacter un garage spécialisé en boîtes automatiques.";

const MESSAGE_AIRBAG =
  "Je n'interviens pas sur les airbags, pour des raisons de sécurité et de réglementation propres à cet équipement. Merci de contacter un professionnel agréé pour ce voyant précis.";

export const symptoms: Symptom[] = [
  {
    key: "voyant",
    emoji: "🔔",
    label: "Un voyant est allumé au tableau de bord",
    subQuestion: "Savez-vous quel voyant est allumé ?",
    subAnswers: [
      {
        key: "voyant-airbag",
        label: "Le voyant airbag",
        nonPropose: MESSAGE_AIRBAG,
      },
      {
        key: "voyant-autre",
        label: "Un autre voyant / je ne sais pas lequel",
        categorie: "Diagnostic",
        explication:
          "Un voyant allumé nécessite un diagnostic pour identifier précisément la cause avant toute réparation.",
        services: DIAGNOSTIC_GENERIQUE,
      },
    ],
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
          "Aucun bruit du tout évoque souvent une batterie à plat, des contacts encrassés, ou un fusible/relais hors service.",
        services: ["Batterie", "Relais / fusible / faisceau", "Inspection / contrôle panne"],
      },
      {
        key: "clic",
        label: "Non, mais j'entends un clic",
        categorie: "Électricité",
        explication:
          "Un clic signale souvent que le démarreur reçoit du courant mais que lui-même ou la batterie manque de puissance.",
        services: ["Démarreur", "Batterie", "Inspection / contrôle panne"],
      },
      {
        key: "faible",
        label: "Oui, il tourne mais faiblement / lentement",
        categorie: "Électricité",
        explication: "Un démarreur qui tourne lentement indique presque toujours une batterie faible.",
        services: ["Batterie", "Inspection / contrôle panne"],
      },
      {
        key: "tourne",
        label: "Oui, il tourne normalement mais le moteur ne démarre pas",
        subQuestion: "Y a-t-il de l'essence dans le réservoir ?",
        subAnswers: [
          {
            key: "pas-essence",
            label: "Non / je ne suis pas sûr",
            explication:
              "Il n'y a peut-être simplement plus de carburant — vérifiez le niveau réel (pas seulement la jauge) avant de réserver une intervention.",
          },
          {
            key: "avec-essence",
            label: "Oui, il y a de l'essence",
            categorie: "Diagnostic",
            explication:
              "Le moteur tourne et a du carburant mais ne démarre pas : un diagnostic est nécessaire pour identifier la cause précise.",
            services: DIAGNOSTIC_GENERIQUE,
          },
        ],
      },
    ],
  },
  {
    key: "fuite",
    emoji: "💧",
    label: "Une fuite sous la voiture ou dans le moteur",
    subQuestion: "De quelle couleur est le liquide qui coule ?",
    subAnswers: [
      {
        key: "fuite-huile",
        label: "Noir ou marron, huileux",
        categorie: "Moteur",
        explication: "Une fuite huileuse noire ou marron vient souvent d'un joint moteur usé.",
        services: ["Couvre culasse", "Carter huile moteur", "Inspection / contrôle panne"],
      },
      {
        key: "fuite-refroidissement",
        label: "Vert, bleu ou rose, pas huileux",
        categorie: "Refroidissement",
        explication: "Un liquide coloré et fluide est généralement du liquide de refroidissement.",
        services: ["Durite / raccord / fuite", "Vase d'expansion", "Détection de fuite", "Radiateur moteur"],
      },
      {
        key: "fuite-autre",
        label: "Je ne sais pas / autre couleur",
        categorie: "Refroidissement",
        explication: "Un contrôle permettra d'identifier précisément l'origine de la fuite.",
        services: ["Détection de fuite", "Inspection / contrôle panne"],
      },
    ],
  },
  {
    key: "moteurProbleme",
    emoji: "🔧",
    label: "Un problème avec le moteur",
    subQuestion: "Que remarquez-vous exactement ?",
    subAnswers: [
      {
        key: "chauffe",
        label: "Il chauffe, la température monte",
        categorie: "Refroidissement",
        explication:
          "Une surchauffe moteur vient souvent d'une fuite de liquide de refroidissement, d'un ventilateur ou d'un thermostat défaillant.",
        services: ["Détection de fuite", "Vase d'expansion", "Sonde température / LDR", "Ventilateur moteur"],
      },
      {
        key: "fume",
        label: "Il fume",
        categorie: "Moteur",
        explication: "De la fumée peut venir du turbo, de l'EGR/FAP, ou d'une fuite d'huile interne.",
        services: ["Turbo", "EGR / FAP", "Inspection / contrôle panne"],
      },
      {
        key: "vibration",
        label: "Un peu de vibration",
        categorie: "Moteur",
        explication:
          "Une vibration légère évoque souvent des bougies usées, une courroie, ou un support moteur fatigué.",
        services: ["Bougies d'allumage", "Courroie accessoire", "Support moteur/boite/pont"],
      },
      {
        key: "puissance",
        label: "Il manque de puissance ou a des à-coups",
        categorie: "Moteur",
        explication: "Une perte de puissance vient souvent des bougies, du filtre à gasoil, ou de l'EGR/FAP.",
        services: ["Bougies d'allumage", "Filtre gasoil", "EGR / FAP", "Diagnostic valise complet"],
      },
      {
        key: "moteur-autre",
        label: "Autre / je ne sais pas",
        categorie: "Diagnostic",
        explication: "Un diagnostic permettra d'identifier précisément la cause.",
        services: DIAGNOSTIC_GENERIQUE,
      },
    ],
  },
  {
    key: "trainRoulant",
    emoji: "🚙",
    label: "La voiture tire, vibre ou se comporte bizarrement",
    subQuestion: "Que ressentez-vous ?",
    subAnswers: [
      {
        key: "tire",
        label: "La voiture tire d'un côté",
        categorie: "Suspension / Direction",
        explication:
          "Une voiture qui tire d'un côté évoque souvent une rotule ou une biellette de direction usée.",
        services: [
          "Rotules de direction (paire)",
          "Biellettes de barre stabilisatrice (paire)",
          "Détection bruit de suspension / direction",
        ],
      },
      {
        key: "vibre-volant",
        label: "Ça vibre au volant ou dans la voiture",
        categorie: "Suspension / Direction",
        explication: "Des vibrations viennent souvent des amortisseurs ou des silent-blocs usés.",
        services: [
          "Amortisseurs (paire)",
          "Silent blocs train AV / AR",
          "Détection bruit de suspension / direction",
        ],
      },
      {
        key: "vibre-freinage",
        label: "Ça vibre ou tire surtout en freinant",
        categorie: "Freinage",
        explication: "Une vibration au freinage évoque souvent des disques voilés ou un étrier grippé.",
        services: ["Disques + plaquettes", "Étrier de frein", "Détection panne de freinage /bruit"],
      },
      {
        key: "train-autre",
        label: "Je ne sais pas trop",
        categorie: "Suspension / Direction",
        explication: "Un contrôle général permettra d'identifier l'origine exacte.",
        services: ["Détection bruit de suspension / direction"],
      },
    ],
  },
  {
    key: "boite",
    emoji: "⚙️",
    label: "Difficulté à passer les vitesses ou bruit côté boîte",
    subQuestion: "Votre boîte de vitesses est-elle manuelle ou automatique ?",
    subAnswers: [
      {
        key: "boite-manuelle",
        label: "Manuelle",
        categorie: "Transmission",
        explication:
          "Des difficultés pour passer les vitesses ou un bruit à l'accélération évoquent souvent l'embrayage, la boîte, ou un support moteur.",
        services: ["Embrayage complet", "Boîte de vitesses", "Support moteur/boite/pont"],
      },
      {
        key: "boite-auto",
        label: "Automatique",
        nonPropose: MESSAGE_BOITE_AUTO,
      },
      {
        key: "boite-sais-pas",
        label: "Je ne sais pas",
        categorie: "Transmission",
        explication: "Un contrôle permettra d'identifier le type de boîte et la cause du problème.",
        services: ["Embrayage complet", "Boîte de vitesses", "Support moteur/boite/pont"],
      },
    ],
  },
  {
    key: "lumiere",
    emoji: "💡",
    label: "Une lumière ne fonctionne pas (phare, feu...)",
    categorie: "Électricité",
    explication:
      "Le plus souvent, il s'agit simplement d'une ampoule à remplacer, parfois du phare ou du feu complet. Pour un feu stop qui ne s'allume pas, ce peut aussi être le contacteur de frein.",
    services: ["Ampoule", "Phare (unité)", "Feu arrière (unité)", "Contacteur de stop / frein"],
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
