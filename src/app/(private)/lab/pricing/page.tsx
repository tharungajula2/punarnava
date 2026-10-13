import type { Metadata } from "next";
import { Suspense } from "react";
import { RangeChart, type RangeRow } from "@/components/lab/range-chart";
import { SourceKey, SourceText } from "@/components/lab/source";
import { Card, ContentSkeleton, LinkButton, Section, SimpleTable, Stat, StatGrid, StatusBadge } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { requireRole } from "@/lib/auth/session";
import { getPricing } from "@/lib/data/lab";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pricing intelligence" };

const tone: Record<string, string> = {
  Feedstock: "bg-chart-3",
  "Recycled pellet": "bg-chart-1",
  "Virgin resin": "bg-chart-5",
  "EPR certificate": "bg-chart-2",
};
const rs = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="R&D lab · Pricing intelligence"
        title="The spread is the business"
        description="What feedstock, recycled pellets, virgin resin and EPR certificates sell for — and how little of the headline gap survives yield and costs. There is no exchange price for any of these; every band below is a listing, quote or planning range."
      >
        <LinkButton href="/lab/unit-economics" label="Try the unit model" />
      </PageHeader>
      <Suspense fallback={<ContentSkeleton />}>
        <PricingContent />
      </Suspense>
    </>
  );
}

async function PricingContent() {
  await requireRole();
  const p = await getPricing();
  const toRow = (b: (typeof p.bands)[number]): RangeRow => ({ key: b.key, label: b.label, kind: b.kind, low: b.low, high: b.high, base: b.base, tone: tone[b.group] });
  const materials = p.bands.filter((b) => b.group !== "EPR certificate").map(toRow);
  const epr = p.bands.filter((b) => b.group === "EPR certificate").map(toRow);
  const [virginGap, headline, yieldAdj, ebitda] = p.spreads.rows;

  const { rows: steps, total: running, top } = p.waterfall;

  return (
    <>
      <SourceKey />
      <StatGrid>
        {[virginGap, headline, yieldAdj, ebitda].map((s) => (
          <Stat key={s.key} label={s.label} value={`${rs(s.value)}/kg`} hint={s.note} tone={s.value < 0 ? "bad" : undefined} />
        ))}
      </StatGrid>

      <Section title="Price ladder, ₹ per kg" description="Feedstock at the bottom, virgin resin at the top. Bars are ranges, dots single observations, rings the price our model plans on.">
        <Card>
          <RangeChart rows={materials} max={130} ticks={[0, 25, 50, 75, 100, 125]} ariaLabel="Price ranges for feedstock, recycled pellets and virgin HDPE in rupees per kilogram" />
        </Card>
        <ul className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {Object.entries(tone)
            .filter(([k]) => k !== "EPR certificate")
            .map(([k, c]) => (
              <li key={k} className="flex items-center gap-1.5">
                <span className={cn("size-2.5 rounded-full", c)} aria-hidden />
                {k}
              </li>
            ))}
        </ul>
      </Section>

      <Section title="EPR certificates, ₹ per kg" description="A separate product sold to brands. Certificate-only quotes and managed-compliance packages are not comparable; we plan on the low certificate-only price.">
        <Card>
          <RangeChart rows={epr} max={22} ticks={[0, 5, 10, 15, 20]} ariaLabel="EPR certificate price ranges in rupees per kilogram" />
        </Card>
      </Section>

      <Section
        title="From pellet price to profit, per kg"
        description={`Every kilogram of pellet needs ${rs(p.spreads.feedPerOut)} of feedstock because only ${p.spreads.yieldPct}% of what we buy becomes saleable pellet. R2's cost lines take the rest.`}
      >
        <Card>
          <ol className="flex flex-col gap-2" aria-label="Waterfall from pellet price to EBITDA per kilogram">
            {steps.map((s) => {
              const lo = Math.min(s.start, s.end);
              const hi = Math.max(s.start, s.end);
              return (
                <li key={s.id} className="grid grid-cols-[minmax(0,10rem)_1fr_5.5rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,16rem)_1fr_6rem]">
                  <span className="truncate" title={s.label}>
                    {s.label}
                  </span>
                  <span className="relative h-4 rounded bg-muted/40">
                    <span className={cn("absolute inset-y-0 rounded", s.value >= 0 ? "bg-chart-1" : "bg-destructive/70")} style={{ left: `${(lo / top) * 100}%`, width: `${((hi - lo) / top) * 100}%` }} />
                  </span>
                  <span className={cn("text-right tabular-nums", s.value < 0 && "text-muted-foreground")}>{s.value >= 0 ? "+" : "−"}{rs(Math.abs(s.value))}</span>
                </li>
              );
            })}
            <li className="grid grid-cols-[minmax(0,10rem)_1fr_5.5rem] items-center gap-3 border-t border-border pt-2 text-sm font-medium sm:grid-cols-[minmax(0,16rem)_1fr_6rem]">
              <span>EBITDA per kg</span>
              <span className="relative h-4 rounded bg-muted/40">
                <span className="absolute inset-y-0 left-0 rounded bg-status-verified" style={{ width: `${(running / top) * 100}%` }} />
              </span>
              <span className="text-right tabular-nums">{rs(running)}</span>
            </li>
          </ol>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            Matches R2&apos;s base case of {rs(p.ebitda.value)}/kg <StatusBadge status={p.ebitda.status} /> <SourceText source={p.ebitda.source} />
          </p>
        </Card>
      </Section>

      <Section title="All price points">
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
              {b.low.source}
              {b.low.confidence === "low" ? " · low confidence" : ""}
            </span>,
          ])}
        />
      </Section>

      <Section title="How to use these prices">
        <Card>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {p.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <SourceText source="R1, R2, R3" className="mt-3" />
        </Card>
      </Section>
    </>
  );
}
