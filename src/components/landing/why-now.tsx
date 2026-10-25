import { FigureNote } from "@/components/landing/figures/figure-note";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { whyNow } from "@/data/landing";

// Chart geometry (viewBox units)
const W = 480;
const L = 16;
const R = W - 16;
const TOP = 56;
const BASE = 250;
const colW = (R - L) / whyNow.chart.length;
const yOf = (pct: number) => BASE - (pct / 70) * (BASE - TOP);

/** Staircase of required recycled content, with numbered pins for the three regulation points. */
function Staircase() {
  const steps = whyNow.chart.map((d, i) => ({ ...d, x0: L + i * colW, x1: L + (i + 1) * colW, y: yOf(d.value) }));
  const line = steps.map((s, i) => `${i === 0 ? `M${s.x0} ${s.y}` : `V${s.y}`} H${s.x1}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} 300`} className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="why-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-mint)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--brand-mint)" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {steps.map((s, i) => (
        <g key={s.year}>
          <rect
            x={s.x0 + 1}
            y={s.y}
            width={colW - 2}
            height={BASE - s.y}
            fill="url(#why-fill)"
            className="ig ig-y"
            style={{ "--d": `${0.15 + i * 0.18}s` } as React.CSSProperties}
          />
          <text
            x={(s.x0 + s.x1) / 2}
            y={s.y - 14}
            textAnchor="middle"
            className="ig ig-fade fill-foreground font-display text-[26px]"
            style={{ "--d": `${0.5 + i * 0.18}s` } as React.CSSProperties}
          >
            {s.value}%
          </text>
          <text x={(s.x0 + s.x1) / 2} y={BASE + 30} textAnchor="middle" className="fill-muted-foreground text-[17px]">
            {s.year}
          </text>
        </g>
      ))}
      <line x1={L} x2={R} y1={BASE} y2={BASE} className="stroke-border" strokeWidth="1.5" />
      <path d={line} pathLength={1} fill="none" className="ig ig-draw stroke-primary" strokeWidth="3.5" strokeLinejoin="round" />

    </svg>
  );
}

export function WhyNow() {
  return (
    <Section id="why-now" className="bg-secondary/40">
      <SectionHeader id="why-now" kicker={whyNow.kicker} title={whyNow.title} body={whyNow.body} />
      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <Reveal className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h3 className="font-sans text-sm font-medium text-muted-foreground">{whyNow.chartTitle}</h3>
          <div className="mt-6" role="img" aria-label={whyNow.chart.map((d) => `${d.year}: ${d.value}%`).join(", ")}>
            <Staircase />
          </div>
          <FigureNote ids={whyNow.ids} />
        </Reveal>
        <ol className="flex flex-col gap-4">
          {whyNow.points.map((p, i) => {
            return (
              <li key={p.title}>
                <Reveal delay={i * 0.08} className="flex gap-4 rounded-2xl border border-border bg-card/70 p-6">
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-normal">{p.title}</h3>
                    <p className="mt-2 text-muted-foreground">{p.body}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
