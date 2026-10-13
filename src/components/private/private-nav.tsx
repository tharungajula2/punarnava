"use client";

import { Boxes, FlaskConical, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/os", label: "Operating system", short: "OS", icon: LayoutDashboard },
  { href: "/sim", label: "Simulation", short: "Sim", icon: Boxes },
  { href: "/lab", label: "R&D lab", short: "Lab", icon: FlaskConical },
] as const;

const adminItem = { href: "/admin", label: "Admin", short: "Admin", icon: ShieldCheck } as const;

export function PrivateNav({ showAdmin = false, compact = false }: { showAdmin?: boolean; compact?: boolean }) {
  const pathname = usePathname();
  const list = showAdmin ? [...items, adminItem] : items;

  return (
    <nav aria-label="Workspace" className={cn("flex gap-1", compact ? "flex-row" : "flex-col")}>
      {list.map(({ href, label, short, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
              active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {compact ? short : label}
          </Link>
        );
      })}
    </nav>
  );
}
