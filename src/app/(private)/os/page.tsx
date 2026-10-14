import { ArrowRight, Boxes } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, Panel } from "@/components/os-shell/page";
import { ContentSkeleton, Pill, Stat, StatGrid } from "@/components/os/ui";
import { getCommand } from "@/lib/data";
import { int, lakh, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Command" };

export default function CommandPage() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Command />
    </Suspense>
  );
}

const levelTone = (l: string) => (l === "Very high" ? "bad" : l === "High" ? "warn" : "neutral") as "bad" | "warn" | "neutral";

async function Command() {
  const d = await getCommand();
  const f = d.finance;
  const [supply, offtake] = d.gates;
  const nothingSigned = d.gates.every((g) => g.current === 0);
  const current = d.progress.find((p) => p.pct < 100) ?? d.progress[d.progress.length - 1];

  return (
    <>
      <PageHeader
        href="/os"
        insight={
          <>
            The plan earns ₹{int(f.ebitdaKg, 1)} a kilo at steady state{" "}
            <span className="text-muted-foreground">{nothingSigned ? "— but no supply or offtake is signed yet." : `— ${pct(supply.current)} of supply is signed.`}</span>
          </>
        }
        status="researched"
        context={`Pre-revenue. ${current.tag} · ${current.name} is under way; the next gate is written supply and offtake agreements.`}
      />

      <StatGrid cols={5}>
        <Stat big label="Funding needed" value={lakh(f.envelope, 0)} hint="Capex + lease deposit + working capital" status="researched" />
        <Stat big label="EBITDA per kg" value={`₹${int(f.ebitdaKg, 1)}`} hint="Steady state, before tax and interest" status="researched" />
        <Stat big label="Cash break-even" value={pct(f.breakevenUtil, 0)} hint="of design throughput" status="researched" />
        <Stat
          big
          label="Tightest cash point"
          value={lakh(f.minCash, 1)}
          hint={`Month ${f.minCashMonth} of 36 — working capital builds up`}
          status={f.cashStatus}
          tone={f.minCash < f.raise * 0.05 ? "bad" : undefined}
        />
        <Stat big label="Supply signed" value={`${pct(supply.current)} / ${pct(supply.target)}`} hint="Written agreements vs the gate" status={supply.currentStatus} tone={supply.current < supply.target ? "bad" : "good"} />
      </StatGrid>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel
          title="Plant status"
          sub={`Not built yet — the digital twin's base case, ${d.plan.inputTpd} t/day input. Bars = machine utilisation over a ${d.plant.days}-day sample run.`}
          action={
            <Link href="/os/factory" className="os-detail inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15">
              <Boxes className="size-3.5" aria-hidden /> Open Factory
            </Link>
          }
        >
          <ol className="grid grid-cols-4 gap-3 lg:grid-cols-8">
            {d.plant.machines.map((m, i) => (
              <li key={m.id} className="flex flex-col gap-2">
                <div className="relative flex h-40 items-end overflow-hidden rounded-xl border border-border/70 bg-foreground/[0.03]">
                  <div className="w-full rounded-b-xl bg-gradient-to-t from-primary/70 to-primary/25" style={{ height: `${Math.max(4, m.utilisationPct ?? 0)}%` }} />
                  <span className="absolute top-2 left-2 font-mono text-[10px] text-muted-foreground">{i + 1}</span>
                </div>
                <p className="text-xs leading-tight">{m.name}</p>
                <p className="font-display text-lg leading-none tabular-nums">{m.utilisationPct === null ? "—" : pct(m.utilisationPct)}</p>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <Pill tone="info">Sample run</Pill>
            <Pill>Yield {d.plant.yieldPct === null ? "—" : pct(d.plant.yieldPct, 1)}</Pill>
            <Pill>Line uptime {d.plant.uptimePct === null ? "—" : pct(d.plant.uptimePct, 1)}</Pill>
            <Pill tone={d.licences.granted === 0 ? "bad" : "neutral"}>
              Licences {d.licences.granted} / {d.licences.total}
            </Pill>
          </div>
        </Panel>

        <Panel title="Phase progress" sub="Each phase is unlocked by a gate, not a date.">
          <ol className="relative flex flex-col gap-4">
            {d.progress.map((p) => {
              const isNow = p.n === current.n;
              return (
                <li key={p.n} className={cn("rounded-xl border p-3.5", isNow ? "border-primary/40 bg-primary/8" : "border-border/60")}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm">
                      <span className="mr-2 text-[11px] tracking-[0.16em] text-primary uppercase">{p.tag}</span>
                      <span className="font-medium">{p.name}</span>
                    </p>
                    <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {p.done}/{p.total} · {p.when}
                    </p>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-foreground/8">
                    <div className={cn("h-full rounded-full", p.pct === 100 ? "bg-status-verified" : "bg-primary")} style={{ width: `${Math.max(p.pct, 2)}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Gate to Phase 2: supply {pct(supply.current)} / ≥{pct(supply.target)} · offtake {pct(offtake.current)} / ≥{pct(offtake.target)} signed.
          </p>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Top 3 risks" sub="Likelihood × impact, as the research rates them." action={<More href="/os/execution/risks" />}>
          <ol className="flex flex-col gap-3">
            {d.risks.map((r, i) => (
              <li key={r.id} className="flex gap-3 rounded-xl border border-border/60 p-3.5">
                <span className="font-display text-2xl leading-none text-muted-foreground">{i + 1}</span>
                <div className="min-w-0">
                  <p className="font-medium">{r.title}</p>
                  <p className="mt-1.5 flex flex-wrap gap-1.5">
                    <Pill tone={levelTone(r.likelihood)}>Likelihood {r.likelihood}</Pill>
                    <Pill tone={levelTone(r.impact)}>Impact {r.impact}</Pill>
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{r.mitigation}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel title="Next 5 actions" sub="Earliest phase first, then priority." action={<More href="/os/execution" />}>
          <ol className="flex flex-col gap-2">
            {d.nextActions.map((t, i) => (
              <li key={t.id} className="flex items-start gap-3 rounded-xl border border-border/60 p-3.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-medium text-primary">{i + 1}</span>
                <p className="min-w-0 flex-1 text-sm font-medium">{t.title}</p>
                <Pill tone={t.priority === "P1" ? "bad" : "neutral"}>{t.priority}</Pill>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </>
  );
}

function More({ href }: { href: string }) {
  return (
    <Link href={href} className="os-detail inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline">
      Open <ArrowRight className="size-3" aria-hidden />
    </Link>
  );
}
