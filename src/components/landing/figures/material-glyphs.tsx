/**
 * What the material looks like at each step of the value chain, drawn in a 64×64 box.
 * Returned as <g> so the same glyph sits inside the desktop flow diagram or its own
 * small <svg> on phones.
 */
export type GlyphKind = "collect" | "sort" | "shred" | "wash" | "dry" | "extrude" | "pellet" | "supply";

const P = "fill-primary";
const M = "fill-[oklch(0.74_0.12_165)] dark:fill-mint";
const S = "fill-[oklch(0.8_0.07_78)] dark:fill-[oklch(0.75_0.06_78)]";

function Bottle({ x, y, c, s = 1 }: { x: number; y: number; c: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-6" y="-8" width="12" height="20" rx="4" className={c} />
      <rect x="-3" y="-13" width="6" height="6" rx="1.5" className={c} />
    </g>
  );
}

const flakes = [
  [18, 26, 20], [30, 20, -15], [42, 28, 40], [24, 38, 70], [38, 40, -30], [48, 38, 10], [16, 42, -50], [32, 31, 25],
] as const;

function Flakes({ dy = 0 }: { dy?: number }) {
  return (
    <g transform={`translate(0 ${dy})`}>
      {flakes.map(([x, y, r], i) => (
        <path
          key={i}
          d="M-5 -3 L3 -5 L6 2 L-1 5 Z"
          transform={`translate(${x} ${y}) rotate(${r})`}
          className={i % 3 === 0 ? P : i % 3 === 1 ? M : S}
        />
      ))}
    </g>
  );
}

export function Glyph({ kind }: { kind: GlyphKind }) {
  switch (kind) {
    case "collect":
      // A bale: strapped block of mixed bottles
      return (
        <g>
          <rect x="12" y="18" width="40" height="30" rx="4" className={S} />
          <Bottle x={22} y={33} c={P} s={0.8} />
          <Bottle x={32} y={34} c={M} s={0.8} />
          <Bottle x={42} y={33} c={P} s={0.8} />
          <rect x="12" y="24" width="40" height="2.5" className="fill-foreground/40" />
          <rect x="12" y="40" width="40" height="2.5" className="fill-foreground/40" />
        </g>
      );
    case "sort":
      return (
        <g>
          <Bottle x={18} y={30} c={P} />
          <Bottle x={30} y={30} c={P} />
          <line x1="39" y1="14" x2="39" y2="50" className="stroke-muted-foreground/50" strokeWidth="2" strokeDasharray="3 3" />
          <Bottle x={48} y={30} c={M} />
        </g>
      );
    case "shred":
      return <Flakes />;
    case "wash":
      return (
        <g>
          <Flakes dy={-4} />
          <path d="M8 50 q6 -5 12 0 t12 0 t12 0 t12 0" fill="none" className="stroke-[oklch(0.7_0.1_225)]" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="16" r="3" className="fill-[oklch(0.7_0.1_225)]" />
          <circle cx="14" cy="14" r="2" className="fill-[oklch(0.7_0.1_225)]" />
        </g>
      );
    case "dry":
      return (
        <g>
          <Flakes dy={4} />
          {[14, 22, 30].map((y) => (
            <path key={y} d={`M8 ${y - 6} q8 -4 16 0 t16 0`} fill="none" className="stroke-muted-foreground/60" strokeWidth="2" strokeLinecap="round" />
          ))}
        </g>
      );
    case "extrude":
      return (
        <g>
          <rect x="8" y="22" width="30" height="16" rx="4" className={P} />
          <rect x="14" y="14" width="10" height="8" rx="1.5" className="fill-primary/70" />
          <path d="M38 30 C46 30 46 38 56 38" fill="none" className="stroke-[oklch(0.74_0.12_165)] dark:stroke-mint" strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case "pellet":
      return (
        <g>
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse
              key={i}
              cx={18 + (i % 4) * 9.5 + (Math.floor(i / 4) % 2) * 4}
              cy={22 + Math.floor(i / 4) * 9}
              rx="4"
              ry="3.4"
              className={i % 5 === 0 ? P : M}
            />
          ))}
        </g>
      );
    case "supply":
      return (
        <g>
          <path d="M18 18 h28 l4 32 a3 3 0 0 1 -3 3 h-30 a3 3 0 0 1 -3 -3 Z" className={S} />
          <rect x="22" y="14" width="20" height="6" rx="2" className="fill-[oklch(0.7_0.06_78)]" />
          <path d="M24 35 l5 5 l11 -11" fill="none" className="stroke-primary" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
  }
}
