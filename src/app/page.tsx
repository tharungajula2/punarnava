import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Temporary Phase 1 page: shows the design system. Replaced by the landing page in Phase 2.

const swatches = [
  { name: "Deep teal", role: "Primary", className: "bg-teal" },
  { name: "Mint", role: "Accent", className: "bg-mint" },
  { name: "Warm sand", role: "Secondary", className: "bg-sand" },
  { name: "Ink", role: "Text", className: "bg-ink" },
  { name: "Paper", role: "Background", className: "bg-paper border" },
];

const dataColours = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="py-24 sm:py-32">
          <Container className="flex flex-col items-start gap-8">
            <Badge variant="secondary">Design system preview</Badge>
            <h1 className="max-w-3xl text-5xl font-normal leading-[1.05] sm:text-7xl">
              Plastic that becomes <em className="text-primary">new again.</em>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Punarnava turns Bangalore&apos;s waste plastic into clean recycled pellets. The full investor
              site is being built.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="h-11 rounded-xl px-5">
                Primary action <ArrowRight data-icon="inline-end" />
              </Button>
              <Button size="lg" variant="outline" className="h-11 rounded-xl px-5">
                Secondary
              </Button>
            </div>
          </Container>
        </section>

        <section className="pb-24">
          <Container className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-2xl shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Brand palette</CardTitle>
                <CardDescription>Colour tokens, with light and dark versions.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-5 gap-3">
                {swatches.map((s) => (
                  <div key={s.name} className="flex flex-col gap-2">
                    <div className={`aspect-square rounded-xl ${s.className}`} />
                    <div className="text-xs">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-muted-foreground">{s.role}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-[var(--shadow-soft)]">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Data &amp; status</CardTitle>
                <CardDescription>Chart colours and the badges every number will carry.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex gap-2">
                  {dataColours.map((c) => (
                    <div key={c} className={`h-10 flex-1 rounded-lg ${c}`} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1.5">
                    <span className="size-2 rounded-full bg-status-placeholder" /> Placeholder
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <span className="size-2 rounded-full bg-status-researched" /> Researched
                  </Badge>
                  <Badge variant="outline" className="gap-1.5">
                    <span className="size-2 rounded-full bg-status-verified" /> Verified
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-[var(--shadow-soft)] md:col-span-2">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Typography &amp; mark</CardTitle>
                <CardDescription>Fraunces for headlines, Inter for interface text.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <p className="font-display text-4xl">Aa — Fraunces display</p>
                  <p className="text-base">Aa — Inter for UI, tables and body copy.</p>
                  <p className="font-mono text-sm text-muted-foreground">0123456789 — mono for figures</p>
                </div>
                <LogoMark className="size-24" title="Punarnava loop mark" />
              </CardContent>
            </Card>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
