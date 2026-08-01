// Connexion bancaire directe (Enable Banking / PSD2) pour la section Finance — module
// optionnel, contrairement aux secrets requis dans src/config/admin.ts, donc pas de throw
// au chargement : assertEnableBankingConfigured() est appelée au point d'usage.
export const ENABLEBANKING_APP_ID = process.env.ENABLEBANKING_APP_ID;
export const ENABLEBANKING_PRIVATE_KEY_BASE64 = process.env.ENABLEBANKING_PRIVATE_KEY_BASE64;
export const ENABLEBANKING_REDIRECT_URI = process.env.ENABLEBANKING_REDIRECT_URI;

export function assertEnableBankingConfigured(): void {
  if (!ENABLEBANKING_APP_ID || !ENABLEBANKING_PRIVATE_KEY_BASE64 || !ENABLEBANKING_REDIRECT_URI) {
    throw new Error(
      "Enable Banking n'est pas configuré (ENABLEBANKING_APP_ID / ENABLEBANKING_PRIVATE_KEY_BASE64 / ENABLEBANKING_REDIRECT_URI manquants dans .env)"
    );
  }
}

// Secret dédié à la signature des jetons courts utilisés pendant le flux de connexion
// bancaire (état OAuth, mapping multi-comptes) — distinct de ADMIN_SESSION_SECRET pour ne
// pas mélanger la session admin avec ce mécanisme ponctuel.
export const FINANCE_BANK_STATE_SECRET = process.env.FINANCE_BANK_STATE_SECRET;

export function assertBankStateSecretConfigured(): void {
  if (!FINANCE_BANK_STATE_SECRET) {
    throw new Error("FINANCE_BANK_STATE_SECRET n'est pas défini dans .env");
  }
}
