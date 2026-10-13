import { Boxes } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SourceKey, SourceList } from "@/components/lab/source";
import { Chart, ChartCard } from "@/components/os/chart";
import { Card, ContentSkeleton, Pill, Section, SimpleTable } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { requireRole } from "@/lib/auth/session";
import { getScenarios } from "@/lib/data/lab";
import { crore, int, lakh, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Scenario planner" };

const rs = (n: number) => `${n < 0 ? "−" : ""}₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const signed = (n: number, unit: string) => (n === 0 ? "—" : `${n > 0 ? "+" : "−"}${Math.abs(n)}${unit}`);

export default function ScenariosPage() {
  return (
    <>
      <PageHeader
        eyebrow="R&D lab · Scenario planner"
        title="Best, base and worst, side by side"
        description="R2's three shocks — feedstock price, yield and pellet price — all adverse, none, or all favourable. Each case is shown twice: the steady-state unit model, and four weeks of the simulation engine with breakdowns, shifts and payment terms."
      />
      <Suspense fallback={<ContentSkeleton />}>
        <ScenarioContent />
      </Suspense>
    </>
  );
}

async function ScenarioContent() {
  await requireRole();
  const s = await getScenarios();
  const tone = { best: "border-status-verified/40", base: "border-primary/40", worst: "border-destructive/40" } as const;

  return (
    <>
      <SourceKey />
      <div className="grid gap-4 lg:grid-cols-3">
        {s.cases.map((c) => (
          <Card key={c.key} className={cn("flex flex-col gap-4 border-2", tone[c.key])}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-2xl">{c.label}</p>
              {c.key === "base" ? <Pill tone="info">R2 base</Pill> : c.key === "worst" ? <Pill tone="bad">R2 stress test</Pill> : <Pill tone="good">Mirror of R2 stress</Pill>}
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center text-xs">
              <Shock label="Feedstock" value={signed(c.shock.feedPct, "%")} sub={`₹${c.inputs.feedstockPrice.toFixed(2)}/kg`} />
              <Shock label="Yield" value={signed(c.shock.yieldPp, " pp")} sub={`${c.inputs.yieldPct}%`} />
              <Shock label="Pellet price" value={signed(c.shock.pricePct, "%")} sub={`₹${c.inputs.pelletPrice.toFixed(2)}/kg`} />
            </dl>
            <div>
              <p className="text-xs text-muted-foreground">EBITDA per kg (model)</p>
              <p className={cn("font-display text-4xl tabular-nums", c.model.marginKg < 0 && "text-destructive")}>{rs(c.model.marginKg)}</p>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <Row label="EBITDA / year" value={crore(c.model.annualEbitda)} bad={c.model.annualEbitda < 0} />
              <Row label="Break-even" value={c.model.breakevenPct !== null && c.model.breakevenPct <= 100 ? pct(c.model.breakevenPct, 0) : "Not reachable"} bad={!(c.model.breakevenPct !== null && c.model.breakevenPct <= 100)} />
              <Row label="All-in payback" value={c.model.paybackYears !== null ? `${c.model.paybackYears.toFixed(1)} yrs` : "Never"} bad={c.model.paybackYears === null} />
              <Row label="Funding need" value={lakh(c.model.funding, 0)} />
            </dl>
            <div className="rounded-xl bg-muted/50 p-3 text-sm">
              <p className="text-xs font-medium text-muted-foreground">Simulation, days {s.warmupDays + 1}–{s.simDays}</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                <Row label="Margin / kg" value={c.sim.marginKg !== null ? rs(c.sim.marginKg) : "—"} bad={(c.sim.marginKg ?? 0) < 0} />
                <Row label="Yield" value={c.sim.yieldPct !== null ? pct(c.sim.yieldPct, 1) : "—"} />
                <Row label="Pellets made" value={`${int(c.sim.producedT, 1)} t`} />
                <Row label="EBITDA" value={lakh(c.sim.ebitda, 2)} bad={c.sim.ebitda < 0} />
              </dl>
            </div>
            <Link
              href={c.simHref}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
            >
              <Boxes className="size-4" aria-hidden />
              Run this case in the simulation
            </Link>
          </Card>
        ))}
      </div>

      <Section title="Four weeks in the simulation" description={`Cumulative EBITDA (revenue earned minus costs incurred) from a cold start, same random seed (${s.seed}) for all three, so only the scenario differs. The first week is the line filling up.`}>
        <ChartCard title="Cumulative EBITDA, ₹ lakh">
          <Chart
            data={s.series}
            xKey="day"
            unit="lakh"
            kind="line"
            series={[
              { key: "best", label: "Best", color: "var(--status-verified)" },
              { key: "base", label: "Base", color: "var(--chart-1)" },
              { key: "worst", label: "Worst", color: "var(--destructive)" },
            ]}
            refY={{ value: 0, label: "Break-even" }}
            ariaLabel="Cumulative EBITDA over 28 simulated days for the best, base and worst cases"
          />
        </ChartCard>
      </Section>

      <Section title="Model vs simulation" description="The model is a steady month; the simulation adds breakdowns, shift patterns and lot-by-lot losses, so small differences are expected.">
        <SimpleTable
          head={["Case", "Margin/kg — model", "Margin/kg — sim", "R2 reference", "Sim uptime"]}
          rows={s.cases.map((c) => [
            <span key="c" className="font-medium">{c.label}</span>,
            rs(c.model.marginKg),
            c.sim.marginKg !== null ? rs(c.sim.marginKg) : "—",
            c.key === "worst" ? rs(s.research.combined) : c.key === "base" ? rs(s.sources.find((x) => x.id === "ebitda_kg_base")!.value) : "Not in R2",
            c.sim.uptimePct !== null ? pct(c.sim.uptimePct, 1) : "—",
          ])}
        />
        <SourceList figs={s.sources} />
      </Section>

      <Section title="Reading the cases">
        <Card className="text-sm">
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>No single shock sinks the plant; all three at once do. That is why R2 and R3 put contracted feedstock floors and offtake formulas ahead of saving on machinery.</li>
            <li>The best case is as unlikely as the worst — it is here to show the range, not as a target.</li>
            <li>EPR income is held at the base price in all three; it is too small to change the picture (see Pricing).</li>
          </ul>
        </Card>
      </Section>
    </>
  );
}

function Shock({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
      <dd className="text-[11px] text-muted-foreground">{sub}</dd>
    </div>
  );
}

function Row({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("truncate tabular-nums", bad && "text-destructive")}>{value}</dd>
    </div>
  );
}
