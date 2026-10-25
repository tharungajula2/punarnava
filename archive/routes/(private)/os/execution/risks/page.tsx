import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Details, PageHeader, Panel } from "@/components/os-shell/page";
import { ContentSkeleton, Pill, SimpleTable, type Tone } from "@/components/os/ui";
import type { Level } from "@/data/os/risks";
import { getRiskRegister } from "@/lib/data/lab";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Risks" };

const levels: Level[] = ["low", "medium", "high", "very-high"];
const levelText: Record<Level, string> = { low: "Low", medium: "Medium", high: "High", "very-high": "Very high" };

// Score = likelihood rank × impact rank (1–16).
const cellTone = (score: number) =>
  score >= 12 ? "bg-destructive/15 border-destructive/30" : score >= 8 ? "bg-status-placeholder/20 border-status-placeholder/40" : score >= 4 ? "bg-primary/5 border-border/70" : "bg-foreground/[0.03] border-border/70";
const scoreTone = (score: number): Tone => (score >= 12 ? "bad" : score >= 8 ? "warn" : "neutral");

export default function RisksPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const risks = await getRiskRegister();
  const num = new Map(risks.map((r, i) => [r.id, i + 1]));
  const severe = risks.filter((r) => r.score >= 12).length;

  return (
    <>
      <PageHeader
        href="/os/execution/risks"
        insight={
          <>
            {risks[0].title} is the biggest risk —{" "}
            <span className="text-muted-foreground">
              {severe} of {risks.length} risks score in the red zone.
            </span>
          </>
        }
        context="Rated as the research reports rate them (R1 for most, R2 where noted). The biggest risks are commercial — feedstock, spreads, working capital — not technology."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Panel title="Likelihood × impact" sub="Numbers match the list on the right.">
          <div className="grid grid-cols-[5rem_repeat(4,minmax(0,1fr))] gap-1.5" role="table" aria-label="Risk matrix: impact by likelihood">
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
                        <span key={r.id} title={r.title} className="flex size-7 items-center justify-center rounded-full bg-background text-xs font-medium shadow-xs ring-1 ring-border">
                          {num.get(r.id)}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="text-[10px] text-muted-foreground">↑ Impact</div>
            {levels.map((l) => (
              <div key={l} className="text-center text-xs text-muted-foreground">
                {levelText[l]}
              </div>
            ))}
          </div>
          <p className="mt-2 pl-20 text-center text-xs font-medium text-muted-foreground">Likelihood →</p>
        </Panel>

        <Panel title="Top 5 and what we do about them">
          <ol className="flex flex-col gap-2.5">
            {risks.slice(0, 5).map((r) => (
              <li key={r.id} className="flex gap-3 rounded-xl border border-border/60 p-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-xs font-medium ring-1 ring-border">{num.get(r.id)}</span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {r.title} <Pill tone={scoreTone(r.score)}>{r.score}</Pill>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.mitigation}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Details title="Show details — full register" count={risks.length}>
        <SimpleTable
          head={["#", "Risk", "L", "I", "Score", "Mitigation", "Source"]}
          minWidth={900}
          rows={risks.map((r) => [
            <span key="n" className="font-medium">
              {num.get(r.id)}
            </span>,
            <span key="t">
              <span className="font-medium">{r.title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{r.why}</span>
            </span>,
            <span key="l" className="whitespace-nowrap">
              {r.likelihoodLabel}
            </span>,
            <span key="i" className="whitespace-nowrap">
              {r.impactLabel}
            </span>,
            <Pill key="s" tone={scoreTone(r.score)}>
              {r.score}
            </Pill>,
            <span key="m">
              {r.mitigation}
              <Link href={r.href} className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline">
                {r.module} <ArrowUpRight className="size-3" aria-hidden />
              </Link>
            </span>,
            <span key="src" className="text-xs text-muted-foreground">
              {r.source}
            </span>,
          ])}
        />
      </Details>
    </>
  );
}
