// Session token signing/verification. Uses only Web Crypto + jose so it runs
// both in proxy.ts and in Server Components / Server Actions.
import { jwtVerify, SignJWT } from "jose";

export type Role = "owner" | "investor";

export const SESSION_COOKIE = "pn_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

export type Session = { role: Role };

const encoder = new TextEncoder();

function getSecret(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return encoder.encode(secret);
}

function passwordFor(role: Role): string | undefined {
  return role === "owner" ? process.env.OWNER_PASSWORD : process.env.INVESTOR_PASSWORD;
}

// A short fingerprint of the role's current password, stored in the token.
// Changing OWNER_PASSWORD / INVESTOR_PASSWORD changes the fingerprint, which
// invalidates every token issued for that role.
async function passwordFingerprint(role: Role): Promise<string | null> {
  const secret = getSecret();
  const password = passwordFor(role);
  if (!secret || !password) return null;
  const key = await crypto.subtle.importKey("raw", secret as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(`${role}:${password}`));
  return Array.from(new Uint8Array(sig).slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signSession(role: Role): Promise<string> {
  const secret = getSecret();
  const pv = await passwordFingerprint(role);
  if (!secret || !pv) throw new Error("Auth is not configured");
  return new SignJWT({ role, pv })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  const secret = getSecret();
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const role = payload.role;
    if (role !== "owner" && role !== "investor") return null;
    if (payload.pv !== (await passwordFingerprint(role))) return null;
    return { role };
  } catch {
    return null;
  }
}

/** Only allow redirects back into the private app (no open redirects). */
export function safeNextPath(next: unknown): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return "/os";
  return /^\/(os|sim|lab|admin)(\/|$|\?)/.test(next) ? next : "/os";
}
