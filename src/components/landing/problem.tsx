import { ChevronRight } from "lucide-react";
import { FigureNote } from "@/components/landing/figures/figure-note";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { num } from "@/data/assumptions";
import { problem } from "@/data/landing";

const [city, india, karnataka, flexible] = problem.stats;
const f = problem.figure;

function Stat({ s, accent }: { s: (typeof problem.stats)[number]; accent?: boolean }) {
  return (
    <dl>
      <dt className="sr-only">{s.label}</dt>
      <dd className={`font-display text-4xl ${accent ? "text-primary" : ""}`}>
        {s.value}
        {s.unit && <span className="ml-1.5 font-sans text-base text-muted-foreground">{s.unit}</span>}
      </dd>
      <dd className="mt-2 text-sm text-muted-foreground">{s.label}</dd>
    </dl>
  );
}

/** India → Karnataka: 100 dots, one per percent of reported waste; Karnataka's share lights up. */
function DotGrid() {
  const lit = Math.round(f.karnatakaPct);
  return (
    <svg viewBox="0 0 200 200" className="h-auto w-full max-w-[180px]" aria-hidden>
      {Array.from({ length: 100 }, (_, i) => {
        const on = i >= 100 - lit;
        return (
          <circle
            key={i}
            cx={10 + (i % 10) * 20}
            cy={10 + Math.floor(i / 10) * 20}
            r={on ? 7 : 5.5}
            className={`ig ig-pop ${on ? "fill-primary" : "fill-muted-foreground/25"}`}
            style={{ "--d": `${(on ? 0.9 : 0) + (i % 10) * 0.025 + Math.floor(i / 10) * 0.035}s` } as React.CSSProperties}
          />
        );
      })}
    </svg>
  );
}

/** Bengaluru's daily waste as a range on a 0–max scale, with the first plant's intake marked. */
function CityRange() {
  const max = Math.ceil((f.cityHigh * 1.1) / 100) * 100;
  const x = (t: number) => 10 + (t / max) * 280;
  return (
    <svg viewBox="0 0 300 120" className="h-auto w-full" aria-hidden>
      <rect x="10" y="44" width="280" height="22" rx="11" className="fill-muted" />
      <rect
        x={x(f.cityLow)}
        y="44"
        width={x(f.cityHigh) - x(f.cityLow)}
        height="22"
        rx="11"
        className="ig ig-x fill-primary/80"
        style={{ "--d": "0.2s" } as React.CSSProperties}
      />
      {[0, max / 2, max].map((t) => (
        <text key={t} x={x(t)} y="92" textAnchor={t === 0 ? "start" : t === max ? "end" : "middle"} className="fill-muted-foreground font-mono text-[11px]">
          {num(t)}
        </text>
      ))}
      <text x={x((f.cityLow + f.cityHigh) / 2)} y="34" textAnchor="middle" className="ig ig-fade fill-foreground text-[12px] font-medium" style={{ "--d": "0.7s" } as React.CSSProperties}>
        city, per day
      </text>
      {/* Plant marker: a thin tick at its true scale, plus a pulse so it can be found */}
      <g className="ig ig-pop" style={{ "--d": "1s" } as React.CSSProperties}>
        <circle cx={x(f.plantTpd) + 3} cy="55" r="5" className="ig-loop fill-[var(--brand-mint)] ig-pop animate-[ig-pulse_2.4s_ease-out_infinite]" />
        <circle cx={x(f.plantTpd) + 3} cy="55" r="5" className="fill-[oklch(0.74_0.12_165)] stroke-card dark:fill-mint" strokeWidth="2" />
        <path d={`M${x(f.plantTpd) + 3} 66 V108 H48`} fill="none" className="stroke-muted-foreground/60" strokeWidth="1" />
        <text x="52" y="111" className="fill-foreground text-[11px] font-medium">
          our plant: {num(f.plantTpd)} t/day
        </text>
      </g>
    </svg>
  );
}

/** Packaging split: flexible vs rigid, with an arrow at the rigid slice we start with. */
function PackSplit() {
  const flexW = (f.flexiblePct / 100) * 280;
  return (
    <svg viewBox="0 0 300 120" className="h-auto w-full" aria-hidden>
      <defs>
        <pattern id="flex-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" className="fill-muted" />
          <line x1="0" y1="0" x2="0" y2="6" className="stroke-muted-foreground/30" strokeWidth="2" />
        </pattern>
      </defs>
      <rect x="10" y="44" width={flexW} height="30" rx="8" fill="url(#flex-hatch)" className="ig ig-x" />
      <rect
        x={10 + flexW + 3}
        y="44"
        width={280 - flexW - 3}
        height="30"
        rx="8"
        className="ig ig-x fill-primary"
        style={{ "--d": "0.5s" } as React.CSSProperties}
      />
      <text x={10 + flexW / 2} y="64" textAnchor="middle" className="fill-muted-foreground text-[12px]">
        flexible ~{num(f.flexiblePct)}%
      </text>
      <text x={10 + flexW + (280 - flexW) / 2 + 1.5} y="64" textAnchor="middle" className="fill-primary-foreground text-[12px] font-medium">
        rigid
      </text>
      <g className="ig ig-fade" style={{ "--d": "1s" } as React.CSSProperties}>
        <path d={`M${10 + flexW + (280 - flexW) / 2} 80 v14`} className="stroke-primary" strokeWidth="2" />
        <path d={`M${10 + flexW + (280 - flexW) / 2 - 5} 85 l5 -6 l5 6`} fill="none" className="stroke-primary" strokeWidth="2" />
        <text x={10 + flexW + (280 - flexW) / 2} y="112" textAnchor="middle" className="fill-primary text-[12px] font-medium">
          we start here
        </text>
      </g>
    </svg>
  );
}

export function Problem() {
  return (
    <Section id="problem">
      <SectionHeader id="problem" kicker={problem.kicker} title={problem.title} body={problem.body} />
      <Reveal className="mt-14">
        <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">India</p>
            <div className="flex items-center gap-5">
              <DotGrid />
              <p className="text-xs text-muted-foreground">
                Each dot is 1% of India&apos;s reported plastic waste.{" "}
                <span className="font-medium text-primary">Teal dots: Karnataka.</span>
              </p>
            </div>
            <Stat s={india} />
            <Stat s={karnataka} accent />
          </div>
          <ChevronRight aria-hidden className="mx-auto hidden size-6 self-center text-muted-foreground/60 lg:block" />
          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Bengaluru</p>
            <CityRange />
            <Stat s={city} />
            <p className="mt-auto text-sm text-muted-foreground">{f.plantNote}</p>
          </div>
          <ChevronRight aria-hidden className="mx-auto hidden size-6 self-center text-muted-foreground/60 lg:block" />
          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Packaging</p>
            <PackSplit />
            <Stat s={flexible} />
          </div>
        </div>
        <FigureNote ids={f.ids} />
      </Reveal>
    </Section>
  );
}
