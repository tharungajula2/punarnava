import { FigureNote } from "@/components/landing/figures/figure-note";
import { Reveal } from "@/components/landing/reveal";
import { Section } from "@/components/landing/section";
import { plant } from "@/data/landing";

/**
 * "Inside the plant": a small isometric diorama of the planned site, drawn as one static SVG
 * on the server. Motion is CSS only (truck, belt, steam, water, status lights), transform and
 * opacity, paused until it scrolls into view and frozen for reduced motion. No three.js here —
 * the full 3D factory stays in the private OS.
 * Units are metres-ish; S = viewBox px per unit. Visual only: nothing here is a business number.
 */
const S = 22;
const CX = 0.866 * S;
const CY = 0.5 * S;
const iso = (x: number, y: number, z = 0): [number, number] => [(x - y) * CX, (x + y) * CY - z * S];
const pts = (...p: [number, number][]) => p.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
const shade = (c: string, k: number) => `color-mix(in srgb, ${c}, black ${k}%)`;

/** Box with its three visible faces (top, +y "left", +x "right"). */
function Box({ x, y, z = 0, w, d, h, c, top }: { x: number; y: number; z?: number; w: number; d: number; h: number; c: string; top?: string }) {
  return (
    <g>
      <polygon points={pts(iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h))} style={{ fill: shade(c, 10) }} />
      <polygon points={pts(iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h))} style={{ fill: shade(c, 22) }} />
      <polygon points={pts(iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h))} style={{ fill: top ?? c }} />
    </g>
  );
}

/** Upright cylinder (silo, dryer, tank). */
function Cyl({ x, y, z = 0, r, h, c, top }: { x: number; y: number; z?: number; r: number; h: number; c: string; top?: string }) {
  const [bx, by] = iso(x, y, z);
  const [, ty] = iso(x, y, z + h);
  const rx = r * S * 1.2247;
  const ry = r * S * 0.7071;
  return (
    <g>
      <ellipse cx={bx} cy={by} rx={rx} ry={ry} style={{ fill: shade(c, 22) }} />
      <rect x={bx - rx} y={ty} width={rx * 2} height={by - ty} style={{ fill: shade(c, 14) }} />
      <ellipse cx={bx} cy={ty} rx={rx} ry={ry} style={{ fill: top ?? c }} />
    </g>
  );
}

function Tree({ x, y }: { x: number; y: number }) {
  const [tx, ty] = iso(x, y, 0);
  return (
    <g>
      <ellipse cx={tx} cy={ty} rx="9" ry="4" className="fill-black/10" />
      <rect x={tx - 1.5} y={ty - 16} width="3" height="16" style={{ fill: "var(--pi-dark)" }} opacity="0.6" />
      <circle cx={tx} cy={ty - 24} r="12" style={{ fill: "var(--pi-tree)" }} />
      <circle cx={tx - 4} cy={ty - 28} r="5" className="fill-white/20" />
    </g>
  );
}

function Light({ x, y, z, delay = 0, c = "oklch(0.75 0.17 150)" }: { x: number; y: number; z: number; delay?: number; c?: string }) {
  const [lx, ly] = iso(x, y, z);
  return (
    <circle
      cx={lx}
      cy={ly}
      r="3.2"
      className="ig-loop animate-[ig-blink_2.2s_ease-in-out_infinite]"
      style={{ fill: c, animationDelay: `${delay}s` }}
    />
  );
}

const M = "var(--pi-machine)";
const M2 = "var(--pi-machine-2)";
const SAND = "var(--pi-sand)";
const WALL = "var(--pi-wall)";

// Site extents and the numbered stops (pins) shown over the drawing
const VB = { x: -335, y: -72, w: 840, h: 570 };
const stopsAt: [number, number, number][] = [
  [5, 14.6, 0.6], // weighbridge
  [3, 7.5, 2.4], // bale yard
  [8.6, 7, 1.6], // sorting
  [13, 7, 2.4], // shred & wash
  [17.4, 5.6, 3.8], // dry & store
  [20, 7, 1.8], // extrude & pelletise
  [24, 5.5, 1.8], // water recycling
  [19.5, 11.5, 1.6], // dispatch
];

