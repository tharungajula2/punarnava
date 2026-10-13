import type { Metadata } from "next";
import { Suspense } from "react";
import { Chart, ChartCard } from "@/components/os/chart";
import { DataTable } from "@/components/os/data-table";
import { Card, ContentSkeleton, Progress, SampleNotice, Section, SimLink, SimpleTable, Stat, StatGrid, StatusBadge } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { requireRole } from "@/lib/auth/session";
import { getSales } from "@/lib/data";
import { inr, int, lakh, pct, tonnes } from "@/lib/format";
import type { Status } from "@/data/assumptions";

export const metadata: Metadata = { title: "Sales & buyers" };

export default function SalesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating system · Sales & buyers"
        title="Qualified resin, contracted before the line is ordered"
        description="Buyers are converters and compounders, often steered by a brand. This module tracks segments, the pipeline, price references and dispatches."
      >
        <SimLink label="See dispatches in simulation" />
      </PageHeader>
      <Suspense fallback={<ContentSkeleton />}>
        <SalesContent />
      </Suspense>
    </>
  );
}

async function SalesContent() {
  await requireRole();
  const s = await getSales();
  const m = s.summary;
  const dispatchedKg = s.dispatches.reduce((a, d) => a + d.kg, 0);
  const revenue = s.dispatches.reduce((a, d) => a + d.revenue, 0);

  return (
    <>
      <StatGrid>
        <Stat label="Pellets to sell" value={`${int(m.outputTMonth)} t/month`} hint="At steady state" status="researched" />
        <Stat label="Planned price" value={`${inr(m.pelletPrice)}/kg`} hint="Blended, ex-GST, below current quotes" status="researched" />
        <Stat label="Offtake under agreement" value={pct(m.offtakePct)} hint={`Gate: ≥${pct(m.gatePct)}`} status="placeholder" tone="bad" />
        <Stat label={`If price −${pct(m.stressPricePct)}`} value={`₹${int(m.stressPriceEbitda, 2)}/kg`} hint={`EBITDA per kg, from ₹${int(m.baseEbitda, 2)}`} status="researched" />
      </StatGrid>

      <Section title="Offtake gate" description={`Send trial pellet samples to ${int(m.sampleConverters)} converters, then convert interest into written offtake.`}>
        <Card>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span>Pellet offtake under written agreement</span>
            <span className="font-display text-xl">
              {pct(m.offtakePct)} / ≥{pct(m.gatePct)}
            </span>
          </div>
          <div className="mt-3">
            <Progress value={m.offtakePct} max={m.gatePct} tone="warn" label="Offtake progress" />
          </div>
        </Card>
      </Section>

      <Section title="Price references" description="Where our planned price sits against market quotes and virgin resin.">
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <SimpleTable
            minWidth={480}
            head={["Reference", "₹ / kg", ""]}
            rows={s.prices.map((p) => [
              p.ours ? <strong key="l">{p.label} (our plan)</strong> : p.label,
              <span key="v" className="tabular-nums">{int(p.value)}</span>,
              <StatusBadge key="s" status={p.status as Status} />,
            ])}
          />
          <ChartCard title="₹ per kg" subtitle="Planned price vs references">
            <Chart
              ariaLabel="Price references"
              data={s.prices.map((p) => ({ name: p.short, price: p.value }))}
              xKey="name"
              unit="count"
              series={[{ key: "price", label: "₹/kg", color: "var(--chart-1)" }]}
            />
          </ChartCard>
        </div>
      </Section>

      <Section title="Buyer segments">
        <SimpleTable minWidth={640} head={["Segment", "Buys", "Note"]} rows={s.segments.map((g) => [<span key="n" className="font-medium">{g.name}</span>, g.buys, <span key="x" className="text-muted-foreground">{g.note}</span>])} />
      </Section>

      <Section title="Contract types">
        <ul className="grid gap-3 md:grid-cols-3">
          {s.contractTypes.map((c) => (
            <li key={c.name}>
              <Card className="h-full">
                <p className="font-medium">{c.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.terms}</p>
                <p className="mt-2 text-xs">Main risk: {c.risk}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Pipeline">
        <SampleNotice source="static">No buyers yet. Names are placeholders; areas are illustrative industrial clusters.</SampleNotice>
        <DataTable
          caption="Buyer pipeline"
          rows={s.prospects}
          filterKey="segment"
          filterLabel="Filter by segment"
          minWidth={760}
          columns={[
            { key: "name", label: "Prospect", sub: "area" },
            { key: "segment", label: "Segment" },
            { key: "contract", label: "Likely contract" },
            { key: "stage", label: "Stage", format: "badge" },
          ]}
          tones={{ Identify: "neutral", "Sample sent": "info", Qualifying: "info", LOI: "warn", Contract: "good" }}
        />
      </Section>

      <Section title={`Dispatches — sample ${s.days} days`}>
        <SampleNotice />
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Dispatches" value={int(s.dispatches.length)} status="sample" />
          <Stat label="Tonnes sold" value={tonnes(dispatchedKg)} status="sample" />
          <Stat label="Invoiced (pellets + EPR)" value={lakh(revenue, 2)} status="sample" />
        </div>
        <DataTable
          caption="Dispatches"
          rows={s.dispatches}
          filterKey="buyer"
          filterLabel="Filter by buyer"
          minWidth={680}
          columns={[
            { key: "id", label: "Dispatch" },
            { key: "when", label: "Left plant" },
            { key: "buyer", label: "Buyer" },
            { key: "kg", label: "Weight", format: "kg", align: "right" },
            { key: "revenue", label: "Invoice", format: "inr", align: "right" },
          ]}
          emptyTitle="No dispatches yet"
          emptyBody="Dispatches appear once finished pellets leave the plant."
        />
      </Section>
    </>
  );
}
