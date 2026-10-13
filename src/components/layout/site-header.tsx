import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" aria-label="Punarnava home" className="rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50">
          <Logo />
        </Link>
        <ThemeToggle />
      </Container>
    </header>
  );
}
