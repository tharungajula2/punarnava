import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailBlock, Details, PageHeader, Panel, Takeaways } from "@/components/os-shell/page";
import { RangeChart, type RangeRow } from "@/components/lab/range-chart";
import { ContentSkeleton, SimpleTable, Stat, StatGrid, StatusBadge } from "@/components/os/ui";
import { getPricing } from "@/lib/data/lab";
import { shortSource } from "@/lib/lab/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pricing" };

const tone: Record<string, string> = {
  Feedstock: "bg-chart-3",
  "Recycled pellet": "bg-chart-1",
  "Virgin resin": "bg-chart-5",
  "EPR certificate": "bg-chart-2",
};
const rs = (n: number) => `${n < 0 ? "−" : ""}₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PricingPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const p = await getPricing();
  const toRow = (b: (typeof p.bands)[number]): RangeRow => ({ key: b.key, label: b.label, kind: b.kind, low: b.low, high: b.high, base: b.base, tone: tone[b.group] });
  const materials = p.bands.filter((b) => b.group !== "EPR certificate").map(toRow);
  const epr = p.bands.filter((b) => b.group === "EPR certificate").map(toRow);
  const [virginGap, headline, yieldAdj, ebitda] = p.spreads.rows;

  return (
    <>
      <PageHeader
        href="/os/market/pricing"
        insight={
          <>
            A {rs(headline.value)} spread on paper{" "}
            <span className="text-muted-foreground">shrinks to {rs(yieldAdj.value)} once yield losses are counted.</span>
          </>
        }
        status="researched"
        context={`We plan to sell ${rs(virginGap.value)} below virgin HDPE. There is no exchange price for any of these — every band is a listing, quote or planning range.`}
      />

      <StatGrid cols={4}>
        {[virginGap, headline, yieldAdj, ebitda].map((s) => (
          <Stat key={s.key} big label={s.label.split(":")[0]} value={`${rs(s.value)}/kg`} hint={s.label.split(":")[1]?.trim()} tone={s.value < 0 ? "bad" : undefined} status="researched" />
        ))}
      </StatGrid>

      <Panel className="mt-6" title="Price ladder, ₹ per kg" sub="Feedstock at the bottom, virgin resin at the top · bars are ranges, dots single observations, rings the price we plan on">
        <RangeChart rows={materials} max={130} ticks={[0, 25, 50, 75, 100, 125]} ariaLabel="Price ranges for feedstock, recycled pellets and virgin HDPE in rupees per kilogram" />
        <ul className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {Object.entries(tone)
            .filter(([k]) => k !== "EPR certificate")
            .map(([k, c]) => (
              <li key={k} className="flex items-center gap-1.5">
                <span className={cn("size-2.5 rounded-full", c)} aria-hidden />
                {k}
              </li>
            ))}
        </ul>
      </Panel>

      <Panel className="mt-6" title="EPR certificates, ₹ per kg" sub="Sold to brands. Certificate-only quotes and managed-compliance packages are not comparable; we plan on the low certificate-only price.">
        <RangeChart rows={epr} max={22} ticks={[0, 5, 10, 15, 20]} ariaLabel="EPR certificate price ranges in rupees per kilogram" />
      </Panel>

      <Details title="Show details — every price point, how to use them">
        <DetailBlock title="How to use these prices">
          <Takeaways items={p.notes} />
        </DetailBlock>
        <DetailBlock title="All price points">
          <SimpleTable
            head={["Item", "Low", "High", "Plan", "Status", "Source"]}
            minWidth={760}
            rows={p.bands.map((b) => [
              <span key="l">
                <span className="font-medium">{b.label}</span>
                <span className="block text-xs text-muted-foreground">{b.group}</span>
              </span>,
              `₹${b.low.value}`,
              b.high ? `₹${b.high.value}` : "—",
              b.base ? `₹${b.base.value}` : "—",
              <StatusBadge key="s" status={b.base?.status ?? b.low.status} />,
              <span key="src" className="text-xs text-muted-foreground">
                {shortSource(b.low.source)}
                {b.low.confidence === "low" ? " · low confidence" : ""}
              </span>,
            ])}
          />
        </DetailBlock>
      </Details>
    </>
  );
}
