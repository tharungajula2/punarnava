import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isOpenMode } from "./mode";
import { SESSION_COOKIE, verifySession, type Role, type Session } from "./token";

/** Reads the session cookie. Call only inside a <Suspense> boundary. */
export const getSession = cache(async (): Promise<Session | null> => {
  if (isOpenMode()) return { role: "owner" }; // AUTH_MODE=open: everyone sees the owner view
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySession(token);
});

/**
 * Second line of defence behind proxy.ts: use in any Server Component or
 * Server Action that renders/returns private data.
 */
export async function requireRole(role?: Role): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (role === "owner" && session.role !== "owner") redirect("/os");
  return session;
}
