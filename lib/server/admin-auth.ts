import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const FM_ADMIN_SESSION_COOKIE = "fm_admin_session";

const MAX_AGE_SEC = 7 * 24 * 60 * 60;

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function isAdminPasswordConfigured(): boolean {
  return getAdminPassword().length > 0;
}

export function createAdminSessionToken(): string {
  const secret = getAdminPassword();
  if (!secret) throw new Error("ADMIN_PASSWORD is not set");
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = JSON.stringify({
    exp,
    n: randomBytes(8).toString("hex"),
  });
  const sig = createHmac("sha256", secret).update(payload).digest();
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const sigB64 = sig.toString("base64url");
  return `${payloadB64}.${sigB64}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token?.includes(".")) return false;
  const secret = getAdminPassword();
  if (!secret) return false;
  const i = token.indexOf(".");
  const payloadB64 = token.slice(0, i);
  const sigB64 = token.slice(i + 1);
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return false;
  }
  let gotSig: Buffer;
  try {
    gotSig = Buffer.from(sigB64, "base64url");
  } catch {
    return false;
  }
  const expectedSig = createHmac("sha256", secret).update(payload).digest();
  if (gotSig.length !== expectedSig.length) return false;
  if (!timingSafeEqual(gotSig, expectedSig)) return false;
  let parsed: { exp?: number };
  try {
    parsed = JSON.parse(payload) as { exp?: number };
  } catch {
    return false;
  }
  if (typeof parsed.exp !== "number") return false;
  return parsed.exp >= Math.floor(Date.now() / 1000);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(FM_ADMIN_SESSION_COOKIE)?.value);
}

export function adminSessionCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  maxAge: number;
  path: string;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SEC,
    path: "/admin",
  };
}
