// Conseils génériques sur les pièces à acheter, par catégorie de service.
// Le client achète lui-même ses pièces : ces conseils l'aident à acheter juste.

export const partsGuidance: Record<string, string> = {
  Entretien:
    "Pensez à prendre l'huile moteur à la bonne norme (indiquée dans le carnet d'entretien) et un filtre à huile adapté à votre modèle exact.",
  Freinage:
    "Changez toujours les plaquettes ET les disques par paire (les deux côtés d'un même essieu), jamais un seul côté. Préférez une marque reconnue (Bosch, Brembo, TRW...) plutôt qu'une pièce premier prix.",
  Moteur:
    "Pour une réparation moteur, vérifiez bien la référence exacte à votre motorisation (le même modèle peut avoir plusieurs moteurs différents).",
  Refroidissement:
    "Utilisez impérativement le type de liquide de refroidissement préconisé par le constructeur (les liquides ne sont pas tous compatibles entre eux).",
  "Suspension / Direction":
    "Pour les amortisseurs, changez-les toujours par paire (les deux côtés d'un même essieu) pour un comportement équilibré du véhicule.",
  Transmission:
    "Pour l'embrayage ou la boîte, vérifiez bien la référence exacte à votre motorisation et à la version du véhicule (le kit peut varier même sur un modèle identique).",
  Électricité:
    "Pour une batterie, vérifiez bien l'ampérage et les dimensions compatibles avec votre véhicule (indiqués sur l'ancienne batterie).",
  Diagnostic:
    "Aucune pièce à acheter à l'avance pour un diagnostic — on identifie d'abord la panne ensemble.",
  Climatisation:
    "Vérifiez la référence exacte du composant (compresseur, condenseur...) car elle varie selon la motorisation, même pour un même modèle.",
  "Autre interventions":
    "N'hésitez pas à me contacter avant d'acheter une pièce si vous avez un doute sur la référence.",
};

export const defaultPartsGuidance =
  "N'hésitez pas à me contacter avant d'acheter une pièce si vous avez un doute sur la référence exacte.";

// Conseils précis par prestation (nom exact du service). Prioritaires sur le conseil de catégorie
// ci-dessus dès qu'une prestation précise est sélectionnée.
export const partsGuidanceByService: Record<string, string> = {
  // Transmission
  "Support moteur/boite/pont":
    "Vérifiez le côté exact (moteur, boîte ou pont) et la position, car la référence diffère selon l'emplacement sur le véhicule.",
  "Embrayage complet":
    "Prenez un kit complet (disque + mécanisme + butée) de la bonne référence motorisation, jamais une pièce seule.",
  "Volant bi-masse + embrayage":
    "Le volant bi-masse et l'embrayage s'usent ensemble : remplacez toujours les deux en même temps, jamais un seul.",
  "Boîte de vitesses":
    "Une boîte de vitesses se change généralement en échange standard (reconditionnée) — contactez-moi avant d'acheter pour confirmer la bonne référence.",
  "Cardan (1 côté)":
    "Précisez le côté (gauche/droit) et si le véhicule est avant ou 4 roues motrices pour la bonne référence.",

  // Freinage
  "Plaquettes (essieu)":
    "Changez les plaquettes par paire (les deux côtés du même essieu), avec une marque reconnue (Bosch, Brembo, TRW...).",
  "Disques + plaquettes":
    "Disques et plaquettes se changent ensemble et par paire (les deux côtés du même essieu) pour un freinage équilibré.",
  "Étrier de frein":
    "Vérifiez le côté exact (avant/arrière, gauche/droite) — la référence diffère selon la position.",

  // Suspension / Direction
  "Amortisseurs (paire)":
    "Changez toujours les amortisseurs par paire (les deux côtés du même essieu) pour un comportement équilibré.",
  "Rotules de direction (paire)":
    "Précisez avant/arrière et le côté si demandé — mieux vaut les changer par paire pour une usure homogène.",
  "Biellettes de barre stabilisatrice (paire)":
    "Changez-les par paire pour une tenue de route homogène, même si un seul côté semble usé.",

  // Moteur
  "Courroie distribution + pompe à eau":
    "Prenez un kit complet incluant la pompe à eau et le galet tendeur — ils s'usent au même rythme, ça évite une seconde intervention proche.",
  "Courroie accessoire":
    "Vérifiez si le galet tendeur doit être changé en même temps (souvent recommandé au-delà d'un certain kilométrage).",
  Turbo:
    "Un turbo se change souvent en échange standard — contactez-moi avant d'acheter pour confirmer la référence exacte.",
  "EGR / FAP":
    "Précisez si vous voulez un nettoyage ou un remplacement : la pièce et le prix ne sont pas les mêmes.",
  "Bougies d'allumage":
    "Prenez le jeu complet (3 ou 4 selon le moteur), jamais une seule bougie, et respectez l'écartement préconisé.",
  "Couvre culasse":
    "Le joint de couvre-culasse est souvent vendu avec le couvre-culasse neuf — vérifiez qu'il est inclus.",
  "Carter huile moteur":
    "Précisez si le joint de carter est inclus avec la pièce, sinon il faudra le commander séparément.",

  // Refroidissement
  "Durite / raccord / fuite":
    "Prenez une photo de la durite endommagée avant d'acheter : la forme et le diamètre varient beaucoup selon le modèle.",
  "Détection de fuite":
    "Aucune pièce à acheter à l'avance — on identifie d'abord précisément l'origine de la fuite ensemble.",
  "Radiateur moteur":
    "Vérifiez la compatibilité avec ou sans climatisation/boîte automatique, cela change parfois la référence du radiateur.",
  "Sonde température / LDR":
    "Une sonde de température coûte peu cher : préférez toujours une marque reconnue plutôt qu'un premier prix.",
  "Ventilateur moteur":
    "Précisez si le groupe moto-ventilateur complet est nécessaire ou seulement le moteur du ventilateur.",

  // Électricité
  Batterie:
    "Vérifiez bien l'ampérage et les dimensions compatibles avec votre véhicule (indiqués sur l'ancienne batterie).",
  Alternateur:
    "Un alternateur se change souvent en échange standard — contactez-moi avant d'acheter pour confirmer la référence.",
  Démarreur:
    "Un démarreur se change souvent en échange standard — contactez-moi avant d'acheter pour confirmer la référence.",
  "Relais / fusible / faisceau":
    "Aucune pièce à acheter à l'avance — on identifie d'abord précisément l'élément en cause ensemble.",
  Ampoule:
    "Vérifiez la référence exacte (H7, H4, LED...) dans le manuel du véhicule, elle diffère souvent entre feux de croisement et route.",
  "Phare (unité)":
    "Précisez le côté (gauche/droit) et la version du véhicule (avec ou sans LED/xénon) pour la bonne référence.",
  "Feu arrière (unité)":
    "Précisez le côté (gauche/droit) — la référence diffère souvent entre les deux.",

  // Entretien (spécifique)
  "Filtre gasoil":
    "Vérifiez la référence exacte à votre motorisation : certains modèles ont plusieurs filtres possibles selon l'année.",
};
