import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SourceKey } from "@/components/lab/source";
import { ContentSkeleton, Pill, Section, SimpleTable, type Tone } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import type { Level } from "@/data/os/risks";
import { getRiskRegister } from "@/lib/data/lab";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Risk register" };

const levels: Level[] = ["low", "medium", "high", "very-high"];
const levelText: Record<Level, string> = { low: "Low", medium: "Medium", high: "High", "very-high": "Very high" };

// Score = likelihood rank × impact rank (1–16).
const cellTone = (score: number) =>
  score >= 12 ? "bg-destructive/15 border-destructive/30" : score >= 8 ? "bg-status-placeholder/20 border-status-placeholder/40" : score >= 4 ? "bg-primary/5 border-border" : "bg-muted/40 border-border";
const scoreTone = (score: number): Tone => (score >= 12 ? "bad" : score >= 8 ? "warn" : "neutral");

export default function RisksPage() {
  return (
    <>
      <PageHeader
        eyebrow="R&D lab · Risk register"
        title="What could sink the plant, and what we do about it"
        description="The principal risks named in the research, rated as the reports rate them. The biggest are commercial — feedstock, spreads and working capital — not technology."
      />
      <Suspense fallback={<ContentSkeleton />}>
        <RiskContent />
      </Suspense>
    </>
  );
}

async function RiskContent() {
  const risks = await getRiskRegister();
  const num = new Map(risks.map((r, i) => [r.id, i + 1]));

  return (
    <>
      <SourceKey />
      <Section title="Likelihood × impact" description="Numbers match the register below. Ratings are the reports' qualitative ratings (R1 for most; R2 where noted).">
        <div className="overflow-x-auto">
          <div className="grid min-w-[560px] grid-cols-[5.5rem_repeat(4,minmax(0,1fr))] gap-1.5" role="table" aria-label="Risk matrix: impact by likelihood">
            {[...levels].reverse().map((imp) => (
              <div key={imp} role="row" className="contents">
                <div role="rowheader" className="flex items-center text-xs text-muted-foreground">
                  {levelText[imp]}
                </div>
                {levels.map((lik) => {
                  const here = risks.filter((r) => r.impact === imp && r.likelihood === lik);
                  const score = (levels.indexOf(imp) + 1) * (levels.indexOf(lik) + 1);
                  return (
                    <div key={lik} role="cell" className={cn("flex min-h-20 flex-wrap content-start gap-1.5 rounded-xl border p-2", cellTone(score))}>
                      {here.map((r) => (
                        <a key={r.id} href={`#risk-${r.id}`} title={r.title} className="flex size-7 items-center justify-center rounded-full bg-background text-xs font-medium shadow-xs ring-1 ring-border hover:ring-primary">
                          {num.get(r.id)}
                        </a>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
            <div />
            {levels.map((l) => (
              <div key={l} className="text-center text-xs text-muted-foreground">
                {levelText[l]}
              </div>
            ))}
          </div>
          <p className="mt-2 min-w-[560px] pl-[5.5rem] text-center text-xs font-medium text-muted-foreground">Likelihood →</p>
          <p className="text-xs text-muted-foreground">↑ Impact</p>
        </div>
      </Section>

      <Section title="Register" description="Sorted by score (likelihood × impact, 1–16). Each risk links to the OS module that tracks it.">
        <SimpleTable
          head={["#", "Risk", "L", "I", "Score", "Mitigation", "Source"]}
          minWidth={900}
          rows={risks.map((r) => [
            <span key="n" id={`risk-${r.id}`} className="scroll-mt-24 font-medium">
              {num.get(r.id)}
            </span>,
            <span key="t">
              <span className="font-medium">{r.title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{r.why}</span>
            </span>,
            <span key="l" className="whitespace-nowrap">{r.likelihoodLabel}</span>,
            <span key="i" className="whitespace-nowrap">{r.impactLabel}</span>,
            <Pill key="s" tone={scoreTone(r.score)}>
              {r.score}
            </Pill>,
            <span key="m">
              {r.mitigation}
              <Link href={r.href} className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline">
                {r.module} <ArrowUpRight className="size-3" aria-hidden />
              </Link>
            </span>,
            <span key="src" className="text-xs text-muted-foreground">{r.source}</span>,
          ])}
        />
      </Section>
    </>
  );
}
