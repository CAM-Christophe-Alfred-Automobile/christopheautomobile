import { SignJWT, importPKCS8, type KeyLike } from "jose";
import { ENABLEBANKING_APP_ID, ENABLEBANKING_PRIVATE_KEY_BASE64, assertEnableBankingConfigured } from "@/config/financeBanking";

let cachedKey: KeyLike | null = null;

async function getPrivateKey() {
  if (!cachedKey) {
    const pem = Buffer.from(ENABLEBANKING_PRIVATE_KEY_BASE64!, "base64").toString("utf-8");
    cachedKey = await importPKCS8(pem, "RS256");
  }
  return cachedKey;
}

/** Signs a fresh 1-hour RS256 JWT for an Enable Banking API request. */
export async function signEnableBankingJwt(): Promise<string> {
  assertEnableBankingConfigured();
  const key = await getPrivateKey();
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({})
    .setProtectedHeader({ typ: "JWT", alg: "RS256", kid: ENABLEBANKING_APP_ID! })
    .setIssuer("enablebanking.com")
    .setAudience("api.enablebanking.com")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);
}
