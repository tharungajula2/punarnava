import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailBlock, Details, PageHeader, Panel } from "@/components/os-shell/page";
import { Chart } from "@/components/os/chart";
import { DataTable } from "@/components/os/data-table";
import { ContentSkeleton, SimpleTable, Stat, StatGrid, StatusBadge } from "@/components/os/ui";
import { getFinance } from "@/lib/data";
import { inr, int, lakh, pct } from "@/lib/format";

export const metadata: Metadata = { title: "Finance" };

export default function FinancePage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const f = await getFinance();
  const steady = f.pnl.years[3];
  const sm = f.pnl.steadyMonth;
  const cf = f.cashFlow;
  const beX = Math.round(f.breakeven.util / 5) * 5;

  return (
    <>
      <PageHeader
        href="/os/money/finance"
        insight={
          <>
            We break even at {pct(f.breakeven.util, 0)} utilisation;{" "}
            <span className="text-muted-foreground">
              cash is tightest in month {cf.minCashMonth}, at {lakh(cf.minCash, 1)}.
            </span>
          </>
        }
        status="researched"
        context="Projections based on stated assumptions, using R2's method — not a forecast. No tax, interest or GST timing."
      />

      <StatGrid cols={4}>
        <Stat big label="Funding envelope" value={lakh(f.capex.envelope, 0)} hint={`Capex ${lakh(f.capex.fixed, 0)} (±${f.capex.accuracyPct}%) + deposit + working capital`} status="researched" />
        <Stat big label="EBITDA, steady year" value={lakh(steady.ebitda, 0)} hint={`${pct(steady.marginPct, 1)} margin`} status="researched" />
        <Stat big label="Break-even input" value={`${int(f.breakeven.inputTpd, 1)} t/day`} hint={`${pct(f.breakeven.util, 1)} of design`} status="researched" />
        <Stat
          big
          label="Project payback"
          value={cf.payback ? `Month ${cf.payback}` : "> 36 months"}
          hint="Excluding the raise · R2 practical ≈ 3.5 yrs"
          status={cf.status}
          tone={cf.payback ? undefined : "bad"}
        />
      </StatGrid>

      <Panel className="mt-6" title="36-month cash flow" sub={`₹ lakh · bars = monthly net flow (excl. raise), line = cash balance · ${cf.buildMonths} build months, then production ramps`}>
        <Chart
          ariaLabel="36-month cash flow"
          kind="composed"
          height={320}
          data={cf.rows.map((r) => ({ m: `M${r.month}`, net: r.net - r.equity, cash: r.cash }))}
          xKey="m"
          unit="lakh"
          series={[
            { key: "net", label: "Net flow (excl. raise)", color: "var(--chart-2)", kind: "bar" },
            { key: "cash", label: "Cash balance", color: "var(--chart-1)", kind: "line" },
          ]}
          refX={{ value: `M${cf.buildMonths + 1}`, label: "Production starts" }}
        />
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Break-even" sub="Monthly revenue vs total cost, ₹ lakh, by utilisation">
          <Chart
            ariaLabel="Break-even chart"
            kind="line"
            height={260}
            data={f.breakeven.curve.map((c) => ({ u: `${c.util}%`, revenue: c.revenue, cost: c.cost }))}
            xKey="u"
            unit="lakh"
            series={[
              { key: "revenue", label: "Revenue", color: "var(--chart-1)" },
              { key: "cost", label: "Total cost", color: "var(--chart-4)" },
            ]}
            refX={{ value: `${beX}%`, label: "Break-even" }}
          />
        </Panel>
        <Panel title="Where the capex goes" sub={`₹ lakh · fixed capex ${lakh(f.capex.fixed, 0)}`}>
          <Chart
            ariaLabel="Capex by item"
            height={260}
            data={f.capex.items.map((i) => ({ name: shortCapex[i.id] ?? i.label, amount: i.amount }))}
            xKey="name"
            unit="lakh"
            series={[{ key: "amount", label: "Capex", color: "var(--chart-3)" }]}
          />
        </Panel>
      </div>

      <Details title="Show details — capex, opex, P&L, monthly cash, working capital">
        <DetailBlock title="Capex and funding" note={`Excludes land and GST. Pre-quotation accuracy ±${f.capex.accuracyPct}% (R2).`}>
          <SimpleTable
            minWidth={480}
            head={["Item", "₹ lakh", "Share", ""]}
            rows={[
              ...f.capex.items.map((i) => [i.label, num(i.amount), pct((i.amount / f.capex.fixed) * 100), <StatusBadge key="b" status={i.status} />]),
              [<strong key="t">Fixed capex</strong>, <strong key="v">{num(f.capex.fixed)}</strong>, "", ""],
              ["Refundable lease deposit", num(f.capex.deposit), "", <StatusBadge key="b" status="researched" />],
              ["Working capital", num(f.capex.workingCapital), "", <StatusBadge key="b" status="researched" />],
              [<strong key="t">Funding envelope</strong>, <strong key="v">{num(f.capex.envelope)}</strong>, "", ""],
              ["Raise target (founder to confirm)", num(f.capex.raise), "", <StatusBadge key="b" status={f.capex.raiseStatus} />],
            ]}
          />
        </DetailBlock>
        <DetailBlock title="Monthly operating costs at steady state" note={`${int(sm.outKg / 1000)} t of pellets a month. Variable costs scale with output; fixed costs don't.`}>
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
                  ...lines.map((l) => [l.label, int(l.amount / 1e5, 2), int(l.amount / sm.outKg, 2)]),
                  [<strong key="t">Total {name.toLowerCase()}</strong>, <strong key="a">{int(total / 1e5, 2)}</strong>, <strong key="k">{int(total / sm.outKg, 2)}</strong>],
                ]}
              />
            ))}
          </div>
        </DetailBlock>
        <DetailBlock title="Profit & loss, ₹ lakh / year" note="At R2's utilisation ramp. Depreciation is R2's illustrative figure.">
          <SimpleTable
            minWidth={640}
            head={["", ...f.pnl.years.map((y) => `${y.label} (${pct(y.util * 100)})`)]}
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
        </DetailBlock>
        <DetailBlock
          title="Monthly cash flow"
          note={`Cash at month 36: ${lakh(cf.endCash)}. First month with positive EBITDA: ${cf.firstPositiveEbitda ? `month ${cf.firstPositiveEbitda}` : "beyond 36"}.`}
        >
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
        </DetailBlock>
        <DetailBlock
          title="Working capital at full output"
          note={`R2's holding and payment days. Contribution ${inr(f.breakeven.contributionPerKg, 2)}/kg; fixed costs ${lakh(f.breakeven.fixedMonth)}/month.`}
        >
          <SimpleTable
            minWidth={420}
            head={["Item", "Days", "₹ lakh"]}
            rows={[
              ...f.workingCapital.items.map((i) => [i.label, int(i.days), num(i.amount)]),
              ["Operating cash buffer (fixed costs)", "", num(f.workingCapital.buffer)],
              [<strong key="t">Total</strong>, "", <strong key="v">{num(f.workingCapital.total)}</strong>],
            ]}
          />
        </DetailBlock>
      </Details>
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
