import type { Metadata } from "next";
import { Suspense } from "react";
import { CopyButton } from "@/components/private/copy-button";
import { ContentSkeleton, LinkButton, Pill, Section, SimpleTable, Stat, StatGrid } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { categoryLabels } from "@/data/assumptions";
import { requireRole } from "@/lib/auth/session";
import { getResearchGaps } from "@/lib/data/lab";
import { fmtValue, shortSource } from "@/lib/lab/format";

export const metadata: Metadata = { title: "Research gaps" };

export default function ResearchGapsPage() {
  return (
    <>
      <PageHeader
        eyebrow="R&D lab · Research gaps"
        title="What we still don't know"
        description="Missing or weak data, each with a prompt ready to paste into ChatGPT deep research. Save the answer into /research, then ask Claude to update assumptions.ts — every page in the app picks up the new numbers."
      >
        <LinkButton href="/admin/assumptions" label="All assumptions" />
      </PageHeader>
      <Suspense fallback={<ContentSkeleton />}>
        <GapsContent />
      </Suspense>
    </>
  );
}

async function GapsContent() {
  const { role } = await requireRole();
  const g = await getResearchGaps(role);

  return (
    <>
      <StatGrid>
        <Stat label="Prompts ready" value={g.gaps.length} />
        <Stat label="Placeholders (business)" value={g.placeholders.length} hint={`+ ${g.simPlaceholders} simulation modelling choices`} />
        <Stat label="Low-confidence figures" value={g.lowConfidence.length} />
        <Stat label="With a clickable source" value={`${g.stats.withLink} / ${g.stats.total}`} tone={g.stats.withLink === 0 ? "bad" : undefined} hint="Nothing can be 'verified' without links" />
      </StatGrid>

      <Section title="Ready-to-paste prompts" description="One prompt per gap. Each lists the assumptions it would firm up.">
        <ol className="flex flex-col gap-3">
          {g.gaps.map((gap, i) => (
            <li key={gap.id} className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-normal">
                    {i + 1}. {gap.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{gap.why}</p>
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {gap.affects.map((id) => (
                      <Pill key={id} className="font-mono text-[10px]">
                        {id}
                      </Pill>
                    ))}
                  </p>
                </div>
                <CopyButton text={gap.prompt} />
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-primary underline-offset-4 hover:underline">Show prompt</summary>
                <pre className="mt-2 max-h-80 overflow-auto rounded-xl bg-muted/60 p-4 text-xs leading-relaxed whitespace-pre-wrap">{gap.prompt}</pre>
              </details>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Placeholders" description="Values with no research behind them yet. They are used in the model but labelled everywhere they appear.">
        <SimpleTable
          head={["Assumption", "Current value", "Category", "Note"]}
          rows={g.placeholders.map((a) => [
            <span key="l">
              <span className="font-medium">{a.label}</span>
              <span className="block font-mono text-[10px] text-muted-foreground">{a.id}</span>
            </span>,
            fmtValue(a.value, a.unit),
            categoryLabels[a.category],
            <span key="s" className="text-xs text-muted-foreground">{shortSource(a.source)}</span>,
          ])}
        />
      </Section>

      <Section title="Where the reports disagree" description="Conflicts between R1, R2 and R3, and which side the model took.">
        <SimpleTable
          head={["Assumption", "Value used", "Conflict"]}
          minWidth={720}
          rows={g.conflicts.map((a) => [<span key="l" className="font-medium">{a.label}</span>, fmtValue(a.value, a.unit), <span key="c" className="text-sm text-muted-foreground">{a.conflict}</span>])}
        />
      </Section>

      <Section title="Low-confidence figures" description="Researched, but from a single listing, an official statement or a company claim. Worth re-checking before an investor meeting.">
        <SimpleTable
          head={["Assumption", "Value", "Source"]}
          rows={g.lowConfidence.map((a) => [
            <span key="l" className="font-medium">{a.label}</span>,
            fmtValue(a.value, a.unit),
            <span key="s" className="text-xs text-muted-foreground">{shortSource(a.source)}</span>,
          ])}
        />
      </Section>
    </>
  );
}
