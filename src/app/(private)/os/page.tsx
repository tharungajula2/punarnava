import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { osModules } from "@/components/os/modules";
import { Card, ContentSkeleton, Pill, Progress, Section, SimLink, Stat, StatGrid } from "@/components/os/ui";
import { PageHeader } from "@/components/private/page-shell";
import { getDashboard } from "@/lib/data";
import { crore, int, lakh, pct } from "@/lib/format";

export const metadata: Metadata = { title: "Operating system" };

export default function OsDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operating system · Dashboard"
        title="Where the business stands"
        description="Punarnava is pre-revenue. Plan figures come from the assumptions file; progress shows what has actually been done against the roadmap and investment gates."
      >
        <SimLink />
      </PageHeader>
      <Suspense fallback={<ContentSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

const levelTone = (l: string) => (l === "Very high" ? "bad" : l === "High" ? "warn" : "neutral") as "bad" | "warn" | "neutral";

async function DashboardContent() {
  const d = await getDashboard();

  return (
    <>
      <StatGrid cols={4}>
        <Stat label="Planned plant input" value={`${int(d.plan.inputTpd)} t/day`} hint={`${d.plan.shifts} shifts · ${d.plan.daysMonth} days/month`} status="researched" />
        <Stat label="Funding envelope" value={lakh(d.finance.envelope)} hint="Capex + deposit + working capital" status="researched" />
        <Stat label="Raise target" value={crore(d.finance.raise)} hint="Founder to confirm" status={d.finance.raiseStatus} />
        <Stat label="EBITDA per kg (steady state)" value={`₹${int(d.finance.ebitdaKg, 2)}`} hint="Before tax and interest" status="researched" />
        <Stat label="Cash break-even" value={pct(d.finance.breakevenUtil, 1)} hint="of design throughput" status="researched" />
        <Stat
          label="Lowest cash in the 36-month plan"
          value={lakh(d.finance.minCash)}
          hint={`Month ${d.finance.minCashMonth} of 36 · working capital builds up`}
          status="placeholder"
          tone={d.finance.minCash < d.finance.raise * 0.05 ? "bad" : undefined}
        />
        <Stat label="Licences granted" value={`${d.licences.granted} / ${d.licences.total}`} hint="None applied for yet" tone="bad" />
        <Stat label="Numbers verified" value={`${d.stats.verified} / ${d.stats.total}`} hint={`${d.stats.placeholder} still placeholders`} tone={d.stats.verified === 0 ? "bad" : undefined} />
      </StatGrid>

      <Section title="Investment gates" description="Phase 1 must hit these before the line is ordered. Today's values are placeholders until the first agreements are signed.">
        <div className="grid gap-3 md:grid-cols-2">
          {d.gates.map((g) => (
            <Card key={g.label}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium">{g.label}</p>
                <p className="font-display text-xl">
                  {pct(g.current)} <span className="text-sm text-muted-foreground">/ ≥{pct(g.target)}</span>
                </p>
              </div>
              <div className="mt-3">
                <Progress value={g.current} max={g.target} tone={g.current >= g.target ? "good" : "warn"} label={g.label} />
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <div className="grid gap-x-8 xl:grid-cols-2">
        <Section title="Roadmap progress" description="Share of each phase's tasks that are done." action={<MoreLink href="/os/roadmap" />}>
          <ol className="flex flex-col gap-3">
            {d.progress.map((p) => (
              <li key={p.n}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p>
                      <span className="text-xs tracking-widest text-primary uppercase">{p.tag}</span> <span className="font-medium">{p.name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.done} of {p.total} {p.total === 1 ? "task" : "tasks"} · {p.when}
                    </p>
                  </div>
                  <div className="mt-2.5">
                    <Progress value={p.pct} label={`${p.tag} progress`} tone={p.pct === 100 ? "good" : "info"} />
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Next 5 actions" description="Earliest phase first, then priority." action={<MoreLink href="/os/roadmap" />}>
          <ol className="flex flex-col gap-2">
            {d.nextActions.map((t, i) => (
              <li key={t.id} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="mt-1 flex flex-wrap gap-1.5">
                    <Pill tone={t.priority === "P1" ? "bad" : "neutral"}>{t.priority}</Pill>
                    <Pill>Phase {t.phase}</Pill>
                    <Pill>{t.module}</Pill>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <Section title="Top risks" description="Ranked by likelihood × impact, as rated in the research reports.">
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {d.risks.map((r) => (
            <li key={r.id}>
              <Card className="flex h-full flex-col gap-2">
                <p className="font-medium">{r.title}</p>
                <p className="flex flex-wrap gap-1.5">
                  <Pill tone={levelTone(r.likelihood)}>Likelihood: {r.likelihood}</Pill>
                  <Pill tone={levelTone(r.impact)}>Impact: {r.impact}</Pill>
                </p>
                <p className="text-sm text-muted-foreground">{r.mitigation}</p>
                <Link href={r.href} className="mt-auto inline-flex items-center gap-1 pt-1 text-sm text-primary underline-offset-4 hover:underline">
                  {r.module} <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Modules">
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {osModules.slice(1).map((m) => (
            <li key={m.href}>
              <Link href={m.href} className="group flex h-full gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <m.icon className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block font-medium group-hover:text-primary">{m.label}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{m.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

    </>
  );
}

function MoreLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
      Open <ArrowRight className="size-3.5" aria-hidden />
    </Link>
  );
}