// Truck path along the road (iso +x direction), as CSS offsets in viewBox px
const run = (dx: number) => `${(dx * CX).toFixed(1)}px`;
const runY = (dx: number) => `${(dx * CY).toFixed(1)}px`;

function Scene() {
  const belt = [iso(7, 6.8, 0.75), iso(22, 6.8, 0.75), iso(22, 7.2, 0.75), iso(7, 7.2, 0.75)];
  return (
    <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="plant-iso h-auto w-full" aria-hidden>
      <defs>
        <clipPath id="pi-belt">
          <polygon points={pts(...belt)} />
        </clipPath>
      </defs>

      {/* Ground tile, lawn and road */}
      <Box x={0} y={0} z={-0.7} w={26} d={17} h={0.7} c="var(--pi-ground)" />
      <polygon points={pts(iso(0, 0), iso(6, 0), iso(6, 12), iso(0, 12))} style={{ fill: "var(--pi-grass)" }} opacity="0.6" />
      <polygon points={pts(iso(0, 13), iso(26, 13), iso(26, 16), iso(0, 16))} style={{ fill: "var(--pi-road)" }} />
      {Array.from({ length: 8 }, (_, i) => (
        <polygon key={i} points={pts(iso(1 + i * 3.2, 14.4), iso(2.6 + i * 3.2, 14.4), iso(2.6 + i * 3.2, 14.6), iso(1 + i * 3.2, 14.6))} className="fill-white/60" />
      ))}
      {/* Weighbridge plate */}
      <Box x={3} y={13.4} w={4.5} d={2.2} h={0.12} c="var(--pi-floor)" />

      {/* Office and trees */}
      <Box x={0.8} y={0.8} w={4} d={3} h={2.4} c={SAND} top={shade(SAND, 4)} />
      {[0, 1, 2].map((i) => (
        <polygon key={i} points={pts(iso(1.2 + i * 1.2, 3.8, 0.9), iso(2 + i * 1.2, 3.8, 0.9), iso(2 + i * 1.2, 3.8, 1.8), iso(1.2 + i * 1.2, 3.8, 1.8))} className="fill-[oklch(0.75_0.06_220)]" opacity="0.8" />
      ))}
      <Tree x={0.8} y={11} />
      <Tree x={24.5} y={11} />
      <Tree x={25} y={1.5} />

      {/* Bale yard */}
      {[
        [1, 6, 0], [2.2, 6, 0], [1, 7.2, 0], [2.2, 7.2, 0], [3.4, 6, 0], [1, 6, 1.1], [2.2, 6, 1.1], [1, 7.2, 1.1], [1, 8.6, 0], [2.2, 8.6, 0], [3.4, 8.6, 0],
      ].map(([x, y, z], i) => (
        <Box key={i} x={x} y={y} z={z} w={1.1} d={1.1} h={1.05} c={i % 3 === 0 ? "oklch(0.72 0.07 195)" : i % 3 === 1 ? SAND : "oklch(0.8 0.07 165)"} />
      ))}

      {/* Hall: floor, back + side walls (front cut away), glass roof outline */}
      <Box x={6} y={3} w={16.5} d={9} h={0.15} c="var(--pi-floor)" />
      <Box x={6} y={3} z={0.15} w={16.5} d={0.25} h={3.6} c={WALL} />
      <Box x={6} y={3} z={0.15} w={0.25} d={9} h={3.6} c={WALL} />
      {[6.6, 9.4, 12.2, 15, 17.8, 20.6].map((x) => (
        <polygon key={x} points={pts(iso(x, 3.25, 2.4), iso(x + 1.6, 3.25, 2.4), iso(x + 1.6, 3.25, 3.2), iso(x, 3.25, 3.2))} className="fill-[oklch(0.8_0.05_220)]" opacity="0.55" />
      ))}

      {/* Belt with material moving along it (drawn before the machines so they cover it) */}
      <polygon points={pts(...belt)} style={{ fill: "var(--pi-dark)" }} opacity="0.55" />
      <g clipPath="url(#pi-belt)">
        <g className="ig-loop animate-[ig-move_1.6s_linear_infinite]" style={{ "--tx": run(1), "--ty": runY(1) } as React.CSSProperties}>
          {Array.from({ length: 17 }, (_, i) => {
            const [px, py] = iso(6 + i, 7, 0.8);
            return <circle key={i} cx={px} cy={py} r="2.6" style={{ fill: i % 2 ? "var(--pi-mint)" : SAND }} />;
          })}
        </g>
      </g>

      {/* Sorting line with pickers */}
      <Box x={7} y={6.3} w={3.6} d={1.4} h={0.8} c={M2} top="var(--pi-mint)" />
      {[7.8, 9.6].map((x) => (
        <g key={x}>
          <Box x={x} y={8} w={0.45} d={0.45} h={1.1} c="oklch(0.6 0.03 230)" />
          <Cyl x={x + 0.22} y={8.22} z={1.1} r={0.22} h={0.35} c="oklch(0.85 0.1 85)" />
        </g>
      ))}
      <Light x={10.4} y={6.4} z={0.95} />

      {/* Shredder with hopper */}
      <Box x={11.2} y={6.1} w={1.7} d={1.8} h={1.5} c={M} />
      <Box x={11.4} y={6.3} z={1.5} w={1.3} d={1.4} h={0.6} c={M2} />
      <Light x={12.8} y={6.2} z={1.4} delay={0.4} />

      {/* Float-sink wash tank */}
      <Box x={13.4} y={6.2} w={3} d={1.6} h={1.1} c={M2} top="var(--pi-water)" />
      <g className="ig-loop animate-[ig-blink_1.8s_ease-in-out_infinite]">
        {[14, 15, 15.8].map((x) => {
          const [wx, wy] = iso(x, 7, 1.1);
          return <ellipse key={x} cx={wx} cy={wy} rx="6" ry="2.4" className="fill-white/50" />;
        })}
      </g>

      {/* Silo (behind) and dryer with steam */}
      <Cyl x={18} y={4.4} r={0.8} h={3.4} c={WALL} top={shade(WALL, 4)} />
      <Cyl x={17.3} y={6.9} r={0.6} h={2.3} c={M} top={M2} />
      {[0, 0.9, 1.8].map((delay, i) => {
        const [sx, sy] = iso(17.3, 6.9, 2.5);
        return (
          <circle
            key={i}
            cx={sx + (i - 1) * 4}
            cy={sy}
            r="6"
            className="ig-pop ig-loop animate-[ig-rise_2.7s_ease-out_infinite] fill-white/70 dark:fill-white/30"
            style={{ animationDelay: `${delay}s` }}
          />
        );
      })}
      <Light x={17.9} y={6.6} z={2} delay={0.8} />

      {/* Extruder + pelletiser */}
      <Box x={18.8} y={6.5} w={2.6} d={1} h={1} c={M} />
      <Box x={19} y={6.65} z={1} w={0.8} d={0.7} h={0.7} c={M2} />
      <Box x={21.5} y={6.4} w={0.9} d={1.2} h={1.3} c={SAND} />
      <Light x={21.3} y={6.6} z={1.05} delay={1.2} />

      {/* Packed bags on pallets, ready to dispatch */}
      {[[18.5, 10.6], [19.9, 10.6], [18.5, 9.2]].map(([x, y], i) => (
        <g key={i}>
          <Box x={x} y={y} w={1.2} d={1.2} h={0.15} c="oklch(0.65 0.06 70)" />
          <Box x={x + 0.1} y={y + 0.1} z={0.15} w={1} d={1} h={0.9} c="oklch(0.96 0.01 85)" />
        </g>
      ))}

      {/* Front columns of the cut-away hall + glass roof outline */}
      {[[22.3, 11.8], [6, 11.8], [22.3, 3]].map(([x, y]) => (
        <Box key={`${x}-${y}`} x={x} y={y} z={0.15} w={0.22} d={0.22} h={3.6} c={WALL} />
      ))}
      <polygon
        points={pts(iso(6, 3, 3.75), iso(22.5, 3, 3.75), iso(22.5, 12, 3.75), iso(6, 12, 3.75))}
        className="fill-white/10 stroke-white/60 dark:fill-white/5 dark:stroke-white/25"
        strokeWidth="1.2"
        strokeDasharray="5 5"
      />

      {/* Effluent treatment plant: clarifier tank with a slow ripple */}
      <Cyl x={24} y={5.5} r={1.1} h={0.9} c="oklch(0.8 0.02 220)" top="var(--pi-water)" />
      {(() => {
        const [ex, ey] = iso(24, 5.5, 0.9);
        return (
          <ellipse cx={ex} cy={ey} rx="10" ry="5.8" className="ig-pop ig-loop animate-[ig-pulse_3s_ease-out_infinite] fill-none stroke-white/80" strokeWidth="1.5" />
        );
      })()}
      <Cyl x={24.6} y={8.2} r={0.5} h={1.6} c="oklch(0.8 0.02 220)" />

      {/* Inbound truck: drives in, stops on the weighbridge, drives on */}
      <g
        className="ig-loop animate-[ig-truck_9s_ease-in-out_infinite]"
        style={{ "--t0x": run(-12), "--t0y": runY(-12), "--t1x": run(26), "--t1y": runY(26) } as React.CSSProperties}
      >
        <ellipse cx={iso(4.6, 14.6)[0]} cy={iso(4.6, 14.6)[1]} rx="46" ry="16" className="fill-black/10" />
        <Box x={3.1} y={14} z={0.3} w={2.6} d={1.3} h={1.5} c="oklch(0.96 0.01 85)" />
        <Box x={5.8} y={14} z={0.3} w={1} d={1.3} h={1.15} c="var(--pi-machine)" />
        <polygon points={pts(iso(6.8, 14.15, 0.85), iso(6.8, 15.15, 0.85), iso(6.8, 15.15, 1.3), iso(6.8, 14.15, 1.3))} className="fill-[oklch(0.82_0.05_220)]" />
        {[3.6, 5.1, 6.3].map((x) => {
          const [wx, wy] = iso(x, 15.3, 0.25);
          return <ellipse key={x} cx={wx} cy={wy} rx="5" ry="6" style={{ fill: "var(--pi-dark)" }} />;
        })}
      </g>
    </svg>
  );
}

