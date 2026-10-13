// AUTH_MODE switch. Safe to import from proxy.ts, Server Components and client-free code.
//   "open"   (default) — private routes need no login; everyone gets the owner view.
//   "locked" — password protection (owner / investor) enforced as before.
export type AuthMode = "open" | "locked";

export function getAuthMode(): AuthMode {
  return process.env.AUTH_MODE?.trim().toLowerCase() === "locked" ? "locked" : "open";
}

export const isOpenMode = () => getAuthMode() === "open";
