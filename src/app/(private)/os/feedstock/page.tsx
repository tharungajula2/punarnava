import type { Metadata } from "next";
import { Suspense } from "react";
import { DataTable } from "@/components/os/data-table";
import { Card, ContentSkeleton, Pill, Progress, SampleNotice, Section, SimLink, Stat, StatGrid, type Tone } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { requireRole } from "@/lib/auth/session";
import { getFeedstock } from "@/lib/data";
import { inr, int, pct, tonnes } from "@/lib/format";

export const metadata: Metadata = { title: "Feedstock & suppliers" };

export default function FeedstockPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating system · Feedstock & suppliers"
        title="Clean rigid HDPE, at the right price, every week"
        description="Feedstock is the strategic bottleneck: city-wide waste totals don't say how much clean HDPE is buyable. This module tracks grades, channels and the supplier register."
      >
        <SimLink label="See collection in simulation" />
      </PageHeader>
      <Suspense fallback={<ContentSkeleton />}>
        <FeedstockContent />
      </Suspense>
    </>
  );
}

const acceptTone: Record<string, Tone> = { Accept: "good", "Keep separate": "info", Exclude: "bad" };

async function FeedstockContent() {
  await requireRole();
  const f = await getFeedstock();
  const s = f.summary;

  return (
    <>
      <StatGrid>
        <Stat label="Feed needed" value={tonnes(s.monthlyInputKg, 0)} hint={`per month (${int(s.dailyInputT)} t/day)`} status="researched" />
        <Stat label="Landed cost" value={`${inr(s.landedKg, 2)}/kg`} hint={`${inr(s.priceKg)} ex-source + ${inr(s.freightKg, 2)} freight`} status={s.priceStatus} />
        <Stat label="Under written agreement" value={pct(s.contractedPct)} hint={`Gate: ≥${pct(s.gatePct)} before ordering the line`} status="placeholder" tone="bad" />
        <Stat label="If feed costs +" value={`${pct(s.stressFeedPct)} → ₹${int(s.stressFeedEbitda, 2)}/kg`} hint={`EBITDA per kg, from ₹${int(s.baseEbitda, 2)}`} status="researched" />
      </StatGrid>

      <Section title="Contracting gate" description={`Run a ${int(s.trialWeeks)}-week live procurement trial, then sign agreements for most of the first year's supply.`}>
        <Card>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span>Feedstock under written agreement</span>
            <span className="font-display text-xl">
              {pct(s.contractedPct)} / ≥{pct(s.gatePct)}
            </span>
          </div>
          <div className="mt-3">
            <Progress value={s.contractedPct} max={s.gatePct} tone="warn" label="Feedstock contracting progress" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Context: Bengaluru generates an estimated {int(s.cityLowTpd)}–{int(s.cityHighTpd)} t/day of plastic waste in total; our plant needs {int(s.dailyInputT)} t/day of one clean grade.
          </p>
        </Card>
      </Section>

      <Section title="Feedstock grades" description="What we buy, what we keep apart, and what we refuse.">
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {f.grades.map((g) => (
            <li key={g.id}>
              <Card className="flex h-full flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{g.name}</p>
                  <Pill tone={acceptTone[g.acceptLabel]}>{g.acceptLabel}</Pill>
                </div>
                <p className="text-sm text-muted-foreground">{g.examples}</p>
                <p className="text-sm">{g.why}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Sourcing channels" description="Organise the collectors already doing the work rather than replace them.">
        <ul className="grid gap-3 sm:grid-cols-2">
          {f.channels.map((c) => (
            <li key={c.name} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-medium">{c.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.note}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Supplier register">
        <SampleNotice source="static">
          No suppliers yet. These rows mirror the simulation&apos;s sample collection points so the structure (KYC, agreement, share of supply) is ready; names are placeholders and areas are illustrative.
        </SampleNotice>
        <DataTable
          caption="Supplier register"
          rows={f.suppliers}
          filterKey="type"
          filterLabel="Filter by supplier type"
          minWidth={900}
          columns={[
            { key: "name", label: "Supplier", sub: "area" },
            { key: "type", label: "Type" },
            { key: "stage", label: "Stage", format: "badge" },
            { key: "kyc", label: "KYC", format: "badge" },
            { key: "agreement", label: "Agreement", format: "badge" },
            { key: "shareOfSupply", label: "Share of supply", format: "pct", align: "right" },
            { key: "monthlyKg", label: "Planned / month", format: "t", align: "right" },
          ]}
          tones={{ Prospect: "info", "Not started": "warn", None: "bad" }}
        />
      </Section>
    </>
  );
}
