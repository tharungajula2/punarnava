import type { Metadata } from "next";
import { Suspense } from "react";
import { Details, PageHeader, Panel } from "@/components/os-shell/page";
import { Chart } from "@/components/os/chart";
import { DataTable } from "@/components/os/data-table";
import { ContentSkeleton, Stat, StatGrid } from "@/components/os/ui";
import { getHiring } from "@/lib/data";
import { inr, int, lakh } from "@/lib/format";

export const metadata: Metadata = { title: "Hiring" };

export default function HiringPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const h = await getHiring();
  const matches = Math.round(h.payroll) === Math.round(h.checks.labourMonth);
  const byRole = [...h.rows].sort((a, b) => b.totalMonth - a.totalMonth).map((r) => ({ role: r.title, cost: r.totalMonth }));

  return (
    <>
      <PageHeader
        href="/os/execution/hiring"
        insight={
          <>
            {h.headcount} people run the plant{" "}
            <span className="text-muted-foreground">for {lakh(h.payroll, 1)} a month, fully loaded.</span>
          </>
        }
        status="researched"
        context="Core team joins before production so the line can be commissioned. Founder roles are not listed — no salaries are assumed for the founding team."
      />

      <StatGrid cols={4}>
        <Stat big label="Plant headcount" value={`${h.headcount} FTE`} hint={h.headcount === h.checks.employees ? `Matches R2 (${h.checks.employees} FTE)` : "Check against R2"} status="researched" />
        <Stat big label="Monthly payroll" value={lakh(h.payroll, 2)} hint={matches ? "Matches the finance model" : "Differs from the finance model"} status="researched" />
        <Stat big label="Annual payroll" value={lakh(h.payroll * 12, 0)} status="researched" />
        <Stat big label="At expansion" value={`${h.expansion.headcount} FTE`} hint={`Adds a plant manager (${inr(h.expansion.managerCost)}/month)`} status="researched" />
      </StatGrid>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Headcount build-up" sub="FTE on payroll around the production start">
          <Chart
            ariaLabel="Headcount build-up"
            height={280}
            data={h.timeline}
            xKey="label"
            unit="count"
            series={[
              { key: "core", label: "Core team", color: "var(--chart-1)", stack: "a" },
              { key: "line", label: "Line crew", color: "var(--chart-2)", stack: "a" },
            ]}
          />
        </Panel>
        <Panel title="Where the payroll goes" sub="₹ lakh a month by role, loaded cost">
          <Chart ariaLabel="Payroll by role" height={280} data={byRole} xKey="role" unit="lakh" series={[{ key: "cost", label: "Per month", color: "var(--chart-3)" }]} />
        </Panel>
      </div>

      <Details title="Show details — roles, costs, timing" count={h.rows.length}>
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
        <ul className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
          {h.timeline.map((t) => (
            <li key={t.label} className="flex justify-between gap-3 rounded-xl border border-border/60 px-3 py-2">
              <span className="text-muted-foreground">{t.label === "Start" ? "Production start" : t.label}</span>
              <span className="tabular-nums">
                {int(t.core + t.line)} FTE · {lakh(t.payroll, 2)}
              </span>
            </li>
          ))}
        </ul>
      </Details>
    </>
  );
}
