import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PrivateNav } from "@/components/private/private-nav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Local-only: this route group is excluded from the Vercel build (scripts/prune-private.mjs).
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/os" aria-label="Punarnava workspace home" className="rounded-lg">
            <Logo />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
          </div>
        </div>
        {/* Mobile: horizontal nav under the bar */}
        <div className="overflow-x-auto border-t border-border/60 px-2 py-1.5 md:hidden">
          <PrivateNav compact />
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border/60 p-3 md:block">
          <PrivateNav />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
