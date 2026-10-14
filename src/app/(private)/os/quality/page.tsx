import type { Metadata } from "next";
import { Suspense } from "react";
import { Chart, ChartCard } from "@/components/os/chart";
import { DataTable } from "@/components/os/data-table";
import { Card, ContentSkeleton, SampleNotice, Section, SimLink, SimpleTable, Stat, StatGrid, StatusBadge } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { getQuality } from "@/lib/data";
import { int, pct } from "@/lib/format";

export const metadata: Metadata = { title: "Quality" };

export default function QualityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating system · Quality"
        title="Sell against a data sheet, not a polymer name"
        description="Yield is a board-level number: every point lost is margin lost. This module holds the loss budget, the pellet specification, in-process checkpoints and lot results."
      >
        <SimLink label="Try contamination in simulation" />
      </PageHeader>
      <Suspense fallback={<ContentSkeleton />}>
        <QualityContent />
      </Suspense>
    </>
  );
}

async function QualityContent() {
  const q = await getQuality();
  const b = q.budget;
  const released = q.lots.filter((l) => l.yieldPct !== null);

  return (
    <>
      <StatGrid>
        <Stat label="Planned yield" value={pct(b.yieldPct)} hint="Saleable pellets per kg in" status="researched" />
        <Stat label="Yield needed to expand" value={`≥${pct(b.expansionGate)}`} hint="Sustained (R2 gate)" status="researched" />
        <Stat label={`If yield −${int(b.stressYieldPp)} points`} value={`₹${int(b.stressYieldEbitda, 2)}/kg`} hint={`EBITDA per kg, from ₹${int(b.baseEbitda, 2)}`} status="researched" />
        <Stat label="QC hold per lot" value={`${int(b.qcHoldHours)} h`} hint="Sampling + lab test" status="placeholder" />
      </StatGrid>

      <Section title="Loss budget" description="Where the input goes that doesn't become pellets.">
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <SimpleTable
            minWidth={420}
            head={["Stage", "% of input", ""]}
            rows={[
              ...b.rows.map((r) => [r.stage, <span key="p" className="tabular-nums">{pct(r.pct)}</span>, <StatusBadge key="s" status={r.status} />]),
              [<strong key="y">Saleable pellets</strong>, <strong key="v" className="tabular-nums">{pct(b.yieldPct)}</strong>, ""],
            ]}
          />
          <ChartCard title="Input → output" subtitle="% of input">
            <Chart
              ariaLabel="Loss budget"
              data={[{ name: "Input", yield: b.yieldPct, ...Object.fromEntries(b.rows.map((r, i) => [`l${i}`, r.pct])) }]}
              xKey="name"
              unit="pct"
              height={220}
              series={[
                { key: "yield", label: "Pellets", color: "var(--chart-1)", stack: "a" },
                ...b.rows.map((r, i) => ({ key: `l${i}`, label: r.stage, color: `var(--chart-${i + 2})`, stack: "a" })),
              ]}
            />
          </ChartCard>
        </div>
      </Section>

      <Section title="Pellet specification" description="Parameters buyers contract on (R2, R3). Limits are agreed per grade with each buyer — none are assumed here.">
        <SimpleTable minWidth={640} head={["Parameter", "Why it matters", "Target"]} rows={q.spec.map((s) => [<span key="p" className="font-medium">{s.parameter}</span>, s.why, <span key="t" className="text-muted-foreground">{s.target}</span>])} />
      </Section>

      <Section title="In-process checkpoints">
        <Card>
          <ol className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {q.checkpoints.map((c, i) => (
              <li key={c.stage} className="flex gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{i + 1}</span>
                <span>
                  <span className="block font-medium">{c.stage}</span>
                  <span className="text-muted-foreground">{c.check}</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </Section>

      <Section title={`Lot results — sample ${q.days} days`}>
        <SampleNotice>
          Lots are truckloads from the base-case simulation. Yield per lot is real engine output; lab test values (MFI, moisture, ash) are not simulated and will be recorded once a lab exists.
        </SampleNotice>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Lots" value={int(q.lots.length)} status="sample" />
          <Stat label="Packed lots" value={int(released.length)} status="sample" />
          <Stat label="Overall yield" value={q.sampleLosses.yieldPct === null ? "—" : pct(q.sampleLosses.yieldPct, 1)} status="sample" />
        </div>
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
      </Section>
    </>
  );
}
