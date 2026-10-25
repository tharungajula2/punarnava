import { LogoMark } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-8">
      <Container className="flex flex-col items-start gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <LogoMark className="size-6" />
          <span>Punarnava · proposed plant concept</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/factory" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Factory walkthrough</a>
          <p>Concept only · Plant not built · Figures are illustrative</p>
        </div>
      </Container>
    </footer>
  );
}
