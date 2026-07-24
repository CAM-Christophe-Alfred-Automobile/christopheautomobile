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
    "Pour un kit de distribution, il est fortement recommandé de changer en même temps la pompe à eau et le galet tendeur — ils s'usent au même rythme et cela évite une seconde intervention proche.",
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
