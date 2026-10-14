import type { Metadata } from "next";
import { Suspense } from "react";
import { Chart, ChartCard } from "@/components/os/chart";
import { DataTable } from "@/components/os/data-table";
import { Card, ContentSkeleton, LinkButton, Section, SimLink, SimpleTable, Stat, StatGrid, StatusBadge } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { getFinance } from "@/lib/data";
import { inr, int, lakh, pct } from "@/lib/format";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Finance" };

export default function FinancePage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating system · Finance"
        title="Capex, opex, P&L and cash"
        description="Every figure is computed from the assumptions file using R2's method. Projections based on stated assumptions — not a forecast. Tax, interest, GST timing and sustaining capex are not modelled."
      >
        <SimLink label="Stress-test in simulation" />
      </PageHeader>
      <Suspense fallback={<ContentSkeleton />}>
        <FinanceContent />
      </Suspense>
    </>
  );
}

async function FinanceContent() {
  const f = await getFinance();
  const steady = f.pnl.years[3];
  const sm = f.pnl.steadyMonth;
  const cf = f.cashFlow;
  const beX = Math.round(f.breakeven.util / 5) * 5;

  return (
    <>
      <StatGrid cols={6}>
        <Stat label="Fixed capex" value={lakh(f.capex.fixed)} hint={`±${f.capex.accuracyPct}% before vendor quotes`} status="researched" />
        <Stat label="Funding envelope" value={lakh(f.capex.envelope)} hint="Capex + deposit + working capital" status="researched" />
        <Stat label="Raise target" value={lakh(f.capex.raise)} hint="Founder to confirm" status={f.capex.raiseStatus} />
        <Stat label="EBITDA, steady year" value={lakh(steady.ebitda)} hint={`${pct(steady.marginPct, 1)} margin`} status="researched" />
        <Stat label="Cash break-even" value={pct(f.breakeven.util, 1)} hint={`≈ ${int(f.breakeven.inputTpd, 1)} t/day input`} status="researched" />
        <Stat label="Lowest cash (36 months)" value={lakh(cf.minCash)} hint={`Month ${cf.minCashMonth}`} status={cf.status} tone={cf.minCash < cf.raise * 0.05 ? "bad" : undefined} />
      </StatGrid>

      <Section title="Capex breakdown" description={`Fixed project capex excludes land, GST and working capital. Pre-quotation accuracy is ±${f.capex.accuracyPct}% (R2).`}>
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <SimpleTable
            minWidth={480}
            head={["Item", "₹ lakh", "Share", ""]}
            rows={[
              ...f.capex.items.map((i) => [
                i.label,
                <span key="a" className="tabular-nums">{int(i.amount / 1e5, 1)}</span>,
                <ShareBar key="s" value={i.amount} total={f.capex.fixed} />,
                <StatusBadge key="b" status={i.status} />,
              ]),
              [<strong key="t">Fixed capex</strong>, <strong key="v" className="tabular-nums">{int(f.capex.fixed / 1e5, 1)}</strong>, "", ""],
              ["Refundable lease deposit", <span key="d" className="tabular-nums">{int(f.capex.deposit / 1e5, 1)}</span>, "", <StatusBadge key="b" status="researched" />],
              ["Working capital", <span key="w" className="tabular-nums">{int(f.capex.workingCapital / 1e5, 1)}</span>, "", <StatusBadge key="b" status="researched" />],
              [<strong key="t">Funding envelope</strong>, <strong key="v" className="tabular-nums">{int(f.capex.envelope / 1e5, 1)}</strong>, "", ""],
            ]}
          />
          <ChartCard title="Where the capex goes" subtitle="₹ lakh">
            <Chart
              ariaLabel="Capex by item"
              data={f.capex.items.map((i) => ({ name: shortCapex[i.id], amount: i.amount }))}
              xKey="name"
              unit="lakh"
              series={[{ key: "amount", label: "Capex", color: "var(--chart-1)" }]}
            />
          </ChartCard>
        </div>
      </Section>

      <Section title="Monthly operating costs" description={`At steady state: ${int(sm.outKg / 1000)} t of pellets a month. Variable costs scale with output; fixed costs don't.`}>
        <div className="grid gap-4 lg:grid-cols-2">
          {(
            [
              ["Variable", sm.variable, sm.varCost],
              ["Fixed", sm.fixed, sm.fixCost],
            ] as const
          ).map(([name, lines, total]) => (
            <SimpleTable
              key={name}
              minWidth={420}
              head={[`${name} cost`, "₹ L / month", "₹ / kg"]}
              rows={[
                ...lines.map((l) => [l.label, <span key="a" className="tabular-nums">{int(l.amount / 1e5, 2)}</span>, <span key="k" className="tabular-nums">{int(l.amount / sm.outKg, 2)}</span>]),
                [<strong key="t">Total {name.toLowerCase()}</strong>, <strong key="a" className="tabular-nums">{int(total / 1e5, 2)}</strong>, <strong key="k" className="tabular-nums">{int(total / sm.outKg, 2)}</strong>],
              ]}
            />
          ))}
        </div>
      </Section>

      <Section title="Profit & loss" description="Annualised at R2's utilisation ramp. Depreciation is R2's illustrative figure; no tax or interest.">
        <SimpleTable
          minWidth={640}
          head={["₹ lakh / year", ...f.pnl.years.map((y) => `${y.label} (${pct(y.util * 100)})`)]}
          rows={[
            ["Revenue (pellets + EPR)", ...f.pnl.years.map((y) => num(y.revenue))],
            ["Variable costs", ...f.pnl.years.map((y) => num(-y.variable))],
            ["Fixed costs", ...f.pnl.years.map((y) => num(-y.fixed))],
            [<strong key="e">EBITDA</strong>, ...f.pnl.years.map((y) => <strong key={y.label}>{num(y.ebitda)}</strong>)],
            ["EBITDA margin", ...f.pnl.years.map((y) => pct(y.marginPct, 1))],
            ["EBITDA per kg", ...f.pnl.years.map((y) => `₹${int(y.ebitdaPerKg, 2)}`)],
            ["Depreciation", ...f.pnl.years.map((y) => num(-y.depreciation))],
            [<strong key="b">EBIT</strong>, ...f.pnl.years.map((y) => <strong key={y.label}>{num(y.ebit)}</strong>)],
          ]}
        />
      </Section>

      <Section
        title="36-month cash flow"
        description={`Month 1 = site lock and the raise. ${cf.buildMonths} build months (upper bound), then production ramps. Rent starts at lease signing; core staff join before production.`}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Cash at month 36" value={lakh(cf.endCash)} status={cf.status} />
          <Stat label="First month with positive EBITDA" value={cf.firstPositiveEbitda ? `Month ${cf.firstPositiveEbitda}` : "Beyond 36"} />
          <Stat label="Project payback (excl. raise)" value={cf.payback ? `Month ${cf.payback}` : "Beyond 36 months"} hint="R2 practical target ≈ 3.5 years" />
        </div>
        <div className="mt-4">
          <ChartCard title="Cash balance and monthly net cash flow" subtitle="₹ lakh · bars = net flow, line = balance">
            <Chart
              ariaLabel="36-month cash flow"
              kind="composed"
              height={300}
              data={cf.rows.map((r) => ({ m: `M${r.month}`, net: r.net - r.equity, cash: r.cash }))}
              xKey="m"
              unit="lakh"
              series={[
                { key: "net", label: "Net flow (excl. raise)", color: "var(--chart-2)", kind: "bar" },
                { key: "cash", label: "Cash balance", color: "var(--chart-1)", kind: "line" },
              ]}
              refX={{ value: `M${cf.buildMonths + 1}`, label: "Production starts" }}
            />
          </ChartCard>
        </div>
        <div className="mt-4">
          <DataTable
            caption="Monthly cash flow"
            rows={cf.rows.map((r) => ({ ...r, id: r.month, phaseLabel: r.phase === "build" ? "Build" : "Operate" }))}
            filterKey="phaseLabel"
            filterLabel="Filter by phase"
            pageSize={12}
            minWidth={980}
            columns={[
              { key: "month", label: "Month", format: "int" },
              { key: "phaseLabel", label: "Phase", format: "badge" },
              { key: "util", label: "Utilisation", format: "pct", align: "right" },
              { key: "revenue", label: "Revenue", format: "lakh", align: "right" },
              { key: "opex", label: "Opex", format: "lakh", align: "right" },
              { key: "ebitda", label: "EBITDA", format: "lakh", align: "right" },
              { key: "capex", label: "Capex", format: "lakh", align: "right" },
              { key: "wcChange", label: "Δ Working cap.", format: "lakh", align: "right" },
              { key: "equity", label: "Raise in", format: "lakh", align: "right" },
              { key: "net", label: "Net", format: "lakh", align: "right" },
              { key: "cash", label: "Cash", format: "lakh", align: "right" },
            ]}
            tones={{ Build: "warn", Operate: "info" }}
          />
        </div>
      </Section>

      <Section title="Break-even" description="Cash break-even: where contribution from each kg covers the fixed monthly costs.">
        <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
          <div className="grid content-start gap-3">
            <Stat label="Break-even utilisation" value={pct(f.breakeven.util, 1)} hint={`R2 states ${pct(f.breakeven.researchCheck)}`} status="researched" />
            <Stat label="Break-even input" value={`${int(f.breakeven.inputTpd, 2)} t/day`} hint={`${int(f.breakeven.outputT, 1)} t pellets / month`} />
            <Stat label="Fixed costs / month" value={lakh(f.breakeven.fixedMonth)} hint={`Contribution ${inr(f.breakeven.contributionPerKg, 2)} per kg`} />
          </div>
          <ChartCard title="Revenue vs total cost by utilisation" subtitle="₹ lakh per month">
            <Chart
              ariaLabel="Break-even chart"
              kind="line"
              height={280}
              data={f.breakeven.curve.map((c) => ({ u: `${c.util}%`, revenue: c.revenue, cost: c.cost }))}
              xKey="u"
              unit="lakh"
              series={[
                { key: "revenue", label: "Revenue", color: "var(--chart-1)" },
                { key: "cost", label: "Total cost", color: "var(--chart-4)" },
              ]}
              refX={{ value: `${beX}%`, label: "Break-even" }}
            />
          </ChartCard>
        </div>
      </Section>

      <Section title="Working capital at full output" description="R2's holding and payment days. The cash buffer is kept, not spent.">
        <SimpleTable
          minWidth={420}
          head={["Item", "Days", "₹ lakh"]}
          rows={[
            ...f.workingCapital.items.map((i) => [i.label, int(i.days), <span key="a" className="tabular-nums">{int(i.amount / 1e5, 1)}</span>]),
            ["Operating cash buffer (fixed costs)", "", <span key="b" className="tabular-nums">{int(f.workingCapital.buffer / 1e5, 1)}</span>],
            [<strong key="t">Total</strong>, "", <strong key="v" className="tabular-nums">{int(f.workingCapital.total / 1e5, 1)}</strong>],
          ]}
        />
      </Section>

      <Card className="mt-12 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Change any input in src/data/assumptions.ts — every table on this page recalculates.</p>
          <LinkButton href="/admin/assumptions" label="View assumptions" icon={ShieldCheck} />
        </Card>
    </>
  );
}

const shortCapex: Record<string, string> = {
  capex_machinery: "Line",
  capex_civil: "Civil",
  capex_etp: "ETP",
  capex_electrical: "Power",
  capex_handling: "Handling",
  capex_safety_permits: "Fire, permits",
};

const num = (rupees: number) => <span className="tabular-nums">{int(rupees / 1e5, 1)}</span>;

function ShareBar({ value, total }: { value: number; total: number }) {
  const p = total > 0 ? (value / total) * 100 : 0;
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <span className="block h-full rounded-full bg-primary" style={{ width: `${p}%` }} />
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">{pct(p)}</span>
    </span>
  );
}
