import { ArrowRight, CircleCheck, Droplets, Route } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { IsoPlantScene, isoPinPositions } from "@/components/landing/plant-iso-scene";
import { Reveal } from "@/components/landing/reveal";
import { Section } from "@/components/landing/section";
import { plant } from "@/data/landing";

const decisions = [
  { icon: Route, label: "One clear material route", detail: "Raw plastic moves toward a tested finished batch." },
  { icon: Droplets, label: "Wet work has a service zone", detail: "Water treatment is planned with the wash process." },
  { icon: CircleCheck, label: "Quality is a release gate", detail: "Product reaches storage only after a batch check." },
] as const;

export function PlantTeaser() {
  return (
    <Section id="plant" className="overflow-hidden bg-teal-deep text-paper dark:bg-card dark:text-foreground">
      <div className="grid items-center gap-10 lg:grid-cols-[0.68fr_1.32fr]">
        <Reveal>
          <p className="text-sm font-medium tracking-wide text-mint uppercase">{plant.kicker}</p>
          <h2 id="plant-title" className="mt-3 max-w-lg font-display text-4xl leading-[1.08] sm:text-5xl">{plant.title}</h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-paper/75 dark:text-muted-foreground">{plant.body}</p>
          <ul className="mt-8 space-y-4 border-t border-paper/20 pt-6 dark:border-border">
            {decisions.map((item) => (
              <li key={item.label} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-mint/20 bg-mint/10 text-mint dark:text-primary"><item.icon className="size-4" aria-hidden /></span>
                <span>
                  <strong className="block text-sm font-medium text-paper dark:text-foreground">{item.label}</strong>
                  <span className="mt-0.5 block text-sm text-paper/60 dark:text-muted-foreground">{item.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link href="/factory" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-mint px-5 py-3 font-semibold text-teal-deep shadow-lg transition-transform hover:-translate-y-0.5">
            Walk through the design <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <figure className="rounded-[1.75rem] border border-white/20 bg-[#073336] p-3 shadow-[0_28px_80px_rgba(0,0,0,.25)] sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-3 sm:px-3 sm:pb-4">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-mint uppercase">Plant 01 / Animated design</p>
                <p className="mt-1 font-display text-xl text-white sm:text-2xl">A workday, from arrival to dispatch.</p>
              </div>
              <span className="rounded-full border border-mint/25 px-3 py-1 text-xs text-mint">Illustrative motion</span>
            </div>
            <div className="relative aspect-[840/570] overflow-hidden rounded-2xl border border-white/15 bg-[#e5efe8]">
              <IsoPlantScene />
              {plant.stops.map((label, index) => (
                <span key={label} aria-hidden className="ig ig-pop absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-mint bg-white text-[10px] font-bold text-teal-deep shadow-lg" style={{ ...isoPinPositions[index], "--d": `${0.4 + index * 0.1}s` } as CSSProperties}>{index + 1}</span>
              ))}
            </div>
            <figcaption className="px-2 pt-3 sm:px-3">
              <ol className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-paper/80 sm:grid-cols-4">
                {plant.stops.map((label, index) => <li key={label}><span className="mr-1 font-mono text-mint">{index + 1}</span> {label}</li>)}
              </ol>
              <p className="mt-3 text-xs text-paper/55">Illustration of the proposed flow · not a live plant</p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </Section>
  );
}
