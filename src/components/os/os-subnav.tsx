"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isActive, osModules } from "./modules";

/** OS module tabs for phones/tablets; desktop shows them in the sidebar. */
export function OsSubnav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Operating system modules" className="-mx-4 mb-6 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:hidden">
      <ul className="flex w-max gap-1.5">
        {osModules.map((m) => {
          const active = isActive(pathname, m.href);
          return (
            <li key={m.href}>
              <Link
                href={m.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted",
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
