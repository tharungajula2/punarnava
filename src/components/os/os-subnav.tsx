"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isActive, osModules } from "./modules";

type ChipModule = { href: string; short: string; icon: LucideIcon };

/** Scrolling chip bar of section links (phones/tablets). */
export function ModuleChips({ modules, isActive: active, label }: { modules: ChipModule[]; isActive: (pathname: string, href: string) => boolean; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="-mx-4 mb-6 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:hidden">
      <ul className="flex w-max gap-1.5">
        {modules.map((m) => {
          const on = active(pathname, m.href);
          return (
            <li key={m.href}>
              <Link
                href={m.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
                  on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <m.icon className="size-3.5" aria-hidden />
                {m.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** OS module tabs for phones/tablets; desktop shows them in the sidebar. */
export function OsSubnav() {
  return <ModuleChips modules={osModules} isActive={isActive} label="Operating system modules" />;
}
