import { SignJWT } from "jose";

function getSecretKey() {
  const secret = process.env.SSO_HANDOFF_SECRET;
  if (!secret) throw new Error("SSO_HANDOFF_SECRET is not set in the environment");
  return new TextEncoder().encode(secret);
}

export async function signHandoffToken(): Promise<string> {
  return new SignJWT({ purpose: "camfinance-handoff" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(getSecretKey());
}
