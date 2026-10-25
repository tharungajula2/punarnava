import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Droplets, GitBranch, ShieldCheck, ScanSearch } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { FactoryExperience } from "@/components/factory/factory-experience";
import { Container } from "@/components/layout/container";
import { FACTORY_GATES } from "@/data/factory-story";

export const metadata: Metadata = {
  title: "The proposed factory",
  description: "Walk through the proposed Punarnava recycling plant, its design choices and the steps needed to build it.",
  alternates: { canonical: "/factory" },
};

const principles = [
  {
    icon: GitBranch,
    title: "Follow the material",
    body: "Receiving, processing and dispatch have a clear order. That makes handoffs easier to control.",
  },
  {
    icon: Droplets,
    title: "Contain the wet work",
    body: "Washing and water treatment are planned as one system, with drainage and reuse designed together.",
  },
  {
    icon: ShieldCheck,
    title: "Make room for safe work",
    body: "The final plan must prove people, forklifts, trucks and maintenance can move without unsafe crossings.",
  },
  {
    icon: ScanSearch,
    title: "Release only tested product",
    body: "A batch reaches finished storage only after its quality and records are checked.",
  },
] as const;

export default function FactoryPage() {
  return (
    <main className="min-h-dvh bg-background">
      <header className="border-b border-border/60 bg-background/90">
        <Container className="flex min-h-16 items-center justify-between gap-4">
          <Link href="/" aria-label="Punarnava home" className="rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50"><Logo /></Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><ArrowLeft className="size-4" aria-hidden /> Back to the idea</Link>
        </Container>
      </header>

      <Container className="pt-10 pb-16 sm:pt-14">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-primary uppercase">Inside the proposed plant</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.04] sm:text-6xl">Every area has a reason to be here.</h1>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:pb-1">
            Follow used rigid plastic from the gate to a tested, packed product. Select any area, or play the guided tour for the complete story.
          </p>
        </div>
        <FactoryExperience />
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          This is a proposed layout, not a construction drawing or a live plant. The final design depends on a real site, equipment selection, engineering review and permits.
        </p>
      </Container>

      <section className="border-t border-border bg-secondary/40 py-16 sm:py-20" aria-labelledby="design-title">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.16em] text-primary uppercase">Design logic</p>
            <h2 id="design-title" className="mt-3 font-display text-3xl sm:text-5xl">Four rules behind the layout.</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((item) => (
              <article key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
                <item.icon className="size-6 text-primary" aria-hidden />
                <h3 className="mt-5 font-display text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="build-title">
        <Container>
          <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold tracking-[0.16em] text-primary uppercase">From design to reality</p>
              <h2 id="build-title" className="mt-3 font-display text-3xl sm:text-5xl">Build only when each gate is passed.</h2>
            </div>
            <p className="max-w-lg text-muted-foreground">The model is the starting question. Real samples, buyers, a site, engineers and authorities decide the final plant.</p>
          </div>
          <ol className="mt-10 grid gap-4 lg:grid-cols-5">
            {FACTORY_GATES.map((gate) => (
              <li key={gate.number} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                <span className="font-mono text-xs text-primary">{gate.number}</span>
                <h3 className="mt-4 font-display text-xl leading-tight">{gate.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{gate.body}</p>
                <p className="mt-auto border-t border-border pt-4 text-sm font-medium text-primary lg:mt-6">Proof: {gate.proof}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <footer className="border-t border-border py-8">
        <Container className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Punarnava · Concept by Tharun Gajula</p>
          <Link href="/" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">Return to the presentation <ArrowUpRight className="size-4" aria-hidden /></Link>
        </Container>
      </footer>
    </main>
  );
}
