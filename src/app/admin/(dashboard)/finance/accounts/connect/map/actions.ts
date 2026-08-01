"use server";

import { redirect } from "next/navigation";
import { verifyMappingToken, completeBankConnection } from "@/services/finance/bankSync";

export async function mapExternalAccountsAction(formData: FormData) {
  const token = String(formData.get("token"));
  const payload = await verifyMappingToken(token);
  if (!payload) {
    redirect("/admin/finance/accounts?error=connect_expired");
  }

  for (const account of payload.accounts) {
    const accountId = String(formData.get(`map_${account.uid}`) || "");
    if (!accountId) continue;

    await completeBankConnection({
      accountId,
      aspspName: payload.aspspName,
      aspspCountry: payload.aspspCountry,
      session: {
        sessionId: payload.sessionId,
        accessValidUntil: payload.accessValidUntil,
        accounts: payload.accounts.map((a) => ({ uid: a.uid })),
      },
      externalAccountUid: account.uid,
    });
  }

  redirect("/admin/finance/accounts?connected=1");
}
