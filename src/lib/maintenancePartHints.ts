// Pièces génériquement nécessaires par type d'entretien, utilisées pour générer
// des liens de recherche fournisseur (pas de références exactes : celles-ci
// dépendent du véhicule précis et sont trouvées via la recherche fournisseur).
export const MAINTENANCE_PART_HINTS: Record<string, string[]> = {
  vidange: ["Huile moteur", "Filtre à huile", "Filtre à air", "Filtre habitacle", "Bouchon de vidange"],
  courroie_distribution: ["Kit distribution", "Pompe à eau", "Galet tendeur", "Galet enrouleur"],
  revision_complete: [
    "Huile moteur",
    "Filtre à huile",
    "Filtre à air",
    "Filtre habitacle",
    "Filtre à carburant",
    "Bougies d'allumage",
  ],
  plaquette_frein_av: ["Plaquettes de frein avant", "Liquide de frein"],
  plaquette_frein_ar: ["Plaquettes ou garnitures de frein arrière", "Liquide de frein"],
  disque_frein_av: ["Disques de frein avant", "Plaquettes de frein avant"],
  disque_frein_ar: ["Disques ou tambours de frein arrière", "Plaquettes ou garnitures arrière"],
  amortisseur_av: ["Amortisseurs avant", "Kit de montage amortisseur avant"],
  amortisseur_ar: ["Amortisseurs arrière", "Kit de montage amortisseur arrière"],
  courroie_accessoire: ["Courroie accessoire", "Galet tendeur accessoire"],
  embrayage: ["Kit embrayage", "Volant moteur"],
  liquide_frein: ["Liquide de frein"],
  liquide_refroidissement: ["Liquide de refroidissement"],
};

export function buildSupplierSearchUrl(partTerm: string, vehicleMake?: string | null, vehicleModel?: string | null) {
  const keyword = [partTerm, vehicleMake, vehicleModel].filter(Boolean).join(" ");
  return `https://www.auto-doc.fr/search?keyword=${encodeURIComponent(keyword)}`;
}
