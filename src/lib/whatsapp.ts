const GOOGLE_REVIEW_URL = "https://g.page/r/CeJDPhehOpCDEBM/review";

export function buildWhatsAppLink(phone: string, message: string): string {
  const clean = phone.replace(/[\s\-()]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function buildRelanceMessage(params: {
  firstName: string;
  vehicleLabel: string;
  maintenanceLabel: string;
  status: "overdue" | "soon";
  lastDoneDate: string | null;
}): string {
  const { firstName, vehicleLabel, maintenanceLabel, status, lastDoneDate } = params;
  const lastDoneText = lastDoneDate
    ? ` (dernier fait le ${new Date(lastDoneDate).toLocaleDateString("fr-FR")})`
    : "";

  if (status === "overdue") {
    return `Bonjour ${firstName}, ici CAM Christophe Auto-Mobile. L'échéance pour ${maintenanceLabel} sur votre ${vehicleLabel} est dépassée${lastDoneText}. On planifie une intervention prochainement ?`;
  }

  return `Bonjour ${firstName}, ici CAM Christophe Auto-Mobile. L'échéance pour ${maintenanceLabel} sur votre ${vehicleLabel} approche${lastDoneText}. Souhaitez-vous qu'on prenne rendez-vous ?`;
}

export function buildStartWorkMessage(params: { firstName: string; vehicleLabel: string }): string {
  const { firstName, vehicleLabel } = params;
  return `Bonjour ${firstName}, ici CAM Christophe Auto-Mobile. Je commence l'intervention sur votre ${vehicleLabel}. Je vous tiens informé(e) à la fin.`;
}

export function buildFinishWorkMessage(params: {
  firstName: string;
  vehicleLabel: string;
  description: string;
  price?: number | string | null;
  anomalies?: string | null;
  photos?: string[];
}): string {
  const { firstName, vehicleLabel, description, price, anomalies, photos } = params;
  const parts = [
    `Bonjour ${firstName}, ici CAM Christophe Auto-Mobile. L'intervention sur votre ${vehicleLabel} est terminée.`,
    description,
  ];
  if (anomalies) parts.push(`Points constatés / à prévoir :\n${anomalies}`);
  if (price != null && price !== "") {
    parts.push(`Prix indicatif : ${price}€ (à titre indicatif — le prix final sera confirmé par mes soins).`);
  }
  if (photos && photos.length > 0) {
    parts.push(`Photos de l'intervention :\n${photos.join("\n")}`);
  }
  parts.push(`Si vous êtes satisfait(e), un avis Google me ferait très plaisir 🙏 : ${GOOGLE_REVIEW_URL}`);
  return parts.join("\n\n");
}

export function buildPartsOrderMessage(params: {
  firstName: string;
  vehicleLabel: string;
  parts: { designation: string; link: string }[];
}): string {
  const { firstName, vehicleLabel, parts } = params;
  const lines = [
    `Bonjour ${firstName}, ici CAM Christophe Auto-Mobile. Voici ${parts.length > 1 ? "les pièces" : "la pièce"} à commander pour votre ${vehicleLabel} :`,
    ...parts.map((p) => `• ${p.designation} :\n${p.link}`),
    "Dites-moi quand vous l'avez reçue pour qu'on planifie l'intervention.",
  ];
  return lines.join("\n\n");
}

export function buildQuoteMessage(params: {
  firstName: string;
  vehicleLabel: string;
  description: string;
  partsNote?: string | null;
  estimatedPrice?: number | string | null;
}): string {
  const { firstName, vehicleLabel, description, partsNote, estimatedPrice } = params;
  const parts = [
    `Bonjour ${firstName}, ici CAM Christophe Auto-Mobile. Voici le devis pour votre ${vehicleLabel} :`,
    description,
  ];
  if (partsNote) parts.push(`Pièces prévues : ${partsNote}`);
  if (estimatedPrice != null && estimatedPrice !== "") parts.push(`Prix estimé : ${estimatedPrice}€`);
  parts.push("N'hésitez pas à me dire si vous souhaitez qu'on planifie ça.");
  return parts.join("\n\n");
}
