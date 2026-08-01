import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/finance/enableBankingClient";
import { verifyBankConnectState, completeBankConnection, signMappingToken } from "@/services/finance/bankSync";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const bankError = searchParams.get("error");

  if (bankError) {
    return NextResponse.redirect(new URL(`/admin/finance/accounts?error=bank_${bankError}`, request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/admin/finance/accounts?error=connect_failed", request.url));
  }

  const statePayload = await verifyBankConnectState(state);
  if (!statePayload) {
    return NextResponse.redirect(new URL("/admin/finance/accounts?error=connect_expired", request.url));
  }

  let session;
  try {
    session = await createSession(code);
  } catch {
    return NextResponse.redirect(new URL("/admin/finance/accounts?error=connect_failed", request.url));
  }

  if (session.accounts.length === 0) {
    return NextResponse.redirect(new URL("/admin/finance/accounts?error=no_account_returned", request.url));
  }

  if (session.accounts.length === 1) {
    await completeBankConnection({
      accountId: statePayload.accountId,
      aspspName: statePayload.aspspName,
      aspspCountry: statePayload.aspspCountry,
      session,
      externalAccountUid: session.accounts[0].uid,
    });
    return NextResponse.redirect(new URL("/admin/finance/accounts?connected=1", request.url));
  }

  // Multiple external accounts returned: let the user map each one to a local account.
  const token = await signMappingToken({
    sessionId: session.sessionId,
    aspspName: statePayload.aspspName,
    aspspCountry: statePayload.aspspCountry,
    accessValidUntil: session.accessValidUntil,
    accounts: session.accounts.map((a) => ({
      uid: a.uid,
      label: a.name ?? a.iban ?? a.uid,
    })),
  });

  return NextResponse.redirect(new URL(`/admin/finance/accounts/connect/map?token=${encodeURIComponent(token)}`, request.url));
}
