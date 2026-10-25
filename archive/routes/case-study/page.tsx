/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Case study",
  description: "How Punarnava, a plastic recycling concept, became a landing page, a 7-section operating system and a 3D digital twin.",
  alternates: { canonical: "/case-study" },
};

const built = [
  { title: "Landing page", body: "An investor-grade story in animated SVG: problem, regulation, value chain, unit economics, roadmap." },
  { title: "7-section operating system", body: "Command, Factory, Money, Operations, Market, Execution, Vault. One question per page, with a presentation mode." },
  { title: "3D digital twin", body: "A seeded simulation engine drives a low-poly plant in react-three-fiber, with a guided tour and cinematic mode." },
  { title: "Assumptions engine", body: "Every number lives in one typed file with source, confidence and status badges. Nothing is typed into a page by hand." },
];

const decisions = [
  { title: "One source of truth for numbers", body: "A single assumptions file feeds the landing page, the OS and the simulation, so the story can never drift from the model." },
  { title: "Honesty built into the UI", body: "Placeholder, Researched and Verified badges on every figure, and Sample labels on simulated records." },
  { title: "Engine before graphics", body: "The simulation is pure, tested TypeScript. The 3D scene only renders its state, so the numbers were right before they were pretty." },
  { title: "Calm, not eco-clichés", body: "Deep teal, sand and paper; a display serif; no leaf-and-arrow clip art. Motion is subtle and respects reduced-motion." },
];

const stack = ["Next.js", "TypeScript", "Tailwind CSS", "react-three-fiber", "Recharts", "Zustand", "Vitest", "Claude Code"];

export default function CaseStudyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-16 sm:py-24">
        <Container className="flex max-w-3xl flex-col gap-14">
          <header>
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Case study</p>
            <h1 className="mt-3 text-4xl sm:text-5xl">From a plastic recycling idea to a working operating system.</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              A concept I explored end to end: research, financial model, simulation and product design. Built solo with AI in about two days.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/os" className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-xl px-5")}>Explore the OS</a>
              <a href="/os/factory" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-xl px-5")}>Open the 3D factory</a>
            </div>
          </header>

          <section>
            <h2 className="text-2xl">The problem I explored</h2>
            <p className="mt-3 text-muted-foreground">
              Indian rules (EPR) now require brands to use recycled plastic, but good recycled resin is scarce and the supply chain is informal and fragmented.
              I asked: could a small Bengaluru plant turn rigid plastic waste into traceable HDPE pellets, and would the numbers hold up?
            </p>
          </section>

          <section>
            <h2 className="text-2xl">What I built</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {built.map((b) => (
                <li key={b.title} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
                  <h3 className="text-lg">{b.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{b.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl">How</h2>
            <p className="mt-3 text-muted-foreground">Built in roughly two days, pairing with Claude Code: I made the product decisions, it wrote and tested the code.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {stack.map((s) => (
                <li key={s} className="rounded-full border border-border px-3 py-1.5 text-sm">{s}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl">Key design decisions</h2>
            <ul className="mt-4 flex flex-col gap-4">
              {decisions.map((d) => (
                <li key={d.title}>
                  <h3 className="text-lg">{d.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-2xl">Outcome</h2>
            <p className="mt-3 text-muted-foreground">
              The research was clear: a capital-intensive recycling plant, with licences, working capital and a long ramp-up, is a poor fit for a first-time founder.
              So the concept was paused. What remains is a complete, honest model and a product that shows how I think and build.
            </p>
          </section>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
