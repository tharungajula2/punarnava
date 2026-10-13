import type { Metadata } from "next";
import { Suspense } from "react";
import { FigStat, SourceKey, SourceList, SourceText } from "@/components/lab/source";
import { Chart, ChartCard } from "@/components/os/chart";
import { Card, ContentSkeleton, Section, SimpleTable, StatGrid } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { requireRole } from "@/lib/auth/session";
import { getMarket } from "@/lib/data/lab";
import { fmtValue } from "@/lib/lab/format";

export const metadata: Metadata = { title: "Market overview" };

export default function MarketPage() {
  return (
    <>
      <PageHeader
        eyebrow="R&D lab · Market overview"
        title="Plenty of waste, a mandate, and a thin slice we can sell"
        description="How much plastic waste exists, what the recycled-plastics market is worth, why regulation now pulls demand, and who actually buys recycled resin."
      />
      <Suspense fallback={<ContentSkeleton />}>
        <MarketContent />
      </Suspense>
    </>
  );
}

async function MarketContent() {
  await requireRole();
  const m = await getMarket();
  const [india, karnataka, blrHigh, mkt, kaMkt, pibos, pwps, flex] = m.headline;

  return (
    <>
      <SourceKey />
      <StatGrid>
        <FigStat f={india} label="India plastic waste, FY23" />
        <FigStat f={karnataka} label="Karnataka plastic waste, FY23" />
        <FigStat f={blrHigh} label="Bengaluru plastic waste" value={`${fmtValue(m.bengaluruLow.value, "")}–${fmtValue(blrHigh.value, blrHigh.unit)}`} />
        <FigStat f={flex} label="Packaging that is flexible film" />
      </StatGrid>

      <Section title="Market size" description="Recycled-plastics market value. R1 projects the IMARC estimate forward at IMARC's own growth rate; the Karnataka figure is a proxy.">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCard title="India recycled-plastics market, US$ billion" subtitle={`2026 estimate grown at ${fmtValue(m.cagr.value, m.cagr.unit)} — a projection, not a forecast we vouch for`}>
              <Chart data={m.series} xKey="year" unit="count" series={[{ key: "usdBn", label: "US$ bn", color: "var(--chart-1)" }]} height={240} ariaLabel="India recycled-plastics market by year, 2026 to 2031" />
              <SourceList figs={[mkt, m.cagr, m.market2031]} />
            </ChartCard>
          </div>
          <div className="grid gap-3">
            <FigStat f={mkt} label="India market, 2026" />
            <FigStat f={kaMkt} label="Karnataka market, 2026 (proxy)" />
          </div>
        </div>
      </Section>

      <Section title="Why now: the recycled-content mandate" description="Brands must put a rising share of recycled plastic into rigid (Category I) packaging. Food-contact packaging has its own rules, so our non-food rHDPE serves the non-food part of this demand.">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartCard title="Mandatory recycled content, Category I rigid packaging" subtitle="% of plastic in the pack">
              <Chart data={m.mandate} xKey="year" unit="pct" series={[{ key: "pct", label: "Recycled content", color: "var(--chart-2)" }]} height={220} ariaLabel="Recycled content obligation rising from 30% to 60%" />
              <SourceList figs={m.mandateFigs} />
            </ChartCard>
          </div>
          <div className="grid gap-3">
            <FigStat f={pibos} label="Registered producers, importers & brand owners" />
            <FigStat f={pwps} label="Registered plastic processors" />
          </div>
        </div>
      </Section>

      <Section title="Who buys recycled resin" description="Two products from one plant: physical pellets (bought by converters) and EPR certificates (bought by brands). Different buyers, contracts and risks.">
        <SimpleTable
          head={["Segment", "What they buy", "Fit for us"]}
          rows={m.buyerSegments.map((b) => [<span key="s" className="font-medium">{b.segment}</span>, b.buys, <span key="n" className="text-muted-foreground">{b.note}</span>])}
        />
        <SourceText source="research/03-competitors-investors.md" className="mt-2" />
      </Section>

      <Section title="How deals are structured">
        <SimpleTable
          head={["Structure", "Counterparties", "Terms", "Main risk"]}
          minWidth={720}
          rows={m.contractStructures.map((c) => [<span key="s" className="font-medium">{c.structure}</span>, c.who, c.terms, c.risk])}
        />
        <SourceText source="research/03-competitors-investors.md" className="mt-2" />
      </Section>

      <Section title="Read the numbers carefully">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              {m.caveats.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <SourceText source="research/01-market.md" className="mt-3" />
          </Card>
          <Card>
            <p className="font-medium">Why rigid HDPE</p>
            <p className="mt-2 text-sm text-muted-foreground">{m.focusNote}</p>
            <SourceText source="research/02-unit-economics.md" className="mt-3" />
          </Card>
        </div>
      </Section>
    </>
  );
}
