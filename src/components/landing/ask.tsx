import { FigureNote } from "@/components/landing/figures/figure-note";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { num } from "@/data/assumptions";
import { ask } from "@/data/landing";

// Fixed colours that read on both the deep-teal band (light) and the dark card (dark mode).
const slice = [
  "oklch(0.87 0.085 168)", // mint
  "oklch(0.8 0.14 75)", // amber
  "oklch(0.72 0.1 190)", // teal
  "oklch(0.74 0.14 30)", // coral
  "oklch(0.92 0.04 78)", // sand
  "oklch(0.74 0.11 280)", // lavender
  "oklch(0.62 0.05 210)", // slate
  "oklch(0.97 0.005 85 / 0.7)", // paper
];

/** Use of funds as a donut that sweeps in clockwise; total in the middle. */
function Donut() {
  const r = 80;
  const gap = 0.6; // % of the ring left empty between slices
  return (
    <svg viewBox="0 0 220 220" className="h-auto w-full max-w-[260px]" aria-hidden>
      <defs>
        <mask id="ask-sweep">
          <circle cx="110" cy="110" r={r} pathLength={1} fill="none" stroke="white" strokeWidth="60" className="ig ig-draw" />
        </mask>
      </defs>
      <g mask="url(#ask-sweep)" transform="rotate(-90 110 110)">
        {ask.funds.map((f, i) => {
          const off = ask.funds.slice(0, i).reduce((s, x) => s + x.pct, 0);
          return (
            <circle
              key={f.label}
              cx="110"
              cy="110"
              r={r}
              pathLength={100}
              fill="none"
              stroke={slice[i]}
              strokeWidth="34"
              strokeDasharray={`${Math.max(f.pct - gap, 0.1)} ${100 - f.pct + gap}`}
              strokeDashoffset={-off}
            />
          );
        })}
      </g>
      <text x="110" y="104" textAnchor="middle" className="fill-current font-display text-[26px]">
        ₹{ask.totalCrore} cr
      </text>
      <text x="110" y="126" textAnchor="middle" className="fill-current text-[11px] opacity-70">
        use of funds
      </text>
    </svg>
  );
}

export function Ask() {
  return (
    <Section id="ask" className="bg-teal-deep text-paper dark:bg-card dark:text-foreground">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="[&_p]:text-paper/75 dark:[&_p]:text-muted-foreground [&_p:first-child]:text-mint">
          <SectionHeader id="ask" kicker={ask.kicker} title={ask.title} body={ask.body} />
        </div>
        <Reveal>
          <h3 className="sr-only">Use of funds</h3>
          <div className="grid items-center gap-8 sm:grid-cols-[minmax(0,240px)_1fr]">
            <div className="mx-auto w-full max-w-[240px]">
              <Donut />
            </div>
            <ul className="flex flex-col gap-2.5">
              {ask.funds.map((f, i) => (
                <li
                  key={f.label}
                  className="ig ig-fade grid grid-cols-[0.75rem_1fr_auto_2.75rem] items-center gap-3 text-sm"
                  style={{ "--d": `${0.3 + i * 0.1}s` } as React.CSSProperties}
                >
                  <span aria-hidden className="size-3 rounded-sm" style={{ background: slice[i] }} />
                  <span>{f.label}</span>
                  <span className="font-mono tabular-nums opacity-80">₹{f.crore} cr</span>
                  <span className="text-right font-mono text-xs tabular-nums opacity-60">{num(f.pct, 0)}%</span>
                </li>
              ))}
            </ul>
          </div>
          <FigureNote ids={ask.ids} className="mt-8 text-paper/70 dark:text-muted-foreground" />
        </Reveal>
      </div>
    </Section>
  );
}
