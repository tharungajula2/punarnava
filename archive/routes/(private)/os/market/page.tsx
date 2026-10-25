import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailBlock, Details, PageHeader, Panel, Takeaways } from "@/components/os-shell/page";
import { FigStat, SourceList, SourceText } from "@/components/lab/source";
import { Chart } from "@/components/os/chart";
import { ContentSkeleton, SimpleTable, StatGrid } from "@/components/os/ui";
import { getMarket } from "@/lib/data/lab";
import { fmtValue } from "@/lib/lab/format";

export const metadata: Metadata = { title: "Market" };

export default function MarketPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const m = await getMarket();
  const [india, karnataka, blrHigh, mkt, , pibos, pwps] = m.headline;
  const first = m.mandate[0];
  const last = m.mandate[m.mandate.length - 1];

  return (
    <>
      <PageHeader
        href="/os/market"
        insight={
          <>
            Brands must lift recycled content from {first.pct}% to {last.pct}% by {last.year.replace("+", "")} —{" "}
            <span className="text-muted-foreground">demand is written into the rules.</span>
          </>
        }
        status={m.mandateFigs[0].status}
        context={`India's recycled-plastics market grows about ${fmtValue(m.cagr.value, m.cagr.unit)} a year. Plastic waste isn't scarce; clean, sorted, contracted feedstock is.`}
      />

      <StatGrid cols={4}>
        <FigStat f={india} label="India plastic waste, FY23" />
        <FigStat f={karnataka} label="Karnataka plastic waste, FY23" />
        <FigStat f={blrHigh} label="Bengaluru plastic waste" value={`${fmtValue(m.bengaluruLow.value, "")}–${fmtValue(blrHigh.value, blrHigh.unit)}`} />
        <FigStat f={mkt} label="India recycled-plastics market, 2026" />
      </StatGrid>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Mandatory recycled content" sub="% of plastic in rigid (Category I) packaging, by financial year — the demand driver for rHDPE">
          <Chart data={m.mandate} xKey="year" unit="pct" height={260} series={[{ key: "pct", label: "Recycled content", color: "var(--chart-2)" }]} ariaLabel={`Recycled content obligation rising from ${first.pct}% to ${last.pct}%`} />
        </Panel>
        <Panel title="India recycled-plastics market, US$ billion" sub={`2026 estimate grown at ${fmtValue(m.cagr.value, m.cagr.unit)} — a projection, not a forecast we vouch for`}>
          <Chart data={m.series} xKey="year" unit="count" height={260} series={[{ key: "usdBn", label: "US$ bn", color: "var(--chart-1)" }]} ariaLabel="India recycled-plastics market by year" />
        </Panel>
      </div>

      <Panel className="mt-6" title="Two products, two buyers">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs tracking-[0.16em] text-primary uppercase">Pellets</p>
            <p className="mt-1 font-display text-xl">Converters & compounders</p>
            <p className="mt-1 text-sm text-muted-foreground">{m.buyerSegments[0].buys}. {m.buyerSegments[0].note}</p>
          </div>
          <div className="rounded-xl border border-border/60 p-4">
            <p className="text-xs tracking-[0.16em] text-primary uppercase">EPR certificates</p>
            <p className="mt-1 font-display text-xl">{fmtValue(pibos.value, "")} obligated brands</p>
            <p className="mt-1 text-sm text-muted-foreground">They buy from {fmtValue(pwps.value, "")} registered processors to meet their targets.</p>
          </div>
        </div>
      </Panel>

      <Details title="Show details — buyers, deal structures, caveats, sources">
        <DetailBlock title="Who buys recycled resin">
          <SimpleTable head={["Segment", "What they buy", "Fit for us"]} rows={m.buyerSegments.map((b) => [<span key="s" className="font-medium">{b.segment}</span>, b.buys, b.note])} />
          <SourceText source="research/03-competitors-investors.md" className="mt-2" />
        </DetailBlock>
        <DetailBlock title="How deals are structured">
          <SimpleTable head={["Structure", "Counterparties", "Terms", "Main risk"]} minWidth={720} rows={m.contractStructures.map((c) => [<span key="s" className="font-medium">{c.structure}</span>, c.who, c.terms, c.risk])} />
        </DetailBlock>
        <DetailBlock title="Read the numbers carefully">
          <Takeaways items={[...m.caveats, m.focusNote]} />
        </DetailBlock>
        <DetailBlock title="Sources">
          <SourceList figs={[...m.headline, m.bengaluruLow, m.cagr, m.market2031, ...m.mandateFigs]} />
        </DetailBlock>
      </Details>
    </>
  );
}
