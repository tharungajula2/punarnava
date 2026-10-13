import type { Metadata } from "next";
import { Suspense } from "react";
import { Chart, ChartCard } from "@/components/os/chart";
import { DataTable } from "@/components/os/data-table";
import { Card, ContentSkeleton, Section, Stat, StatGrid } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { requireRole } from "@/lib/auth/session";
import { getHiring } from "@/lib/data";
import { inr, int, lakh } from "@/lib/format";

export const metadata: Metadata = { title: "Hiring plan" };

export default function HiringPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating system · Hiring plan"
        title="Who we hire, when, and what it costs"
        description="R2's two-shift roster for the 5 t/day plant, with employer-loaded monthly costs. Timing is relative to the first production day and is a placeholder until the build plan is fixed."
      />
      <Suspense fallback={<ContentSkeleton />}>
        <HiringContent />
      </Suspense>
    </>
  );
}

async function HiringContent() {
  await requireRole();
  const h = await getHiring();
  const matches = Math.round(h.payroll) === Math.round(h.checks.labourMonth);

  return (
    <>
      <StatGrid>
        <Stat label="Plant headcount" value={`${h.headcount} FTE`} hint={h.headcount === h.checks.employees ? `Matches R2 (${h.checks.employees} FTE)` : "Check against R2"} status="researched" />
        <Stat label="Monthly payroll (loaded)" value={lakh(h.payroll, 2)} hint={matches ? "Matches the finance model" : "Differs from labour_month"} status="researched" />
        <Stat label="Annual payroll" value={lakh(h.payroll * 12)} status="researched" />
        <Stat label="At 10 t/day" value={`${h.expansion.headcount} FTE`} hint={`Adds a plant manager (${inr(h.expansion.managerCost)}/month)`} status="researched" />
      </StatGrid>

      <Section title="Roles" description="Search or filter by team. Founder roles are not listed — no salaries or titles are assumed for the founding team.">
        <DataTable
          caption="Hiring plan roles"
          rows={h.rows.map((r) => ({ ...r, statusLabel: r.status === "placeholder" ? "Timing placeholder" : "Researched" }))}
          filterKey="group"
          filterLabel="Filter by team"
          minWidth={900}
          columns={[
            { key: "title", label: "Role", sub: "duties", className: "max-w-xs" },
            { key: "group", label: "Team", format: "badge" },
            { key: "count", label: "Count", format: "int", align: "right" },
            { key: "costMonth", label: "Cost / FTE / month", format: "inr", align: "right" },
            { key: "totalMonth", label: "Total / month", format: "inr", align: "right" },
            { key: "when", label: "When" },
            { key: "statusLabel", label: "Status", format: "badge" },
          ]}
          tones={{ "Core team": "info", "Line crew": "neutral", "Timing placeholder": "warn", Researched: "neutral" }}
        />
      </Section>

      <Section title="Headcount build-up" description="People on payroll in the months around the production start.">
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <ChartCard title="Headcount by team" subtitle="FTE on payroll">
            <Chart
              ariaLabel="Headcount build-up"
              data={h.timeline}
              xKey="label"
              unit="count"
              series={[
                { key: "core", label: "Core team", color: "var(--chart-1)", stack: "a" },
                { key: "line", label: "Line crew", color: "var(--chart-2)", stack: "a" },
              ]}
            />
          </ChartCard>
          <Card>
            <p className="font-medium">Payroll by month</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {h.timeline.map((t) => (
                <li key={t.label} className="flex justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
                  <span className="text-muted-foreground">{t.label === "Start" ? "Production start" : t.label}</span>
                  <span className="tabular-nums">
                    {int(t.core + t.line)} FTE · {lakh(t.payroll, 2)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>
    </>
  );
}
