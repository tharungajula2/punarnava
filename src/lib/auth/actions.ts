"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNextPath, SESSION_COOKIE, SESSION_MAX_AGE, signSession, type Role } from "./token";

export type LoginState = { error?: string };

const GENERIC_ERROR = "That password didn't work. Please try again.";

// Basic throttling: each failed attempt from an IP adds a growing delay
// (0.5s, 1s, 2s … capped at 10s). In-memory, so it is per server instance —
// a speed bump against guessing, not a hard lockout.
const failures = new Map<string, { count: number; last: number }>();
const WINDOW_MS = 15 * 60 * 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

/** Constant-time comparison so response timing doesn't leak the password. */
function matches(input: string, expected: string | undefined) {
  return !!expected && timingSafeEqual(digest(input), digest(expected));
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const record = failures.get(ip);
  const recent = record && now - record.last < WINDOW_MS ? record.count : 0;

  const password = String(formData.get("password") ?? "");
  let next = safeNextPath(formData.get("next"));

  // Check both so timing is the same whichever (if any) matches.
  const isOwner = matches(password, process.env.OWNER_PASSWORD);
  const isInvestor = matches(password, process.env.INVESTOR_PASSWORD);
  const role: Role | null = isOwner ? "owner" : isInvestor ? "investor" : null;

  if (!role || !password) {
    failures.set(ip, { count: recent + 1, last: now });
    await sleep(Math.min(500 * 2 ** recent, 10_000));
    return { error: GENERIC_ERROR };
  }

  let token: string;
  try {
    token = await signSession(role);
  } catch {
    // Missing/short SESSION_SECRET — don't reveal details to the visitor.
    console.error("[auth] SESSION_SECRET missing or shorter than 32 characters");
    return { error: "Sign-in is temporarily unavailable." };
  }

  failures.delete(ip);
  if (role !== "owner" && next.startsWith("/admin")) next = "/os";
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect(next);
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
