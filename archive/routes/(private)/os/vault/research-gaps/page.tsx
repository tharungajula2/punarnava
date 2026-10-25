import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailBlock, Details, PageHeader, Panel } from "@/components/os-shell/page";
import { ContentSkeleton, SimpleTable, Stat, StatGrid } from "@/components/os/ui";
import { CopyButton } from "@/components/private/copy-button";
import { categoryLabels } from "@/data/assumptions";
import { getResearchGaps } from "@/lib/data/lab";
import { fmtValue, shortSource } from "@/lib/lab/format";

export const metadata: Metadata = { title: "Research gaps" };

export default function ResearchGapsPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const g = await getResearchGaps();

  return (
    <>
      <PageHeader
        href="/os/vault/research-gaps"
        insight={
          <>
            {g.gaps.length} ready-to-paste prompts would firm up{" "}
            <span className="text-muted-foreground">
              {g.placeholders.length} placeholders and {g.lowConfidence.length} low-confidence figures.
            </span>
          </>
        }
        context="Paste a prompt into ChatGPT deep research, save the answer in /research, then ask Claude to update the assumptions."
      />

      <StatGrid cols={4}>
        <Stat big label="Prompts ready" value={g.gaps.length} />
        <Stat big label="Business placeholders" value={g.placeholders.length} hint={`+ ${g.simPlaceholders} simulation modelling choices`} />
        <Stat big label="Reports disagree" value={g.conflicts.length} />
        <Stat big label="With a source link" value={`${g.stats.withLink} / ${g.stats.total}`} tone={g.stats.withLink === 0 ? "bad" : undefined} />
      </StatGrid>

      <Panel className="mt-6" title="Prompts, most useful first" sub="Copy one, run it, drop the answer into /research.">
        <ol className="grid gap-3 lg:grid-cols-2">
          {g.gaps.map((gap, i) => (
            <li key={gap.id} className="flex flex-col gap-2 rounded-xl border border-border/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">
                  <span className="mr-2 text-muted-foreground tabular-nums">{i + 1}</span>
                  {gap.title}
                </p>
                <CopyButton text={gap.prompt} />
              </div>
              <p className="text-sm text-muted-foreground">{gap.why}</p>
              <p className="text-xs text-muted-foreground">Firms up {gap.affects.length} {gap.affects.length === 1 ? "assumption" : "assumptions"}</p>
            </li>
          ))}
        </ol>
      </Panel>

      <Details title="Show details — prompt text, placeholders, conflicts, low-confidence figures">
        <DetailBlock title="Prompt text">
          <div className="flex flex-col gap-3">
            {g.gaps.map((gap, i) => (
              <details key={gap.id} className="rounded-xl border border-border/60 px-4 py-2.5">
                <summary className="cursor-pointer text-sm">
                  {i + 1}. {gap.title}
                </summary>
                <p className="mt-2 flex flex-wrap gap-1.5 font-mono text-[10px] text-muted-foreground">{gap.affects.join(" · ")}</p>
                <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-foreground/[0.04] p-3 text-xs leading-relaxed whitespace-pre-wrap">{gap.prompt}</pre>
              </details>
            ))}
          </div>
        </DetailBlock>
        <DetailBlock title="Placeholders" note="Used in the model, labelled everywhere they appear.">
          <SimpleTable
            head={["Assumption", "Current value", "Category", "Note"]}
            rows={g.placeholders.map((a) => [
              <span key="l">
                <span className="font-medium">{a.label}</span>
                <span className="block font-mono text-[10px] text-muted-foreground">{a.id}</span>
              </span>,
              fmtValue(a.value, a.unit),
              categoryLabels[a.category],
              <span key="s" className="text-xs text-muted-foreground">
                {shortSource(a.source)}
              </span>,
            ])}
          />
        </DetailBlock>
        <DetailBlock title="Where the reports disagree" note="And which side the model took.">
          <SimpleTable
            head={["Assumption", "Value used", "Conflict"]}
            minWidth={720}
            rows={g.conflicts.map((a) => [<span key="l" className="font-medium">{a.label}</span>, fmtValue(a.value, a.unit), <span key="c" className="text-sm text-muted-foreground">{a.conflict}</span>])}
          />
        </DetailBlock>
        <DetailBlock title="Low-confidence figures" note="Worth re-checking before an investor meeting.">
          <SimpleTable
            head={["Assumption", "Value", "Source"]}
            rows={g.lowConfidence.map((a) => [
              <span key="l" className="font-medium">{a.label}</span>,
              fmtValue(a.value, a.unit),
              <span key="s" className="text-xs text-muted-foreground">
                {shortSource(a.source)}
              </span>,
            ])}
          />
        </DetailBlock>
      </Details>
    </>
  );
}
