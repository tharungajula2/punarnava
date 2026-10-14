import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Punarnava OS", template: "%s · Punarnava OS" },
  robots: { index: false, follow: false },
};

// Local-only: this route group is excluded from the Vercel build (scripts/prune-private.mjs).
// Old private routes (/sim, /lab/*, /admin/*, old /os/* modules) redirect via next.config.ts.
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
