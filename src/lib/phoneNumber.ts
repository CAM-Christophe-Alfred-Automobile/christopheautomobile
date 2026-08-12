// Cal.com exige un numéro de téléphone au format international (E.164, ex: +33612345678)
// pour créer une réservation via son API. Beaucoup de clients tapent leur numéro au format
// français habituel (06 12 34 56 78) sans savoir qu'il faut ajouter +33 devant, ce qui faisait
// échouer la réservation. Cette fonction convertit automatiquement le format français courant.
export function toE164French(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  const trimmed = phone.trim().replace(/[\s.\-()]/g, "");
  if (!trimmed) return undefined;
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("0033")) return `+${trimmed.slice(2)}`;
  if (trimmed.startsWith("33") && trimmed.length === 11) return `+${trimmed}`;
  if (trimmed.startsWith("0") && trimmed.length === 10) return `+33${trimmed.slice(1)}`;
  // Format non reconnu (numéro étranger sans indicatif, etc.) : laissé tel quel, Cal.com
  // renverra une erreur explicite plutôt qu'un format silencieusement faux.
  return trimmed;
}
