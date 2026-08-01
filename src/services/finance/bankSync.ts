import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { FINANCE_BANK_STATE_SECRET, assertBankStateSecretConfigured } from "@/config/financeBanking";
import { getTransactions, EnableBankingSessionExpiredError, type EnableBankingSession } from "@/lib/finance/enableBankingClient";
import { adaptEnableBankingTransactions } from "@/lib/finance/enableBankingAdapt";
import { commitImport } from "@/services/finance/csvImport";

function getSecretKey() {
  assertBankStateSecretConfigured();
  return new TextEncoder().encode(FINANCE_BANK_STATE_SECRET!);
}

type ConnectStatePayload = {
  purpose: "bank_connect_state";
  accountId: string;
  aspspName: string;
  aspspCountry: string;
};

export async function signBankConnectState(data: {
  accountId: string;
  aspspName: string;
  aspspCountry: string;
}): Promise<string> {
  return new SignJWT({ purpose: "bank_connect_state", ...data } satisfies ConnectStatePayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getSecretKey());
}

export async function verifyBankConnectState(
  token: string
): Promise<{ accountId: string; aspspName: string; aspspCountry: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      payload.purpose === "bank_connect_state" &&
      typeof payload.accountId === "string" &&
      typeof payload.aspspName === "string" &&
      typeof payload.aspspCountry === "string"
    ) {
      return { accountId: payload.accountId, aspspName: payload.aspspName, aspspCountry: payload.aspspCountry };
    }
    return null;
  } catch {
    return null;
  }
}

type MappingPayload = {
  purpose: "bank_connect_mapping";
  sessionId: string;
  aspspName: string;
  aspspCountry: string;
  accessValidUntil: string;
  accounts: Array<{ uid: string; label: string }>;
};

export async function signMappingToken(data: Omit<MappingPayload, "purpose">): Promise<string> {
  return new SignJWT({ purpose: "bank_connect_mapping", ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getSecretKey());
}

export async function verifyMappingToken(token: string): Promise<MappingPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.purpose === "bank_connect_mapping") {
      return payload as unknown as MappingPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function completeBankConnection(params: {
  accountId: string;
  aspspName: string;
  aspspCountry: string;
  session: EnableBankingSession;
  externalAccountUid: string;
}) {
  return prisma.bankConnection.upsert({
    where: { accountId: params.accountId },
    create: {
      accountId: params.accountId,
      aspspName: params.aspspName,
      aspspCountry: params.aspspCountry,
      externalAccountUid: params.externalAccountUid,
      sessionId: params.session.sessionId,
      consentValidUntil: new Date(params.session.accessValidUntil),
      status: "active",
    },
    update: {
      aspspName: params.aspspName,
      aspspCountry: params.aspspCountry,
      externalAccountUid: params.externalAccountUid,
      sessionId: params.session.sessionId,
      consentValidUntil: new Date(params.session.accessValidUntil),
      status: "active",
      lastSyncError: null,
    },
  });
}

export type SyncResult = { imported: number; skipped: number; status: string };

/**
 * Pulls new transactions since the last sync and commits them via the shared
 * commitImport() pipeline (type="synced"), relying on Transaction's
 * @@unique([accountId, externalId]) constraint for exact dedup — no preview step,
 * unlike the CSV import wizard. Deliberately never touches Account.currentBalance/
 * balanceAsOf: that anchor stays under manual "Réconcilier" control so newly
 * inserted transactions dated today aren't double-counted against a same-day
 * balance reconciliation (see src/services/finance/accounts.ts:getCurrentBalance).
 */
export async function syncBankConnection(connectionId: string): Promise<SyncResult> {
  const connection = await prisma.bankConnection.findUniqueOrThrow({
    where: { id: connectionId },
    include: { account: true },
  });

  if (connection.consentValidUntil < new Date()) {
    await prisma.bankConnection.update({ where: { id: connectionId }, data: { status: "expired" } });
    return { imported: 0, skipped: 0, status: "expired" };
  }

  const since = connection.lastSyncedAt ?? connection.createdAt;

  let rawTransactions;
  try {
    rawTransactions = await getTransactions(connection.externalAccountUid, since);
  } catch (err) {
    if (err instanceof EnableBankingSessionExpiredError) {
      await prisma.bankConnection.update({
        where: { id: connectionId },
        data: { status: "expired", lastSyncError: err.message },
      });
      return { imported: 0, skipped: 0, status: "expired" };
    }
    const message = err instanceof Error ? err.message : "Erreur de synchronisation";
    await prisma.bankConnection.update({
      where: { id: connectionId },
      data: { status: "error", lastSyncError: message },
    });
    return { imported: 0, skipped: 0, status: "error" };
  }

  const rows = adaptEnableBankingTransactions(rawTransactions);

  const { imported, skipped } = await commitImport({
    accountId: connection.accountId,
    scope: connection.account.scope as "PRO" | "PERSO",
    fileName: `enable-banking:${connection.aspspName}:${new Date().toISOString().slice(0, 10)}`,
    columnMapping: {},
    categoryId: null,
    rows,
    type: "synced",
    source: "bank_sync",
  });

  await prisma.bankConnection.update({
    where: { id: connectionId },
    data: { status: "active", lastSyncedAt: new Date(), lastSyncError: null },
  });

  return { imported, skipped, status: "active" };
}
