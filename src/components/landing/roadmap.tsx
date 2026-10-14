import { FigureNote } from "@/components/landing/figures/figure-note";
import { Reveal } from "@/components/landing/reveal";
import { Section, SectionHeader } from "@/components/landing/section";
import { roadmap } from "@/data/landing";

const d = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

/**
 * Timeline: each phase is a stretch of track ending in a gate (diamond) that must be passed
 * before the next one starts. Horizontal on large screens, a vertical rail on phones.
 * The track draws itself phase by phase as it scrolls into view.
 */
export function Roadmap() {
  return (
    <Section id="roadmap" className="bg-secondary/40">
      <SectionHeader id="roadmap" kicker={roadmap.kicker} title={roadmap.title} />
      <Reveal className="mt-14">
        <ol className="grid gap-x-0 gap-y-0 lg:grid-cols-4">
          {roadmap.phases.map((p, i) => {
            const t = 0.2 + i * 0.45;
            return (
              <li key={p.name} className="grid grid-cols-[1.25rem_1fr] gap-x-4 lg:grid-cols-1 lg:grid-rows-[auto_1fr] lg:gap-x-0">
                {/* Rail: dot → track → gate */}
                <div aria-hidden className="flex flex-col items-center lg:h-5 lg:flex-row">
                  <span className="relative flex size-4 shrink-0 items-center justify-center">
                    {i === 0 && (
                      <span className="ig-loop absolute inset-0 animate-[ig-pulse_2.4s_ease-out_infinite] rounded-full bg-primary" />
                    )}
                    <span
                      className={`ig ig-pop relative size-4 rounded-full border-2 border-primary ${i === 0 ? "bg-primary" : "bg-background"}`}
                      style={d(t)}
                    />
                  </span>
                  <span className="ig ig-rail w-0.5 flex-1 origin-top bg-primary/45 lg:h-0.5 lg:w-auto lg:origin-left" style={d(t + 0.1)} />
                  <span className="ig ig-pop my-1 size-3 shrink-0 rotate-45 bg-primary lg:mx-1 lg:my-0" style={d(t + 0.45)} />
                </div>
                <div className="pb-6 lg:pt-5 lg:pr-4 lg:pb-0">
                  <div className="ig ig-fade flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]" style={d(t)}>
                    <p className="text-sm text-muted-foreground">
                      {p.tag} · {p.when}
                    </p>
                    <h3 className="mt-2 text-2xl font-normal">{p.name}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">{p.body}</p>
                    <p className="mt-auto flex gap-2 pt-5 text-sm font-medium text-primary">
                      <span aria-hidden className="mt-1.5 size-2 shrink-0 rotate-45 bg-primary" />
                      {p.gate}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground lg:mt-6">
          <span className="flex items-center gap-2">
            <span aria-hidden className="size-2 rotate-45 bg-primary" /> Gate — the next phase starts only when it is met.
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 rounded-full bg-primary" /> We are here.
          </span>
        </p>
        <FigureNote ids={roadmap.ids} />
      </Reveal>
    </Section>
  );
}
