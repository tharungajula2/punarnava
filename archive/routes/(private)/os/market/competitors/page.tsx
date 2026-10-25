import type { Metadata } from "next";
import { Suspense } from "react";
import { Details, PageHeader, Panel, Takeaways } from "@/components/os-shell/page";
import { PositioningChart, type Point } from "@/components/lab/positioning-chart";
import { DataTable } from "@/components/os/data-table";
import { ContentSkeleton, Stat, StatGrid } from "@/components/os/ui";
import { getCompetitors } from "@/lib/data/lab";
import { int } from "@/lib/format";
import { fmtValue, shortSource } from "@/lib/lab/format";

export const metadata: Metadata = { title: "Competitors" };

export default function CompetitorsPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const c = await getCompetitors();
  const sized = c.rows.filter((r) => r.tpa !== null).map((r) => r.tpa!).sort((a, b) => a - b);
  const median = sized.length ? sized[Math.floor(sized.length / 2)] : 0;
  const times = c.punarnava.tpa > 0 ? median / c.punarnava.tpa : 0;
  const blr = c.rows.filter((r) => r.bengaluru);
  const points: Point[] = [
    ...c.rows
      .filter((r) => r.tpa !== null)
      .map((r) => ({ name: r.name, tpa: r.tpa!, chain: r.chain, group: r.bengaluru ? ("bengaluru" as const) : ("other" as const), detail: r.scaleDetail })),
    { name: c.punarnava.name, tpa: c.punarnava.tpa, chain: c.punarnava.chain, group: "us", detail: `${fmtValue(c.outputFig.value, c.outputFig.unit)} pellet output × 12 (${shortSource(c.outputFig.source)})` },
  ];

  return (
    <>
      <PageHeader
        href="/os/market/competitors"
        insight={
          <>
            The typical player we mapped is ~{int(times)}× our planned size —{" "}
            <span className="text-muted-foreground">we win on feedstock ties and pellet quality, not scale.</span>
          </>
        }
        status="researched"
        context="Scale figures mix actual tonnage, stated capacity and total waste handled, and are mostly low confidence. Compare orders of magnitude only."
      />

      <StatGrid cols={4}>
        <Stat big label="Companies mapped" value={c.rows.length} hint="From R3" />
        <Stat big label="In Bengaluru" value={blr.length} hint="Mostly collectors and service firms" />
        <Stat big label="Median scale (mapped)" value={`${int(median)} t/yr`} hint="Mixed measures · low confidence" status="researched" />
        <Stat big label="Our planned output" value={`${int(c.punarnava.tpa)} t/yr`} hint={shortSource(c.outputFig.source)} status={c.outputFig.status} />
      </StatGrid>

      <Panel className="mt-6" title="Scale × value-chain position" sub="t/yr on a log scale · the value-chain row is our own classification of R3's descriptions · hover a point">
        <PositioningChart points={points} chainLabels={c.chainLabel} />
      </Panel>

      <Panel className="mt-6" title="What the map says">
        <Takeaways
          items={[
            "Our planned plant is one to two orders of magnitude smaller than the established recyclers. We compete on feedstock relationships and pellet quality, not scale.",
            `Bengaluru's current players (${blr.map((r) => r.name).join(", ")}) are mostly collectors and service firms — likely feedstock partners, not rivals.`,
            "The exception is a reported Bengaluru recycling plant chasing the same clean PE/PP feedstock. Its size and timing are a research gap.",
          ]}
        />
      </Panel>

      <Details title="Show details — company table" count={c.rows.length}>
        <DataTable
          caption="Competitor table"
          rows={c.rows.map((r) => ({
            name: r.name,
            hq: r.hq,
            tpa: r.tpa,
            scaleDetail: r.scaleDetail,
            chainLabel: r.chainLabel,
            polymers: r.polymers,
            model: r.model,
            funding: r.funding,
            relevance: r.relevance,
            source: r.tpa === null ? "R3 · not quantified" : `${shortSource(r.scaleSource)} · ${r.scaleStatus} · ${r.scaleConfidence} confidence`,
          }))}
          columns={[
            { key: "name", label: "Company", sub: "hq" },
            { key: "tpa", label: "Scale (t/yr)", format: "int", align: "right", sub: "scaleDetail" },
            { key: "chainLabel", label: "Position", sub: "polymers" },
            { key: "model", label: "Business model", sub: "funding" },
            { key: "relevance", label: "Why it matters to us" },
            { key: "source", label: "Source" },
          ]}
          filterKey="chainLabel"
          filterLabel="Position"
          searchPlaceholder="Search companies"
          minWidth={1100}
        />
        <p className="text-xs text-muted-foreground">Funding details are R3 summaries of company and investor disclosures; round sizes are left out until verified.</p>
      </Details>
    </>
  );
}
