/**
 * Hero visual: the Punarnava loop. Stages sit on a ring while pellets travel round it.
 * Pure SVG + CSS animation (no JS); the global reduced-motion rule freezes it.
 * Three stacked SVGs share one viewBox so the spinning pellets are their own
 * GPU layer (a transform inside an SVG would repaint the whole graphic each frame).
 */
const VIEW = "-90 -10 580 420"; // C sits exactly at the centre of this box
const C = 200;
const R = 150;

export function LoopGraphic({ stages }: { stages: readonly string[] }) {
  const nodes = stages.map((label, i) => {
    const angle = (i / stages.length) * Math.PI * 2 - Math.PI / 2;
    return { label, x: C + R * Math.cos(angle), y: C + R * Math.sin(angle), angle };
  });

  return (
    <div className="relative overflow-hidden">
      <svg viewBox={VIEW} className="h-auto w-full" role="img" aria-labelledby="loop-title">
        <title id="loop-title">{`The Punarnava loop: ${stages.join(", ")}, and back again`}</title>
        <defs>
          <linearGradient id="loop-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--brand-mint)" />
          </linearGradient>
          <radialGradient id="loop-glow">
            <stop offset="0%" stopColor="var(--brand-mint)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--brand-mint)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={C} cy={C} r={190} fill="url(#loop-glow)" />
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="18" />
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="url(#loop-stroke)"
          strokeWidth="3"
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
      </svg>

      {/* Pellets travelling round the loop */}
      <svg
        viewBox={VIEW}
        aria-hidden
        className="absolute inset-0 h-full w-full animate-[spin_28s_linear_infinite] will-change-transform"
      >
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={C + R * Math.cos(a)}
              cy={C + R * Math.sin(a)}
              r={i % 3 === 0 ? 5 : 3.5}
              className={i % 3 === 0 ? "fill-primary" : "fill-[oklch(0.74_0.12_165)] dark:fill-mint"}
            />
          );
        })}
      </svg>

      <svg viewBox={VIEW} aria-hidden className="absolute inset-0 h-full w-full">
        {nodes.map((n) => {
          const lx = C + (R + 34) * Math.cos(n.angle);
          const ly = C + (R + 34) * Math.sin(n.angle);
          const anchor = Math.abs(lx - C) < 8 ? "middle" : lx > C ? "start" : "end";
          return (
            <g key={n.label}>
              <circle cx={n.x} cy={n.y} r="11" className="fill-card stroke-primary" strokeWidth="2.5" />
              <circle cx={n.x} cy={n.y} r="4" className="fill-primary" />
              <text
                x={lx}
                y={ly}
                dy="0.35em"
                textAnchor={anchor}
                className="fill-foreground font-sans text-[15px] font-medium"
              >
                {n.label}
              </text>
            </g>
          );
        })}

        {/* Centre mark */}
        <circle cx={C} cy={C} r="62" className="fill-card" stroke="var(--border)" />
        <circle
          cx={C}
          cy={C}
          r="34"
          fill="none"
          className="stroke-primary"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray="175 400"
          transform={`rotate(-50 ${C} ${C})`}
        />
        <circle cx={C + 3.6} cy={C - 34} r="7" className="fill-[oklch(0.74_0.12_165)] dark:fill-mint" />
      </svg>
    </div>
  );
}
