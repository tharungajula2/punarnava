"use client";

import { Boxes, FlaskConical, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLabActive, labModules } from "@/components/lab/modules";
import { isActive, osModules } from "@/components/os/modules";
import { cn } from "@/lib/utils";

const items = [
  { href: "/os", label: "Operating system", short: "OS", icon: LayoutDashboard },
  { href: "/sim", label: "Simulation", short: "Sim", icon: Boxes },
  { href: "/lab", label: "R&D lab", short: "Lab", icon: FlaskConical },
] as const;

/** Sections nested under a top-level item on desktop while inside it. */
const nested = {
  "/os": { label: "Operating system modules", modules: osModules, isActive },
  "/lab": { label: "R&D lab sections", modules: labModules, isActive: isLabActive },
} as const;

const adminItem = { href: "/admin", label: "Admin", short: "Admin", icon: ShieldCheck } as const;

export function PrivateNav({ showAdmin = false, compact = false }: { showAdmin?: boolean; compact?: boolean }) {
  const pathname = usePathname();
  const list = showAdmin ? [...items, adminItem] : items;

  return (
    <nav aria-label="Workspace" className={cn("flex gap-1", compact ? "flex-row" : "flex-col")}>
      {list.map(({ href, label, short, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <div key={href} className={cn(!compact && "flex flex-col")}>
            <Link
              href={href}
              aria-current={active && pathname === href ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {compact ? short : label}
            </Link>
            {/* Desktop: OS modules / lab sections nest under their item while inside it */}
            {!compact && active && href in nested ? (
              <SubList group={nested[href as keyof typeof nested]} pathname={pathname} />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

function SubList({ group, pathname }: { group: (typeof nested)[keyof typeof nested]; pathname: string }) {
  return (
    <ul aria-label={group.label} className="mt-1 mb-2 ml-5 flex flex-col gap-0.5 border-l border-border/70 pl-2">
      {group.modules.map((m) => {
        const on = group.isActive(pathname, m.href);
        return (
          <li key={m.href}>
            <Link
              href={m.href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                on ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              <m.icon className="size-3.5 shrink-0" aria-hidden />
              {m.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