export function PlantTeaser() {
  const pin = (i: number) => {
    const [x, y] = iso(...stopsAt[i]);
    return { left: `${((x - VB.x) / VB.w) * 100}%`, top: `${((y - VB.y) / VB.h) * 100}%` };
  };
  return (
    <Section id="plant" className="bg-teal-deep text-paper dark:bg-card dark:text-foreground">
      <div className="grid items-center gap-10 lg:grid-cols-[0.7fr_1.3fr]">
        <Reveal>
          <p className="text-sm font-medium tracking-wide text-mint uppercase">{plant.kicker}</p>
          <h2 id="plant-title" className="mt-3 text-3xl leading-tight font-normal sm:text-5xl">
            {plant.title}
          </h2>
          <p className="mt-5 text-lg text-pretty text-paper/75 dark:text-muted-foreground">{plant.body}</p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-paper/20 pt-6 dark:border-border">
            {plant.stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl sm:text-3xl">{s.value}</dd>
                <dd className="mt-1 text-xs text-paper/70 sm:text-sm dark:text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.1}>
          <figure>
            <div className="relative">
              <Scene />
              {/* Numbered stops, HTML so they stay readable at any size */}
              {plant.stops.map((label, i) => (
                <span
                  key={label}
                  aria-hidden
                  className="ig ig-pop absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-xs font-semibold text-teal-deep shadow-[var(--shadow-float)] ring-2 ring-mint/70 dark:bg-mint dark:text-ink"
                  style={{ ...pin(i), "--d": `${0.4 + i * 0.1}s` } as React.CSSProperties}
                >
                  {i + 1}
                </span>
              ))}
            </div>
            <figcaption>
              <ol className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-4">
                {plant.stops.map((label, i) => (
                  <li key={label} className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-mint dark:text-primary">{i + 1}</span>
                    {label}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-paper/60 dark:text-muted-foreground">{plant.note}</p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
      <FigureNote ids={plant.ids} className="text-paper/60 dark:text-muted-foreground" />
    </Section>
  );
}
