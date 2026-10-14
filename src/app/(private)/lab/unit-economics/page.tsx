import type { Metadata } from "next";
import { Suspense } from "react";
import { SourceKey, SourceList } from "@/components/lab/source";
import { UnitModelTool } from "@/components/lab/unit-model-tool";
import { Card, ContentSkeleton, LinkButton, Section } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { getUnitModel } from "@/lib/data/lab";

export const metadata: Metadata = { title: "Unit-economics model" };

export default function UnitEconomicsPage() {
  return (
    <>
      <PageHeader
        eyebrow="R&D lab · Unit-economics model"
        title="Move a price, watch the margin"
        description="R2's base-case rigid HDPE plant, one kilogram at a time. Change prices, yield or utilisation; margin per kg, break-even and payback update instantly. At the base inputs it reproduces R2 and the OS finance model."
      >
        <LinkButton href="/lab/scenarios" label="Best / base / worst" />
      </PageHeader>
      <Suspense fallback={<ContentSkeleton />}>
        <UnitContent />
      </Suspense>
    </>
  );
}

async function UnitContent() {
  const u = await getUnitModel();
  return (
    <>
      <SourceKey />
      <UnitModelTool base={u.base} sliders={u.sliders} checks={u.checks} />
      <Section title="How the model works">
        <Card className="text-sm">
          <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
            <li>Output = input t/day × operating days × yield × utilisation. Feedstock, freight and electricity scale with input; water, consumables and outbound freight with output.</li>
            <li>Fixed each month: labour, rent, overheads, the electricity demand charge and half of maintenance (R2&apos;s split).</li>
            <li>Break-even = fixed costs ÷ contribution at full capacity. Payback = capex + lease deposit + working capital, divided by a year of EBITDA at the chosen utilisation.</li>
            <li>Not included: tax, interest, GST timing, ramp-up months, sustaining capex, price inflation. R2&apos;s practical payback including ramp-up is longer — see OS · Finance.</li>
          </ul>
        </Card>
        <SourceList figs={u.fixed} title="Inputs held fixed in the model" />
      </Section>
    </>
  );
}
