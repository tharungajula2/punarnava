import type { Metadata } from "next";
import { Suspense } from "react";
import { PositioningChart, type Point } from "@/components/lab/positioning-chart";
import { SourceKey, SourceText } from "@/components/lab/source";
import { ChartCard } from "@/components/os/chart";
import { DataTable } from "@/components/os/data-table";
import { Card, ContentSkeleton, Pill, Section, Stat, StatGrid } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { getCompetitors } from "@/lib/data/lab";
import { fmtValue, shortSource } from "@/lib/lab/format";

export const metadata: Metadata = { title: "Competitor map" };

export default function CompetitorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="R&D lab · Competitor map"
        title="Who else turns waste into resin"
        description="Twelve companies from R3: recyclers, waste-service platforms and aggregators. They compete with us for feedstock and buyers even when they make different products."
      />
      <Suspense fallback={<ContentSkeleton />}>
        <CompetitorsContent />
      </Suspense>
    </>
  );
}

async function CompetitorsContent() {
  const c = await getCompetitors();
  const points: Point[] = [
    ...c.rows
      .filter((r) => r.tpa !== null)
      .map((r) => ({ name: r.name, tpa: r.tpa!, chain: r.chain, group: r.bengaluru ? ("bengaluru" as const) : ("other" as const), detail: r.scaleDetail })),
    { name: c.punarnava.name, tpa: c.punarnava.tpa, chain: c.punarnava.chain, group: "us", detail: `${fmtValue(c.outputFig.value, c.outputFig.unit)} pellet output × 12 (${shortSource(c.outputFig.source)})` },
  ];

  return (
    <>
      <SourceKey />
      <StatGrid>
        <Stat label="Companies mapped" value={c.rows.length} hint={<SourceText source="research/03-competitors-investors.md" />} />
        <Stat label="Present in Bengaluru" value={c.rows.filter((r) => r.bengaluru).length} hint={c.rows.filter((r) => r.bengaluru).map((r) => r.name).join(", ")} />
        <Stat label="Scale not published" value={c.rows.filter((r) => r.tpa === null).length} hint="Listed in the table, not plotted" />
        <Stat label="Our planned output" value={`${c.punarnava.tpa.toLocaleString("en-IN")} t/yr`} status={c.outputFig.status} hint={<SourceText source={c.outputFig.source} />} />
      </StatGrid>

      <Section
        title="Positioning"
        description="Scale against where each company mainly sits in the value chain. Scale figures mix actual tonnage, stated capacity and total waste handled (hover a point), so compare orders of magnitude only. The value-chain row is our own classification of R3's descriptions."
      >
        <ChartCard title="Scale (t/yr, log scale) × value-chain position">
          <PositioningChart points={points} chainLabels={c.chainLabel} />
        </ChartCard>
        <Card className="mt-4 text-sm">
          <p className="font-medium">What the map says</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Our planned plant is one to two orders of magnitude smaller than the established recyclers. We would compete on feedstock relationships and pellet quality, not scale.</li>
            <li>Bengaluru&apos;s current players are collectors and service firms: likely feedstock partners rather than direct rivals.</li>
            <li>The exception is Banyan Nation&apos;s reported Bengaluru plant, which would chase the same clean PE/PP feedstock. Its size and timing are a research gap.</li>
          </ul>
        </Card>
      </Section>

      <Section title="Company table" description="Scale is the figure R3 reports, with its type underneath. Status and confidence come from the assumptions file.">
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
        <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Pill tone="warn">Note</Pill> Funding details are R3 summaries of company and investor disclosures; round sizes are left out until verified.
        </p>
      </Section>
    </>
  );
}
