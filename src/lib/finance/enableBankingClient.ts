import { signEnableBankingJwt } from "@/lib/finance/enableBankingJwt";

const API_BASE = "https://api.enablebanking.com";

export class EnableBankingApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown
  ) {
    super(message);
    this.name = "EnableBankingApiError";
  }
}

export class EnableBankingSessionExpiredError extends EnableBankingApiError {}

async function ebFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await signEnableBankingJwt();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    if (res.status === 401 || res.status === 403) {
      throw new EnableBankingSessionExpiredError(`Enable Banking: accès refusé (${res.status})`, res.status, body);
    }
    throw new EnableBankingApiError(`Enable Banking: erreur ${res.status}`, res.status, body);
  }

  return res.json();
}

export type Aspsp = {
  name: string;
  country: string;
  logo?: string;
};

/**
 * Merges ASPSP listings across a small set of relevant countries rather than
 * filtering strictly by one — e.g. Revolut is Lithuania-licensed and may not
 * appear under country=FR even though it's used in France.
 */
export async function listAspsps(countries: string[] = ["FR", "LT"]): Promise<Aspsp[]> {
  const results = await Promise.all(
    countries.map((country) =>
      ebFetch<{ aspsps: Aspsp[] }>(`/aspsps?country=${encodeURIComponent(country)}`).then((r) => r.aspsps)
    )
  );
  const merged = results.flat();
  const seen = new Set<string>();
  return merged.filter((a) => {
    const key = `${a.name}|${a.country}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function startAuth(params: {
  aspspName: string;
  aspspCountry: string;
  redirectUrl: string;
  state: string;
  validUntil: string; // ISO date, how long to request transaction access for
}): Promise<{ url: string }> {
  // NOTE: exact request/response field names should be confirmed against a real
  // Enable Banking sandbox response once credentials are available — this follows
  // their documented quick-start shape but hasn't been exercised against a live call.
  return ebFetch<{ url: string }>("/auth", {
    method: "POST",
    body: JSON.stringify({
      access: { valid_until: params.validUntil },
      aspsp: { name: params.aspspName, country: params.aspspCountry },
      state: params.state,
      redirect_url: params.redirectUrl,
      psu_type: "personal",
    }),
  });
}

export type EnableBankingSession = {
  sessionId: string;
  accounts: Array<{ uid: string; currency?: string; iban?: string; name?: string }>;
  accessValidUntil: string;
};

export async function createSession(code: string): Promise<EnableBankingSession> {
  const res = await ebFetch<{
    session_id: string;
    accounts: Array<{ uid: string; currency?: string; iban?: string; name?: string }>;
    access: { valid_until: string };
  }>("/sessions", {
    method: "POST",
    body: JSON.stringify({ code }),
  });

  return {
    sessionId: res.session_id,
    accounts: res.accounts,
    accessValidUntil: res.access.valid_until,
  };
}

export async function getBalances(accountUid: string): Promise<unknown> {
  return ebFetch(`/accounts/${encodeURIComponent(accountUid)}/balances`);
}

export type EnableBankingTransaction = Record<string, unknown>;

export async function getTransactions(
  accountUid: string,
  dateFrom: Date
): Promise<EnableBankingTransaction[]> {
  const dateStr = dateFrom.toISOString().slice(0, 10);
  const res = await ebFetch<{ transactions: EnableBankingTransaction[] }>(
    `/accounts/${encodeURIComponent(accountUid)}/transactions?date_from=${dateStr}`
  );
  return res.transactions;
}
