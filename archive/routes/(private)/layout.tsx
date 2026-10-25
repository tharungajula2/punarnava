import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Punarnava OS", template: "%s · Punarnava OS" },
};

// Public portfolio case study: this route group ships on Vercel with everything else.
// Old private routes (/sim, /lab/*, /admin/*, old /os/* modules) redirect via next.config.ts.
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
