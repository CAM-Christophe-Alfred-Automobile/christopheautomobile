import { SignJWT, jwtVerify } from "jose";
import { adminConfig } from "@/config/admin";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DURATION = "7d";

function getSecretKey() {
  return new TextEncoder().encode(adminConfig.sessionSecret);
}

export async function signSession(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
