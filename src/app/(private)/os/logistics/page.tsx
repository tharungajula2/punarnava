import type { Metadata } from "next";
import { Suspense } from "react";
import { Chart, ChartCard } from "@/components/os/chart";
import { DataTable } from "@/components/os/data-table";
import { Card, ContentSkeleton, SampleNotice, Section, SimLink, Stat, StatGrid } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { getLogistics } from "@/lib/data";
import { inr, int, lakh, tonnes } from "@/lib/format";

export const metadata: Metadata = { title: "Inbound logistics" };

export default function LogisticsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating system · Inbound logistics"
        title="From collection point to weighbridge"
        description="Fleet plan, gate process and every inbound trip. The weighbridge record is the start of traceability — and of every EPR certificate."
      >
        <SimLink label="Watch trucks in simulation" />
      </PageHeader>
      <Suspense fallback={<ContentSkeleton />}>
        <LogisticsContent />
      </Suspense>
    </>
  );
}

async function LogisticsContent() {
  const l = await getLogistics();
  const totalKg = l.trips.reduce((a, t) => a + t.kg, 0);
  const byPoint = Object.entries(
    l.trips.reduce<Record<string, number>>((acc, t) => {
      acc[t.point] = (acc[t.point] ?? 0) + t.kg;
      return acc;
    }, {}),
  ).map(([point, kg]) => ({ point: point.replace(" (sample)", ""), t: kg / 1000 }));
  const byDay = Array.from({ length: l.days }, (_, i) => ({ d: `D${i + 1}`, trips: l.trips.filter((t) => t.day === i + 1).length }));

  return (
    <>
      <StatGrid>
        <Stat label="Collection trucks (plan)" value={int(l.fleet.trucks)} hint={`${int(l.fleet.payloadT, 1)} t payload each`} status={l.fleet.planStatus} />
        <Stat label="Pickup window" value={`${int(l.fleet.windowStart)}:00–${int(l.fleet.windowEnd)}:00`} hint="Last truck dispatched" status={l.fleet.planStatus} />
        <Stat label="Inbound freight" value={`${inr(l.fleet.freightKg, 2)}/kg`} hint="of input" status={l.fleet.freightStatus} />
        <Stat label="Unload + weigh" value={`${int(l.fleet.unloadMin)} min`} hint={`Loading at source ${int(l.fleet.loadMin)} min`} status={l.fleet.planStatus} />
      </StatGrid>

      <Section title="Gate process" description="Each step leaves a record. Together they make the lot auditable.">
        <Card>
          <ol className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
            {l.gateSteps.map((s, i) => (
              <li key={s} className="flex gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Card>
      </Section>

      <Section title={`Weighbridge log — sample ${l.days} days`}>
        <SampleNotice />
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Trips" value={int(l.trips.length)} status="sample" />
          <Stat label="Tonnes received" value={tonnes(totalKg)} status="sample" />
          <Stat label="Freight cost" value={lakh(totalKg * l.fleet.freightKg, 2)} status="sample" />
        </div>
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <ChartCard title="Tonnes by collection point" subtitle={`Sample, ${l.days} days`}>
            <Chart ariaLabel="Tonnes by collection point" data={byPoint} xKey="point" unit="t" series={[{ key: "t", label: "Tonnes", color: "var(--chart-1)" }]} />
          </ChartCard>
          <ChartCard title="Trips per day" subtitle="Sundays are off">
            <Chart ariaLabel="Trips per day" data={byDay} xKey="d" unit="count" series={[{ key: "trips", label: "Trips", color: "var(--chart-2)" }]} />
          </ChartCard>
        </div>
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
      </Section>
    </>
  );
}
