"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { sections } from "./nav";

/** Tab bar inside a section (Money, Operations, Market, Execution, Vault). */
export function SectionTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const section = sections.find((s) => s.id === id);
  if (!section || section.tabs.length < 2) return null;

  return (
    <nav aria-label={`${section.label} tabs`} className="os-chrome -mt-1 mb-8 overflow-x-auto">
      <ul className="flex w-max gap-1 rounded-2xl border border-border/70 bg-card/50 p-1 backdrop-blur-sm">
        {section.tabs.map((t) => {
          const on = pathname === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "block rounded-xl px-4 py-2 text-sm whitespace-nowrap transition-colors",
                  on ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
