/* eslint-disable @next/next/no-html-link-for-pages */
import { LogoMark } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-8">
      <Container className="flex flex-col items-start gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <LogoMark className="size-6" />
          <span>Punarnava · concept case study</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/case-study" className="hover:text-foreground">Case study</a>
          <a href="/os" className="hover:text-foreground">Explore the OS</a>
          <p>Projections based on stated assumptions.</p>
        </div>
      </Container>
    </footer>
  );
}
