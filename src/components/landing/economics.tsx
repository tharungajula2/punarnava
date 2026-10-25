import { TrendingUp } from "lucide-react";
import { FigureNote } from "@/components/landing/figures/figure-note";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { money } from "@/data/assumptions";
import { economics } from "@/data/landing";
import { cn } from "@/lib/utils";

// One colour per cost line; margin is always the green "keep" colour.
const costColours = [
  "bg-chart-1",
  "bg-chart-4",
  "bg-chart-3",
  "bg-chart-2",
  "bg-foreground/50",
  "bg-foreground/35",
  "bg-foreground/20",
];

const d = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

function Row({
  label,
  value,
  from,
  width,
  colour,
  delay,
  strong,
  origin = "ig-xr",
  total,
}: {
  label: string;
  value: string;
  from: number;
  width: number;
  colour: string;
  delay: number;
  strong?: boolean;
  origin?: string;
  total: number;
}) {
  const pct = (x: number) => `${(x / total) * 100}%`;
  return (
    <li
      className={cn(
        "grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm sm:grid-cols-[minmax(6.5rem,11rem)_1fr_4.5rem]",
        strong && "font-medium",
      )}
    >
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span className="relative col-span-2 row-start-2 h-4 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:h-6">
        <span
          className={cn("ig absolute inset-y-0 rounded-md", origin, colour)}
          style={{ left: pct(from), width: pct(width), ...d(delay) }}
        />
      </span>
      <span className="text-right font-mono tabular-nums sm:col-start-3 sm:row-start-1">{value}</span>
    </li>
  );
}

/**
 * Waterfall, one row per line: revenue at the top, each cost bites off the right-hand end of
 * what is left, and the margin is what remains. Bars are HTML so labels stay readable on phones.
 */
function Waterfall() {
  const { perKg } = economics;
  // Each cost starts where the revenue left after the costs above it ends
  const rows = perKg.costs.map((c, i) => ({
    ...c,
    from: perKg.revenue - perKg.costs.slice(0, i + 1).reduce((s, x) => s + x.value, 0),
    colour: costColours[i],
  }));

  return (
    <ol className="mt-6 flex flex-col gap-2">
      <Row total={perKg.revenue} label="Pellet sale + possible certificate" value={`₹${money(perKg.revenue)}`} from={0} width={perKg.revenue} colour="bg-primary/80" delay={0.1} strong origin="ig-x" />
      {rows.map((r, i) => (
        <Row total={perKg.revenue} key={r.label} label={r.label} value={`−₹${money(r.value)}`} from={r.from} width={r.value} colour={r.colour} delay={0.5 + i * 0.12} />
      ))}
      <Row total={perKg.revenue} label="Left after running costs" value={`₹${money(perKg.margin)}`} from={0} width={perKg.margin} colour="bg-chart-5" delay={0.5 + rows.length * 0.12 + 0.1} strong origin="ig-x" />
    </ol>
  );
}

/** Margin per kg under each shock: bars either side of zero. */
function StressChart() {
  const rows = economics.stressChart;
  const lo = Math.min(0, ...rows.map((r) => r.value));
  const hi = Math.max(...rows.map((r) => r.value));
  const span = hi - lo;
  const zero = (-lo / span) * 100;
  return (
    <ol className="flex flex-col gap-2.5" aria-label="Example amount left per kilogram under different setbacks">
      {rows.map((r, i) => {
        const neg = r.value < 0;
        const w = (Math.abs(r.value) / span) * 100;
        return (
          <li key={r.label} className="grid grid-cols-[minmax(6.5rem,8.5rem)_1fr_4.5rem] items-center gap-3 text-sm">
            <span className={i === 0 || neg ? "font-medium" : "text-muted-foreground"}>{r.label}</span>
            <span className="relative h-6">
              <span aria-hidden className="absolute inset-y-[-4px] w-px bg-border" style={{ left: `${zero}%` }} />
              <span
                className={cn("ig absolute inset-y-0", neg ? "ig-xr rounded-l-md bg-chart-4" : i === 0 ? "ig-x rounded-r-md bg-primary/80" : "ig-x rounded-r-md bg-chart-5")}
                style={{ left: neg ? `${zero - w}%` : `${zero}%`, width: `${w}%`, ...d(0.2 + i * 0.15) }}
              />
            </span>
            <span className={cn("text-right font-mono tabular-nums", neg && "text-chart-4")}>
              {neg ? "−" : ""}₹{money(Math.abs(r.value))}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function Economics() {
  const { perKg } = economics;

  return (
    <Section id="economics">
      <SectionHeader id="economics" kicker={economics.kicker} title={economics.title} body={economics.body} />

      <dl className="mt-12 grid gap-4 sm:grid-cols-2">
        {economics.kpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 0.08} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <dt className="sr-only">{k.label}</dt>
            <dd className="font-display text-4xl text-primary">{k.value}</dd>
            <dd className="mt-3 text-sm text-muted-foreground">{k.label}</dd>
          </Reveal>
        ))}
      </dl>

      <Reveal className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-2xl font-normal">{perKg.title}</h3>
          <p className="text-sm text-muted-foreground">Example Indian rupees for one kilogram of pellets</p>
        </div>
        <Waterfall />
        <p className="mt-5 text-sm text-muted-foreground">Read from top to bottom: start with the sale, subtract each day-to-day cost, then see what remains before loan payments and tax. The possible certificate is included here and is uncertain.</p>
      </Reveal>

      <Reveal className="mt-6 grid gap-8 rounded-2xl border border-dashed border-border p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-4 sm:flex-row">
          <TrendingUp className="size-7 shrink-0 rotate-180 text-chart-4" aria-hidden />
          <div>
            <h3 className="text-xl font-normal">{economics.stress.title}</h3>
            <p className="mt-2 text-muted-foreground">{economics.stress.body}</p>
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm text-muted-foreground">Amount left for each kilogram sold. A bar to the left of the line means a loss.</p>
          <StressChart />
        </div>
      </Reveal>
      <FigureNote ids={economics.ids} />
    </Section>
  );
}
