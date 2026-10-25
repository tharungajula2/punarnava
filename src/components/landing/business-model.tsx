import { ShieldCheck } from "lucide-react";
import { FigureNote } from "@/components/landing/figures/figure-note";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { money, num } from "@/data/assumptions";
import { model } from "@/data/landing";

const { pellet, epr } = model.flow;
const total = pellet + epr;
const share = (x: number) => `${num((x / total) * 100, 1)}%`;

/**
 * Every kilogram sold splits into two streams, drawn to scale: a wide pellet ribbon and a
 * hair-thin EPR ribbon. The SVG stretches to the column (non-uniform scale), so labels are HTML.
 */
function Streams() {
  const H = 160;
  const pelletH = (pellet / total) * H;
  const eprH = Math.max((epr / total) * H, 2.5);
  const gap = 34;
  // Ribbon from the source bar (left) to its node on the right
  const ribbon = (y0: number, h: number, y1: number) =>
    `M0 ${y0} C120 ${y0} 180 ${y1} 300 ${y1} V${y1 + h} C180 ${y1 + h} 120 ${y0 + h} 0 ${y0 + h} Z`;

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-stretch gap-3 sm:gap-5">
      <div className="flex flex-col justify-center">
        <p className="text-xs text-muted-foreground sm:text-sm">Every kg sold</p>
        <p className="font-display text-2xl sm:text-3xl">₹{money(total)}</p>
      </div>
      <svg viewBox={`0 0 300 ${H + gap}`} preserveAspectRatio="none" className="h-40 w-full sm:h-48" aria-hidden>
        <path d={ribbon(0, pelletH, 0)} className="ig ig-x fill-primary/85" />
        <path
          d={ribbon(pelletH, eprH, pelletH + gap)}
          className="ig ig-x fill-[oklch(0.74_0.12_165)] dark:fill-mint"
          style={{ "--d": "0.5s" } as React.CSSProperties}
        />
        {/* Material moving through the pellet stream */}
        <line
          x1="0"
          x2="300"
          y1={pelletH / 2}
          y2={pelletH / 2}
          className="ig-loop ig ig-fade animate-[ig-move_1.6s_linear_infinite] stroke-primary-foreground/50"
          strokeWidth="3"
          strokeDasharray="2 18"
          vectorEffect="non-scaling-stroke"
          style={{ "--tx": "20px", "--d": "0.9s" } as React.CSSProperties}
        />
      </svg>
      <div className="flex flex-col justify-between py-1 text-right sm:text-left">
        <div className="ig ig-fade" style={{ "--d": "0.6s" } as React.CSSProperties}>
          <p className="font-display text-2xl text-primary sm:text-3xl">₹{num(pellet)}</p>
          <p className="text-xs text-muted-foreground sm:text-sm">pellets · {share(pellet)}</p>
        </div>
        <div className="ig ig-fade" style={{ "--d": "1s" } as React.CSSProperties}>
          <p className="font-display text-xl sm:text-2xl">₹{money(epr)}</p>
          <p className="text-xs text-muted-foreground sm:text-sm">EPR · {share(epr)}</p>
        </div>
      </div>
    </div>
  );
}

export function BusinessModel() {
  return (
    <Section id="model" className="bg-secondary/40">
      <SectionHeader id="model" kicker={model.kicker} title={model.title} />
      <Reveal className="mt-14 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <h3 className="font-sans text-sm font-medium text-muted-foreground">
          An illustrative sale: the pellet is the main product
        </h3>
        <div className="mt-6">
          <Streams />
        </div>
        <FigureNote ids={model.ids} />
      </Reveal>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {model.streams.map((s, i) => (
          <Reveal
            key={s.name}
            delay={i * 0.1}
            className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]"
          >
            <span className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              {s.tag}
            </span>
            <h3 className="mt-5 text-2xl font-normal">{s.name}</h3>
            <p className="mt-3 text-muted-foreground">{s.body}</p>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-6 flex flex-col gap-4 rounded-2xl bg-teal-deep p-8 text-paper sm:flex-row sm:items-start dark:bg-accent dark:text-accent-foreground">
        <ShieldCheck className="size-8 shrink-0 text-mint" aria-hidden />
        <div>
          <h3 className="text-2xl font-normal">{model.principle.title}</h3>
          <p className="mt-2 opacity-85">{model.principle.body}</p>
        </div>
      </Reveal>
    </Section>
  );
}
