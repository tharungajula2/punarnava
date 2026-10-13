import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-8">
      <Container className="flex flex-col items-start gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <LogoMark className="size-6" />
          <span>Punarnava · Bengaluru, India</span>
        </div>
        <div className="flex items-center gap-4">
          <p>Projections based on stated assumptions.</p>
          <Link href="/login" prefetch={false} className="underline-offset-4 hover:text-foreground hover:underline">
            Team sign-in
          </Link>
        </div>
      </Container>
    </footer>
  );
}
