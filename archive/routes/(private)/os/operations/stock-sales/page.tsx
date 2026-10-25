import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailBlock, Details, GateBar, PageHeader, Panel } from "@/components/os-shell/page";
import { Chart } from "@/components/os/chart";
import { DataTable } from "@/components/os/data-table";
import { ContentSkeleton, SampleNotice, SimpleTable, Stat, StatGrid, StatusBadge } from "@/components/os/ui";
import type { Status } from "@/data/assumptions";
import { getInventory, getSales } from "@/lib/data";
import { inr, int, lakh, pct, tonnes } from "@/lib/format";

export const metadata: Metadata = { title: "Stock & Sales" };

export default function StockSalesPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const [s, inv] = await Promise.all([getSales(), getInventory()]);
  const m = s.summary;
  const p = inv.policy;
  const dispatchedKg = s.dispatches.reduce((a, d) => a + d.kg, 0);
  const revenue = s.dispatches.reduce((a, d) => a + d.revenue, 0);

  return (
    <>
      <PageHeader
        href="/os/operations/stock-sales"
        insight={
          <>
            {int(m.outputTMonth)} t of pellets a month to sell at {inr(m.pelletPrice)}/kg —{" "}
            <span className="text-muted-foreground">{pct(m.offtakePct)} is under contract so far.</span>
          </>
        }
        status="researched"
        context={`Our planned price sits below current market quotes and well below virgin resin. Next step: trial samples to ${int(m.sampleConverters)} converters.`}
      />

      <StatGrid cols={4}>
        <Stat big label="Pellets to sell" value={`${int(m.outputTMonth)} t/month`} hint="At steady state" status="researched" />
        <Stat big label="Planned price" value={`${inr(m.pelletPrice)}/kg`} hint="Blended, ex-GST" status="researched" />
        <Stat big label="Finished stock cap" value={`${int(p.finishedDays)} days`} hint={`≈ ${tonnes(p.finishedTargetKg, 0)} · ${int(p.bagKg)} kg bags`} status="researched" />
        <Stat big label={`If price −${pct(m.stressPricePct)}`} value={`₹${int(m.stressPriceEbitda, 2)}/kg`} hint={`EBITDA per kg, from ₹${int(m.baseEbitda, 2)}`} status="researched" />
      </StatGrid>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Panel title="Our price vs the market" sub="₹ per kg · planned price against quotes and virgin resin">
          <Chart
            ariaLabel="Price references"
            height={280}
            data={s.prices.map((x) => ({ name: x.short, price: x.value }))}
            xKey="name"
            unit="count"
            series={[{ key: "price", label: "₹/kg", color: "var(--chart-1)" }]}
          />
        </Panel>
        <Panel title="Offtake gate" sub="Interest is not a contract: written offtake before ordering the line.">
          <GateBar label="Pellet offtake under written agreement" current={m.offtakePct} target={m.gatePct} status="placeholder" />
          <ul className="mt-6 flex flex-col gap-3">
            {s.contractTypes.map((c) => (
              <li key={c.name} className="rounded-xl border border-border/60 p-3 text-sm">
                <p className="font-medium">{c.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Main risk: {c.risk}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-6" title="Stock on site" sub={`Tonnes, every 6 hours · sample ${inv.days}-day run · raw stock capped at ${int(p.rawDays)} days (≈ ${tonnes(p.rawTargetKg, 0)})`}>
        <Chart
          ariaLabel="Stock over time"
          kind="area"
          height={260}
          data={inv.series}
          xKey="label"
          unit="t"
          series={[
            { key: "baleYardT", label: "Bale yard", color: "var(--chart-2)", stack: "a" },
            { key: "wipT", label: "In process", color: "var(--chart-1)", stack: "a" },
            { key: "finishedT", label: "Finished goods", color: "var(--chart-3)", stack: "a" },
          ]}
        />
      </Panel>

      <Details title="Show details — prices, buyers, pipeline, dispatches, stock">
        <DetailBlock title="Price references">
          <SimpleTable
            minWidth={480}
            head={["Reference", "₹ / kg", ""]}
            rows={s.prices.map((x) => [x.ours ? <strong key="l">{x.label} (our plan)</strong> : x.label, int(x.value), <StatusBadge key="s" status={x.status as Status} />])}
          />
        </DetailBlock>
        <DetailBlock title="Buyer segments">
          <SimpleTable minWidth={640} head={["Segment", "Buys", "Note"]} rows={s.segments.map((g) => [<span key="n" className="font-medium">{g.name}</span>, g.buys, g.note])} />
        </DetailBlock>
        <DetailBlock title="Contract types">
          <SimpleTable minWidth={640} head={["Type", "Terms", "Main risk"]} rows={s.contractTypes.map((c) => [<span key="n" className="font-medium">{c.name}</span>, c.terms, c.risk])} />
        </DetailBlock>
        <DetailBlock title="Pipeline">
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
        </DetailBlock>
        <DetailBlock title={`Dispatches — sample ${s.days} days`} note={`${int(s.dispatches.length)} dispatches · ${tonnes(dispatchedKg)} · ${lakh(revenue, 2)} invoiced (pellets + EPR). Outbound load ${int(p.outboundLoadT)} t (placeholder).`}>
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
        </DetailBlock>
        <DetailBlock title={`Stock by stage — end of sample ${inv.days} days`}>
          <DataTable
            caption="Stock by stage"
            rows={inv.stock}
            filterKey="group"
            filterLabel="Filter by stock type"
            minWidth={560}
            columns={[
              { key: "stage", label: "Stage" },
              { key: "group", label: "Type", format: "badge" },
              { key: "kg", label: "On hand", format: "kg", align: "right" },
            ]}
            tones={{ Raw: "warn", "Work in progress": "info", Finished: "good" }}
          />
        </DetailBlock>
      </Details>
    </>
  );
}
