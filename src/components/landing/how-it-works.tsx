import { FigureNote } from "@/components/landing/figures/figure-note";
import { Glyph, type GlyphKind } from "@/components/landing/figures/material-glyphs";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { num } from "@/data/assumptions";
import { how } from "@/data/landing";

// Material form after each step, in step order: bale → bottles → flakes → … → bagged pellets
const glyphs: GlyphKind[] = ["collect", "sort", "shred", "wash", "dry", "extrude", "pellet", "supply"];

const massNote = `${num(how.massIn)} kg in → ${num(how.massOut)} kg of pellets (${num(how.yieldPct)}% yield)`;

const d = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

/** Desktop: one conveyor across the page, a station per step, material moving along it. */
function FlowDiagram() {
  const X = (i: number) => 75 + i * 150;
  return (
    <svg viewBox="0 0 1200 250" className="hidden h-auto w-full lg:block" aria-hidden>
      <defs>
        <clipPath id="how-belt">
          <rect x={X(0)} y="80" width={X(7) - X(0)} height="20" />
        </clipPath>
      </defs>
      <line x1={X(0)} x2={X(7)} y1="90" y2="90" pathLength={1} className="ig ig-draw stroke-muted" strokeWidth="12" strokeLinecap="round" />
      <g clipPath="url(#how-belt)">
        <g className="ig-loop animate-[ig-move_1.4s_linear_infinite]" style={{ "--tx": "30px" } as React.CSSProperties}>
          {Array.from({ length: 37 }, (_, i) => (
            <circle key={i} cx={X(0) - 30 + i * 30} cy="90" r="3" className={i % 3 === 0 ? "fill-primary" : "fill-[oklch(0.74_0.12_165)] dark:fill-mint"} />
          ))}
        </g>
      </g>

      {glyphs.map((g, i) => (
        <g key={g} className="ig ig-pop" style={d(0.3 + i * 0.12)}>
          <circle cx={X(i)} cy="90" r="50" className="fill-card stroke-border" strokeWidth="1.5" />
          <g transform={`translate(${X(i) - 32} 58)`}>
            <Glyph kind={g} />
          </g>
        </g>
      ))}
      {how.steps.map((s, i) => (
        <g key={s.title} className="ig ig-fade" style={d(0.5 + i * 0.12)}>
          <text x={X(i)} y="172" textAnchor="middle" className="fill-muted-foreground font-mono text-[13px]">
            {String(i + 1).padStart(2, "0")}
          </text>
          <text x={X(i)} y="198" textAnchor="middle" className="fill-foreground font-display text-[22px]">
            {s.title}
          </text>
        </g>
      ))}

      {/* Mass balance along the whole line */}
      <g className="ig ig-fade" style={d(1.6)}>
        <path d={`M${X(0)} 222 V230 H${X(7)} V222`} fill="none" className="stroke-primary/50" strokeWidth="1.5" />
        <rect x={600 - 175} y="218" width="350" height="24" rx="12" className="fill-background" />
        <text x="600" y="235" textAnchor="middle" className="fill-primary text-[14px] font-medium">
          {massNote}
        </text>
      </g>
    </svg>
  );
}

export function HowItWorks() {
  return (
    <Section id="how">
      <SectionHeader id="how" kicker={how.kicker} title={how.title} body={how.body} />

      <Reveal className="mt-14">
        <FlowDiagram />

        <ol className="relative grid gap-5 lg:mt-10 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-6">
          {/* Phones/tablets: a vertical belt behind the glyph tiles, material moving down it */}
          <span aria-hidden className="absolute top-7 bottom-7 left-[27px] w-1.5 overflow-hidden rounded-full bg-muted lg:hidden">
            <span
              className="ig-loop absolute inset-x-0 -top-7 h-[200%] animate-[ig-move_1.4s_linear_infinite] bg-[radial-gradient(circle,var(--primary)_2px,transparent_2.5px)] bg-[length:6px_28px] bg-repeat-y"
              style={{ "--ty": "28px" } as React.CSSProperties}
            />
          </span>
          {how.steps.map((step, i) => (
            <li key={step.title} className="relative grid grid-cols-[56px_1fr] items-start gap-4 lg:block">
              <svg viewBox="0 0 64 64" aria-hidden className="ig ig-pop size-14 rounded-full border border-border bg-card lg:hidden" style={d(i * 0.06)}>
                <Glyph kind={glyphs[i]} />
              </svg>
              <div>
                <h3 className="flex items-baseline gap-2 text-lg font-normal lg:text-base lg:font-medium lg:font-sans">
                  <span className="font-mono text-sm text-muted-foreground lg:hidden">{String(i + 1).padStart(2, "0")}</span>
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm font-medium text-primary lg:hidden">{massNote}</p>
        <FigureNote ids={how.ids} />
      </Reveal>
    </Section>
  );
}
