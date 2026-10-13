import { Menu } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { nav } from "@/data/landing";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Punarnava home" className="rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50">
          <Logo />
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <a href="#contact" className={cn(buttonVariants(), "ml-1 hidden h-9 rounded-xl px-4 sm:inline-flex")}>
            Contact
          </a>
          {/* Mobile menu — native <details>, no JavaScript needed */}
          <details className="group relative md:hidden">
            <summary
              aria-label="Open menu"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "list-none [&::-webkit-details-marker]:hidden")}
            >
              <Menu />
            </summary>
            <nav
              aria-label="Sections"
              className="glass absolute top-11 right-0 flex w-56 flex-col p-2"
            >
              {[...nav, { href: "#contact", label: "Contact" }].map((item) => (
                <a key={item.href} href={item.href} className="rounded-lg px-3 py-2.5 text-sm hover:bg-muted">
                  {item.label}
                </a>
              ))}
            </nav>
          </details>
        </div>
      </Container>
    </header>
  );
}
