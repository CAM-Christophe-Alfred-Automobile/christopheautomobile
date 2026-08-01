"use server";

import { ENABLEBANKING_REDIRECT_URI, assertEnableBankingConfigured } from "@/config/financeBanking";
import { startAuth } from "@/lib/finance/enableBankingClient";
import { signBankConnectState } from "@/services/finance/bankSync";

export async function startBankConnectionAction(
  accountId: string,
  aspspName: string,
  aspspCountry: string
): Promise<{ redirectUrl: string }> {
  assertEnableBankingConfigured();

  const state = await signBankConnectState({ accountId, aspspName, aspspCountry });
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 90); // request 90 days of access, the common PSD2 consent window

  const { url } = await startAuth({
    aspspName,
    aspspCountry,
    redirectUrl: ENABLEBANKING_REDIRECT_URI!,
    state,
    validUntil: validUntil.toISOString(),
  });

  return { redirectUrl: url };
}
