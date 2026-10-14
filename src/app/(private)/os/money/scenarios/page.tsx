import { Boxes } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DetailBlock, Details, PageHeader, Panel, Takeaways } from "@/components/os-shell/page";
import { SourceList } from "@/components/lab/source";
import { Chart } from "@/components/os/chart";
import { ContentSkeleton, Pill, SimpleTable } from "@/components/os/ui";
import { getScenarios } from "@/lib/data/lab";
import { crore, int, lakh, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Scenarios" };

const rs = (n: number) => `${n < 0 ? "−" : ""}₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const signed = (n: number, unit: string) => (n === 0 ? "—" : `${n > 0 ? "+" : "−"}${Math.abs(n)}${unit}`);

export default function ScenariosPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const s = await getScenarios();
  const worst = s.cases.find((c) => c.key === "worst")!;
  const base = s.cases.find((c) => c.key === "base")!;
  const ring = { best: "border-status-verified/40", base: "border-primary/40", worst: "border-destructive/40" } as const;

  return (
    <>
      <PageHeader
        href="/os/money/scenarios"
        insight={
          <>
            All three shocks together turn {rs(base.model.marginKg)} a kilo into {rs(worst.model.marginKg)}.{" "}
            <span className="text-muted-foreground">No single shock sinks the plant.</span>
          </>
        }
        status="researched"
        context={`Feedstock price, yield and pellet price — all adverse, none, or all favourable. Each case is also run for ${s.simDays} days in the simulation.`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {s.cases.map((c) => (
          <section key={c.key} className={cn("flex flex-col gap-4 rounded-2xl border-2 bg-card/70 p-5 shadow-soft backdrop-blur-sm", ring[c.key])}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-2xl">{c.label}</h2>
              {c.key === "base" ? <Pill tone="info">R2 base</Pill> : c.key === "worst" ? <Pill tone="bad">R2 stress test</Pill> : <Pill tone="good">Mirror of R2 stress</Pill>}
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center text-xs">
              <Shock label="Feedstock" value={signed(c.shock.feedPct, "%")} />
              <Shock label="Yield" value={signed(c.shock.yieldPp, " pp")} />
              <Shock label="Pellet price" value={signed(c.shock.pricePct, "%")} />
            </dl>
            <div>
              <p className="text-xs text-muted-foreground">EBITDA per kg</p>
              <p className={cn("font-display text-5xl tabular-nums", c.model.marginKg < 0 && "text-destructive")}>{rs(c.model.marginKg)}</p>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <Row label="Per year" value={crore(c.model.annualEbitda)} bad={c.model.annualEbitda < 0} />
              <Row
                label="Break-even"
                value={c.model.breakevenPct !== null && c.model.breakevenPct <= 100 ? pct(c.model.breakevenPct, 0) : "Never"}
                bad={!(c.model.breakevenPct !== null && c.model.breakevenPct <= 100)}
              />
              <Row label="Payback" value={c.model.paybackYears !== null ? `${c.model.paybackYears.toFixed(1)} yrs` : "Never"} bad={c.model.paybackYears === null} />
            </dl>
            <Link
              href={c.simHref}
              className="os-detail mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
            >
              <Boxes className="size-4" aria-hidden />
              Run this case in the Factory
            </Link>
          </section>
        ))}
      </div>

      <Panel className="mt-6" title={`${s.simDays} days in the simulation`} sub={`Cumulative EBITDA, ₹ lakh · same random seed (${s.seed}) for all three, so only the scenario differs · week 1 is the line filling up`}>
        <Chart
          data={s.series}
          xKey="day"
          unit="lakh"
          kind="line"
          height={300}
          series={[
            { key: "best", label: "Best", color: "var(--status-verified)" },
            { key: "base", label: "Base", color: "var(--chart-1)" },
            { key: "worst", label: "Worst", color: "var(--destructive)" },
          ]}
          refY={{ value: 0, label: "Break-even" }}
          ariaLabel={`Cumulative EBITDA over ${s.simDays} simulated days for the best, base and worst cases`}
        />
      </Panel>

      <Details>
        <DetailBlock title="Reading the cases">
          <Takeaways
            items={[
              "No single shock sinks the plant; all three at once do the damage. That is why contracted feedstock floors and offtake formulas come before saving on machinery.",
              "The best case is as unlikely as the worst — it shows the range, not a target.",
              "EPR income is held at the base price in all three; it is too small to change the picture.",
            ]}
          />
        </DetailBlock>
        <DetailBlock title="Model vs simulation" note="The model is a steady month; the simulation adds breakdowns, shifts and lot-by-lot losses, so small differences are expected.">
          <SimpleTable
            head={["Case", "Margin/kg — model", "Margin/kg — sim", "Sim yield", "Sim EBITDA", "R2 reference"]}
            rows={s.cases.map((c) => [
              <span key="c" className="font-medium">
                {c.label}
              </span>,
              rs(c.model.marginKg),
              c.sim.marginKg !== null ? rs(c.sim.marginKg) : "—",
              c.sim.yieldPct !== null ? pct(c.sim.yieldPct, 1) : "—",
              `${lakh(c.sim.ebitda, 2)} · ${int(c.sim.producedT, 1)} t`,
              c.key === "worst" ? rs(s.research.combined) : c.key === "base" ? rs(s.sources.find((x) => x.id === "ebitda_kg_base")!.value) : "Not in R2",
            ])}
          />
          <SourceList figs={s.sources} />
        </DetailBlock>
      </Details>
    </>
  );
}

function Shock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-foreground/[0.04] p-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
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
