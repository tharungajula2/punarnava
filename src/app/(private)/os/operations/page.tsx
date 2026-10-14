import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailBlock, Details, Flow, GateBar, PageHeader, Panel } from "@/components/os-shell/page";
import { Chart } from "@/components/os/chart";
import { DataTable } from "@/components/os/data-table";
import { ContentSkeleton, SampleNotice, Stat, StatGrid } from "@/components/os/ui";
import { getFeedstock, getLogistics } from "@/lib/data";
import { inr, int, lakh, pct, tonnes } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Supply" };

export default function SupplyPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

const columns = [
  { key: "Accept", title: "We buy", tone: "border-status-verified/40 bg-status-verified/8", dot: "bg-status-verified" },
  { key: "Keep separate", title: "Keep separate", tone: "border-status-placeholder/40 bg-status-placeholder/8", dot: "bg-status-placeholder" },
  { key: "Exclude", title: "We refuse", tone: "border-destructive/30 bg-destructive/5", dot: "bg-destructive" },
] as const;

async function Content() {
  const [f, l] = await Promise.all([getFeedstock(), getLogistics()]);
  const s = f.summary;
  const byPoint = Object.entries(
    l.trips.reduce<Record<string, number>>((acc, t) => {
      acc[t.point] = (acc[t.point] ?? 0) + t.kg;
      return acc;
    }, {}),
  ).map(([point, kg]) => ({ point: point.replace(" (sample)", ""), t: kg / 1000 }));
  const totalKg = l.trips.reduce((a, t) => a + t.kg, 0);

  return (
    <>
      <PageHeader
        href="/os/operations"
        insight={
          <>
            We need {tonnes(s.monthlyInputKg, 0)} of clean plastic a month —{" "}
            <span className="text-muted-foreground">
              {pct(s.contractedPct)} is signed; the gate is ≥{pct(s.gatePct)}.
            </span>
          </>
        }
        status="placeholder"
        context={`Bengaluru makes an estimated ${int(s.cityLowTpd)}–${int(s.cityHighTpd)} t/day of plastic waste; we need ${int(s.dailyInputT)} t/day of one clean grade. Volume isn't the problem — contracts are.`}
      />

      <StatGrid cols={4}>
        <Stat big label="Feed needed" value={`${int(s.dailyInputT)} t/day`} hint={`${tonnes(s.monthlyInputKg, 0)} a month`} status="researched" />
        <Stat big label="Landed cost" value={`${inr(s.landedKg, 2)}/kg`} hint={`${inr(s.priceKg)} at source + ${inr(s.freightKg, 2)} freight`} status={s.priceStatus} />
        <Stat big label="Collection trucks" value={int(l.fleet.trucks)} hint={`${int(l.fleet.payloadT, 1)} t each · ${int(l.fleet.windowStart)}:00–${int(l.fleet.windowEnd)}:00`} status={l.fleet.planStatus} />
        <Stat big label={`If feed costs +${pct(s.stressFeedPct)}`} value={`₹${int(s.stressFeedEbitda, 2)}/kg`} hint={`EBITDA per kg, from ₹${int(s.baseEbitda, 2)}`} status="researched" />
      </StatGrid>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Panel title="Contracting gate" sub={`Run a ${int(s.trialWeeks)}-week procurement trial, then sign most of year one's supply before ordering the line.`}>
          <GateBar label="Feedstock under written agreement" current={s.contractedPct} target={s.gatePct} status="placeholder" />
          <p className="mt-6 mb-3 text-xs font-medium text-muted-foreground">What goes on the truck</p>
          <div className="grid grid-cols-3 gap-3">
            {columns.map((c) => (
              <div key={c.key} className={cn("rounded-xl border p-3", c.tone)}>
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  <span className={cn("size-2 rounded-full", c.dot)} aria-hidden />
                  {c.title}
                </p>
                <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                  {f.grades
                    .filter((g) => g.acceptLabel === c.key)
                    .map((g) => (
                      <li key={g.id} className="leading-snug">
                        {g.name}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Where the plastic would come from" sub={`Tonnes by collection point · sample ${l.days}-day simulation run · ${tonnes(totalKg)} in ${int(l.trips.length)} trips`} action={<span className="rounded-full border border-primary/30 bg-primary/10 px-1.5 text-[10px] text-primary uppercase">Sample</span>}>
          <Chart ariaLabel="Tonnes by collection point" height={300} data={byPoint} xKey="point" unit="t" series={[{ key: "t", label: "Tonnes", color: "var(--chart-1)" }]} />
        </Panel>
      </div>

      <Details title="Show details — gate process, channels, grades, suppliers, weighbridge log">
        <DetailBlock title="Gate process" note={`Each step leaves a record, so every lot is auditable. Unload + weigh ${int(l.fleet.unloadMin)} min; inbound freight ${inr(l.fleet.freightKg, 2)}/kg.`}>
          <Flow steps={l.gateSteps.map((t) => ({ title: t }))} />
        </DetailBlock>
        <DetailBlock title="Sourcing channels" note="Organise the collectors already doing the work rather than replace them.">
          <ul className="grid gap-3 sm:grid-cols-2">
            {f.channels.map((c) => (
              <li key={c.name} className="rounded-xl border border-border/60 p-3 text-sm">
                <p className="font-medium">{c.name}</p>
                <p className="mt-1 text-muted-foreground">{c.note}</p>
              </li>
            ))}
          </ul>
        </DetailBlock>
        <DetailBlock title="Why each grade is in or out">
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {f.grades.map((g) => (
              <li key={g.id} className="rounded-xl border border-border/60 p-3 text-sm">
                <p className="font-medium">
                  {g.name} <span className="text-xs font-normal text-muted-foreground">· {g.acceptLabel}</span>
                </p>
                <p className="mt-1 text-muted-foreground">{g.examples}</p>
                <p className="mt-1">{g.why}</p>
              </li>
            ))}
          </ul>
        </DetailBlock>
        <DetailBlock title="Supplier register">
          <SampleNotice source="static">No suppliers yet. Rows mirror the simulation&apos;s sample collection points so the structure is ready; names are placeholders.</SampleNotice>
          <DataTable
            caption="Supplier register"
            rows={f.suppliers}
            filterKey="type"
            filterLabel="Filter by supplier type"
            minWidth={900}
            columns={[
              { key: "name", label: "Supplier", sub: "area" },
              { key: "type", label: "Type" },
              { key: "stage", label: "Stage", format: "badge" },
              { key: "kyc", label: "KYC", format: "badge" },
              { key: "agreement", label: "Agreement", format: "badge" },
              { key: "shareOfSupply", label: "Share of supply", format: "pct", align: "right" },
              { key: "monthlyKg", label: "Planned / month", format: "t", align: "right" },
            ]}
            tones={{ Prospect: "info", "Not started": "warn", None: "bad" }}
          />
        </DetailBlock>
        <DetailBlock title={`Weighbridge log — sample ${l.days} days`} note={`Freight cost in the sample: ${lakh(totalKg * l.fleet.freightKg, 2)}.`}>
          <DataTable
            caption="Inbound trips"
            rows={l.trips}
            filterKey="point"
            filterLabel="Filter by collection point"
            searchPlaceholder="Search trip, lot, truck…"
            minWidth={720}
            columns={[
              { key: "id", label: "Trip" },
              { key: "when", label: "Weighed" },
              { key: "point", label: "From" },
              { key: "truck", label: "Truck" },
              { key: "lot", label: "Lot", format: "int" },
              { key: "kg", label: "Net weight", format: "kg", align: "right" },
            ]}
            emptyTitle="No trips recorded"
            emptyBody="Trips appear here once trucks start weighing in."
          />
        </DetailBlock>
      </Details>
    </>
  );
}
