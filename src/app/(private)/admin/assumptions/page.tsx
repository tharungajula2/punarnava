import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AssumptionsTable } from "@/components/private/assumptions-table";
import { CopyButton } from "@/components/private/copy-button";
import { PageHeader } from "@/components/private/page-shell";
import { assumptions, assumptionStats, categoryLabels, type Assumption, type Category } from "@/data/assumptions";
import { researchGaps } from "@/data/research-gaps";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Assumptions" };

const order: Category[] = ["market", "regulation", "prices", "plant", "capex", "funding", "economics", "roadmap", "operations", "simulation", "competitors", "alternatives"];

export default function AssumptionsPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted/50" aria-label="Loading" />}>
      <AssumptionsContent />
    </Suspense>
  );
}

// Proxy already blocks non-owners; this re-checks on the server before rendering.
async function AssumptionsContent() {
  await requireRole("owner");
  const rows = [...assumptions] as Assumption[];
  const s = assumptionStats(rows);

  const tiles = [
    { label: "Total numbers", value: s.total },
    { label: "Placeholders", value: s.placeholder, warn: s.placeholder > 0 },
    { label: "Researched", value: s.researched },
    { label: "Verified", value: s.verified, warn: s.verified === 0 },
    { label: "Low confidence", value: s.lowConfidence },
    { label: "Reports disagree", value: s.withConflict },
    { label: "Have a source link", value: `${s.withLink} / ${s.total}`, warn: s.withLink === 0 },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Admin · owner only"
        title="Assumptions"
        description="Every number the landing page, OS and simulation use. One source of truth: src/data/assumptions.ts. Researched means taken from the research files; Verified means checked against a quote, contract or filing."
      />
      <p className="-mt-4 mb-6 text-sm">
        <Link href="/admin" className="text-primary underline-offset-4 hover:underline">
          ← Control room
        </Link>
      </p>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-border bg-card p-4">
            <dt className="text-xs text-muted-foreground">{t.label}</dt>
            <dd className={`mt-1 font-display text-2xl ${t.warn ? "text-destructive" : "text-foreground"}`}>{t.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <AssumptionsTable rows={rows} order={order} labels={categoryLabels} />
      </div>

      <section className="mt-14" aria-labelledby="gaps">
        <h2 id="gaps" className="text-2xl font-normal">
          Research gaps
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Paste each prompt into ChatGPT deep research, save the answer into <code className="font-mono text-sm">/research</code>, then ask Claude to update the assumptions.
        </p>
        <ol className="mt-6 flex flex-col gap-3">
          {researchGaps.map((g, i) => (
            <li key={g.id} className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-normal">
                    {i + 1}. {g.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{g.why}</p>
                </div>
                <CopyButton text={g.prompt} />
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-primary underline-offset-4 hover:underline">Show prompt</summary>
                <pre className="mt-2 max-h-80 overflow-auto rounded-xl bg-muted/60 p-4 text-xs leading-relaxed whitespace-pre-wrap">{g.prompt}</pre>
              </details>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
