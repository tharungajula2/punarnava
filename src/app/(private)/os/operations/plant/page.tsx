import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailBlock, Details, Flow, PageHeader, Panel } from "@/components/os-shell/page";
import { Chart } from "@/components/os/chart";
import { DataTable } from "@/components/os/data-table";
import { ContentSkeleton, SimpleTable, Stat, StatGrid, StatusBadge } from "@/components/os/ui";
import { getOperations, getQuality } from "@/lib/data";
import { int, pct } from "@/lib/format";

export const metadata: Metadata = { title: "Plant" };

const statusLabel: Record<string, string> = { running: "Running", idle: "Idle", down: "Down", maintenance: "Planned stop" };

export default function PlantPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const [o, q] = await Promise.all([getOperations(), getQuality()]);
  const p = o.plan;
  const b = q.budget;

  return (
    <>
      <PageHeader
        href="/os/operations/plant"
        insight={
          <>
            {pct(b.yieldPct)} of what goes in comes out as pellets,{" "}
            <span className="text-muted-foreground">at {int(p.kwhPerT)} kWh per tonne.</span>
          </>
        }
        status="researched"
        context={`Sample run: ${o.kpis.uptimePct === null ? "—" : pct(o.kpis.uptimePct, 1)} line uptime and ${o.kpis.yieldPct === null ? "—" : pct(o.kpis.yieldPct, 1)} yield over ${o.days} simulated days, with random breakdowns.`}
      />

      <StatGrid cols={4}>
        <Stat big label="Line rate" value={`${int(p.lineRate)} kg/h`} hint={`${int(p.inputTpd)} t/day input`} status="researched" />
        <Stat big label="Shifts" value={`${int(p.shifts)} × ${int(p.shiftHours)} h`} hint={`${int(p.daysWeek)} days a week · ${int(p.netLineHours)} productive h/day`} status="researched" />
        <Stat big label="Water make-up" value={`${int(p.waterM3PerT)} m³/t`} hint={`ETP ${int(p.etpKld)} KLD`} status="researched" />
        <Stat big label={`If yield −${int(b.stressYieldPp)} points`} value={`₹${int(b.stressYieldEbitda, 2)}/kg`} hint={`EBITDA per kg, from ₹${int(b.baseEbitda, 2)}`} status="researched" />
      </StatGrid>

      <Panel className="mt-6" title="Where the input goes" sub="% of every kg bought · yield is the single biggest lever on margin">
        <div className="flex h-14 w-full overflow-hidden rounded-xl" role="img" aria-label={`Of input: ${pct(b.yieldPct)} pellets, ${b.rows.map((r) => `${pct(r.pct)} ${r.stage}`).join(", ")}`}>
          <div className="flex items-center bg-chart-1 px-4 text-sm font-medium text-primary-foreground" style={{ width: `${b.yieldPct}%` }}>
            Pellets {pct(b.yieldPct)}
          </div>
          {b.rows.map((r, i) => (
            <div key={r.stage} style={{ width: `${r.pct}%`, background: `var(--chart-${i + 2})` }} title={`${r.stage}: ${pct(r.pct)}`} />
          ))}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          {b.rows.map((r, i) => (
            <li key={r.stage} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: `var(--chart-${i + 2})` }} aria-hidden />
              {r.stage} · <span className="text-foreground tabular-nums">{pct(r.pct)}</span> <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Machine utilisation" sub={`Running time ÷ scheduled time · sample ${o.days} days · QC and packing work shift hours, so look less busy`}>
          <Chart
            ariaLabel="Machine utilisation"
            height={280}
            data={o.machines.map((m) => ({ name: m.name.replace("Float-sink wash line", "Wash line"), u: m.utilisationPct }))}
            xKey="name"
            unit="pct"
            series={[{ key: "u", label: "Utilisation", color: "var(--chart-1)" }]}
          />
        </Panel>
        <Panel title="Daily throughput" sub="Tonnes received vs packed · sample run · Sundays off">
          <Chart
            ariaLabel="Daily throughput"
            height={280}
            data={o.daily}
            xKey="label"
            unit="t"
            series={[
              { key: "inT", label: "Received", color: "var(--chart-3)" },
              { key: "producedT", label: "Packed", color: "var(--chart-1)" },
            ]}
          />
        </Panel>
      </div>

      <Details title="Show details — machines, quality checks, pellet spec, lots">
        <DetailBlock title="Machines in the sample run" note="Breakdowns are random (placeholder MTBF/MTTR).">
          <DataTable
            caption="Machines"
            rows={o.machines.map((m) => ({ ...m, statusLabel: statusLabel[m.status] ?? m.status }))}
            searchPlaceholder="Search machine…"
            minWidth={900}
            columns={[
              { key: "name", label: "Machine", sub: "role", className: "max-w-xs" },
              { key: "utilisationPct", label: "Utilisation", format: "pct", align: "right" },
              { key: "uptimePct", label: "Uptime", format: "pct", align: "right" },
              { key: "processedKg", label: "Processed", format: "t", align: "right" },
              { key: "kwhPerT", label: "kWh / t", format: "int", align: "right" },
              { key: "breakdowns", label: "Breakdowns", format: "int", align: "right" },
              { key: "statusLabel", label: "End of run", format: "badge" },
            ]}
            tones={{ Running: "good", Idle: "neutral", Down: "bad", "Planned stop": "warn" }}
          />
        </DetailBlock>
        <DetailBlock title="In-process quality checkpoints" note={`QC hold per lot: ${int(b.qcHoldHours)} h (placeholder). Expansion needs ≥${pct(b.expansionGate)} sustained yield.`}>
          <Flow steps={q.checkpoints.map((c) => ({ title: c.stage, body: c.check }))} />
        </DetailBlock>
        <DetailBlock title="Pellet specification" note="What buyers contract on. Limits are agreed per grade with each buyer — none are assumed here.">
          <SimpleTable minWidth={640} head={["Parameter", "Why it matters", "Target"]} rows={q.spec.map((s) => [<span key="p" className="font-medium">{s.parameter}</span>, s.why, s.target])} />
        </DetailBlock>
        <DetailBlock title={`Lot results — sample ${q.days} days`} note="Yield per lot is engine output; lab values (MFI, moisture, ash) are not simulated.">
          <DataTable
            caption="Lot results"
            rows={q.lots}
            filterKey="stage"
            filterLabel="Filter by stage"
            searchPlaceholder="Search lot or source…"
            minWidth={860}
            columns={[
              { key: "id", label: "Lot" },
              { key: "point", label: "Source" },
              { key: "received", label: "Received" },
              { key: "kgIn", label: "In", format: "kg", align: "right" },
              { key: "kgPacked", label: "Packed", format: "kg", align: "right" },
              { key: "yieldPct", label: "Yield", format: "pct", align: "right" },
              { key: "qcHoursAfterReceipt", label: "Hours to QC release", format: "dec1", align: "right" },
              { key: "stage", label: "Stage", format: "badge" },
            ]}
            tones={{ Dispatched: "good", Packed: "info", "QC released": "info", Received: "neutral" }}
          />
        </DetailBlock>
      </Details>
    </>
  );
}
