import type { Metadata } from "next";
import { Suspense } from "react";
import { Chart, ChartCard } from "@/components/os/chart";
import { DataTable } from "@/components/os/data-table";
import { Card, ContentSkeleton, Progress, SampleNotice, Section, SimLink, Stat, StatGrid } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { getInventory } from "@/lib/data";
import { int, tonnes } from "@/lib/format";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating system · Inventory"
        title="Stock by stage, from bales to bags"
        description="Inventory is cash and fire load at the same time. The holding policy caps both; the sample run shows how stock actually moves through the line."
      >
        <SimLink label="See stock in simulation" />
      </PageHeader>
      <Suspense fallback={<ContentSkeleton />}>
        <InventoryContent />
      </Suspense>
    </>
  );
}

async function InventoryContent() {
  const d = await getInventory();
  const p = d.policy;
  const sum = (g: string) => d.stock.filter((s) => s.group === g).reduce((a, s) => a + s.kg, 0);
  const raw = sum("Raw");
  const fg = sum("Finished");

  return (
    <>
      <StatGrid>
        <Stat label="Raw-stock policy" value={`${int(p.rawDays)} days`} hint={`≈ ${tonnes(p.rawTargetKg, 0)} of bales at most`} status="researched" />
        <Stat label="Finished-goods policy" value={`${int(p.finishedDays)} days`} hint={`≈ ${tonnes(p.finishedTargetKg, 0)} of pellets`} status="researched" />
        <Stat label="Bag size" value={`${int(p.bagKg)} kg`} status="researched" />
        <Stat label="Outbound truck load" value={`${int(p.outboundLoadT)} t`} hint={`${int((p.outboundLoadT * 1000) / p.bagKg)} bags`} status="placeholder" />
      </StatGrid>

      <Section title={`Stock on hand — end of sample ${d.days} days`}>
        <SampleNotice />
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          {(
            [
              ["Raw stock vs policy cap", raw, p.rawTargetKg],
              ["Finished pellets vs policy cap", fg, p.finishedTargetKg],
            ] as const
          ).map(([label, value, cap]) => (
            <Card key={label}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">{label}</p>
                <p className="font-display text-xl tabular-nums">
                  {tonnes(value)} <span className="text-sm text-muted-foreground">/ {tonnes(cap, 0)}</span>
                </p>
              </div>
              <div className="mt-3">
                <Progress value={value} max={cap} tone={value > cap ? "warn" : "info"} label={label} />
              </div>
            </Card>
          ))}
        </div>
        <DataTable
          caption="Stock by stage"
          rows={d.stock}
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
        <div className="mt-4">
          <ChartCard title="Stock over time" subtitle="Tonnes on site, every 6 hours">
            <Chart
              ariaLabel="Stock over time"
              kind="area"
              data={d.series}
              xKey="label"
              unit="t"
              series={[
                { key: "baleYardT", label: "Bale yard", color: "var(--chart-2)", stack: "a" },
                { key: "wipT", label: "In process", color: "var(--chart-1)", stack: "a" },
                { key: "finishedT", label: "Finished goods", color: "var(--chart-3)", stack: "a" },
              ]}
            />
          </ChartCard>
        </div>
      </Section>
    </>
  );
}
