import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailBlock, Details, PageHeader, Panel, Takeaways } from "@/components/os-shell/page";
import { SourceList } from "@/components/lab/source";
import { UnitModelTool } from "@/components/lab/unit-model-tool";
import { Waterfall } from "@/components/lab/waterfall";
import { ContentSkeleton, StatusBadge } from "@/components/os/ui";
import { fig, getPricing, getUnitModel } from "@/lib/data/lab";

export const metadata: Metadata = { title: "Unit economics" };

const rs = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function UnitEconomicsPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const [u, p] = await Promise.all([getUnitModel(), getPricing()]);
  const base = fig("ebitda_kg_base");
  const noEpr = fig("ebitda_kg_no_epr");
  const w = p.waterfall;

  return (
    <>
      <PageHeader
        href="/os/money"
        insight={
          <>
            Yes — {rs(base.value)} of EBITDA on every kilo, <span className="text-muted-foreground">and {rs(noEpr.value)} even with no EPR income.</span>
          </>
        }
        status={base.status}
        context="R2's base-case rigid HDPE plant, one kilogram at a time."
      />

      <Panel
        title="From pellet price to profit, per kg"
        sub={`Only ${p.spreads.yieldPct}% of what we buy becomes saleable pellet, so each kg sold carries ${rs(p.spreads.feedPerOut)} of feedstock.`}
        action={<StatusBadge status={base.status} />}
      >
        <Waterfall steps={w.rows} total={w.total} top={w.top} />
      </Panel>

      <h2 className="mt-10 mb-4 font-sans text-sm font-medium text-muted-foreground">Move a price, watch the margin</h2>
      <UnitModelTool base={u.base} sliders={u.sliders} checks={u.checks} />

      <Details>
        <DetailBlock title="How the model works">
          <Takeaways
            items={[
              "Output = input t/day × operating days × yield × utilisation. Feedstock, freight and power scale with input; water, consumables and outbound freight with output.",
              "Fixed each month: labour, rent, overheads, the electricity demand charge and half of maintenance (R2's split).",
              "Break-even = fixed costs ÷ contribution at full capacity. Payback = capex + deposit + working capital ÷ a year of EBITDA.",
              "Not included: tax, interest, GST timing, ramp-up months, sustaining capex, inflation. Money · Finance has the ramp-up.",
            ]}
          />
        </DetailBlock>
        <DetailBlock title="Inputs held fixed">
          <SourceList figs={u.fixed} title="Fixed inputs and their sources" />
        </DetailBlock>
      </Details>
    </>
  );
}
