import type { Metadata } from "next";
import { Suspense } from "react";
import { Chart, ChartCard } from "@/components/os/chart";
import { DataTable } from "@/components/os/data-table";
import { ContentSkeleton, SampleNotice, Section, SimLink, Stat, StatGrid } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { getOperations } from "@/lib/data";
import { int, pct, tonnes } from "@/lib/format";

export const metadata: Metadata = { title: "Plant operations" };

export default function OperationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating system · Plant operations"
        title="The line, shift by shift"
        description="Planned shift pattern and line rate, then machine-level utilisation, uptime and energy from a sample run of the plant."
      >
        <SimLink label="Open the plant in 3D" />
      </PageHeader>
      <Suspense fallback={<ContentSkeleton />}>
        <OperationsContent />
      </Suspense>
    </>
  );
}

const statusLabel: Record<string, string> = { running: "Running", idle: "Idle", down: "Down", maintenance: "Planned stop" };

async function OperationsContent() {
  const o = await getOperations();
  const p = o.plan;

  return (
    <>
      <StatGrid>
        <Stat label="Shifts" value={`${int(p.shifts)} × ${int(p.shiftHours)} h`} hint={`${int(p.netLineHours)} productive line-hours/day`} status="researched" />
        <Stat label="Line rate" value={`${int(p.lineRate)} kg/h`} hint={`${int(p.inputTpd)} t/day input`} status="researched" />
        <Stat label="Operating days" value={`${int(p.daysWeek)} / week`} hint={`${int(p.daysMonth)} per month`} status="researched" />
        <Stat label="Planned energy · water" value={`${int(p.kwhPerT)} kWh/t`} hint={`${int(p.waterM3PerT)} m³/t make-up · ETP ${int(p.etpKld)} KLD`} status="researched" />
      </StatGrid>

      <Section title={`Sample run — ${o.days} days`}>
        <SampleNotice />
        <StatGrid cols={6}>
          <Stat label="Tonnes in" value={tonnes(o.kpis.tonnesIn * 1000)} status="sample" />
          <Stat label="Tonnes packed" value={tonnes(o.kpis.tonnesProduced * 1000)} status="sample" />
          <Stat label="Yield" value={o.kpis.yieldPct === null ? "—" : pct(o.kpis.yieldPct, 1)} status="sample" />
          <Stat label="Line uptime" value={o.kpis.uptimePct === null ? "—" : pct(o.kpis.uptimePct, 1)} status="sample" />
          <Stat label="Energy" value={o.kpis.kwhPerT === null ? "—" : `${int(o.kpis.kwhPerT)} kWh/t`} status="sample" />
          <Stat label="Water" value={o.kpis.waterM3PerT === null ? "—" : `${int(o.kpis.waterM3PerT, 1)} m³/t`} status="sample" />
        </StatGrid>

        <div className="mt-4">
          <ChartCard title="Daily throughput" subtitle="Tonnes received vs packed · Sundays off">
            <Chart
              ariaLabel="Daily throughput"
              data={o.daily}
              xKey="label"
              unit="t"
              series={[
                { key: "inT", label: "Received", color: "var(--chart-1)" },
                { key: "producedT", label: "Packed", color: "var(--chart-2)" },
              ]}
            />
          </ChartCard>
        </div>

        <div className="mt-4">
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
          <p className="mt-2 text-xs text-muted-foreground">
            Utilisation = running time ÷ scheduled productive time. QC and packing work on shift hours, so they look less busy. Breakdowns are random (placeholder MTBF/MTTR).
          </p>
        </div>
      </Section>
    </>
  );
}
