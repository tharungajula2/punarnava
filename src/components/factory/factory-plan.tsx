"use client";

import { FACTORY_STOPS } from "@/data/factory-story";
import { cn } from "@/lib/utils";

const stations = [
  { stop: 3, x: 814, y: 271, label: "SORT", sub: "check input", color: "#7bc6ab" },
  { stop: 4, x: 694, y: 271, label: "SHRED", sub: "size the flakes", color: "#87cbbb" },
  { stop: 5, x: 574, y: 271, label: "WASH", sub: "remove dirt", color: "#8bd0d2" },
  { stop: 7, x: 454, y: 271, label: "DRY", sub: "remove water", color: "#a6d8ca" },
  { stop: 8, x: 334, y: 271, label: "EXTRUDE", sub: "melt + filter", color: "#91bcb5" },
  { stop: 9, x: 214, y: 271, label: "PELLET", sub: "cut + cool", color: "#5aa69b" },
] as const;

const markers = [
  { stop: 1, x: 1060, y: 415 },
  { stop: 2, x: 896, y: 413 },
  { stop: 3, x: 855, y: 231 },
  { stop: 4, x: 735, y: 231 },
  { stop: 5, x: 615, y: 231 },
  { stop: 6, x: 1062, y: 194 },
  { stop: 7, x: 495, y: 231 },
  { stop: 8, x: 375, y: 231 },
  { stop: 9, x: 255, y: 231 },
  { stop: 10, x: 211, y: 412 },
  { stop: 11, x: 324, y: 412 },
  { stop: 12, x: 547, y: 412 },
  { stop: 13, x: 541, y: 542 },
] as const;

const mobileStages = [
  { title: "Receive", detail: "Weigh, inspect and hold incoming plastic", span: "01—03" },
  { title: "Prepare", detail: "Sort, shred and wash only suitable material", span: "04—07" },
  { title: "Convert", detail: "Dry, filter and form consistent pellets", span: "08—10" },
  { title: "Release", detail: "Test, pack, store and trace each batch", span: "11—14" },
] as const;

function stageFor(stop: number) {
  return stop <= 2 ? 0 : stop <= 6 ? 1 : stop <= 9 ? 2 : 3;
}

export function FactoryPlan({ active = 0, onSelect, compact = false }: { active?: number; onSelect?: (index: number) => void; compact?: boolean }) {
  return (
    <div className={cn("relative isolate h-full w-full overflow-hidden bg-[#062f32]", compact && "rounded-[inherit]")}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_45%_5%,#1a6060_0,transparent_55%)] opacity-75" />
      <div className="absolute inset-0 hidden md:grid md:place-items-center">
        <div className="relative aspect-[1200/670] w-full max-h-full">
        <svg viewBox="0 0 1200 670" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" role="img" aria-label="Proposed factory plan showing the route from receiving through sorting, washing, pellet making and quality checks to dispatch">
          <defs>
            <pattern id="factory-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 H 0 V 24" fill="none" stroke="#d7e5dd" strokeWidth="1" opacity=".55" /></pattern>
            <marker id="factory-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M 1 1 L 7 4 L 1 7" fill="none" stroke="#0a6866" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></marker>
            <marker id="water-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M 1 1 L 7 4 L 1 7" fill="none" stroke="#52bac1" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></marker>
          </defs>
          <rect x="35" y="42" width="1130" height="592" rx="26" fill="#dfece5" stroke="#acd3c4" strokeWidth="2" />
          <rect x="35" y="42" width="1130" height="592" rx="26" fill="url(#factory-grid)" />
          <path d="M 49 529 H 1149" stroke="#7f9991" strokeWidth="62" opacity=".52" />
          <path d="M 49 529 H 1149" stroke="#fffdf4" strokeWidth="2" strokeDasharray="15 14" opacity=".8" />
          <text x="64" y="583" fill="#365f5b" fontSize="13" fontWeight="700" letterSpacing="2">ONE WAY MATERIAL ROUTE</text>
          <rect x="128" y="133" width="798" height="268" rx="16" fill="#faf9f1" stroke="#94bdb0" strokeWidth="3" />
          <rect x="129" y="134" width="796" height="32" rx="14" fill="#d9eae2" />
          <text x="154" y="157" fill="#225a56" fontSize="13" fontWeight="700" letterSpacing="2">COVERED PROCESS HALL</text>
          <text x="902" y="157" textAnchor="end" fill="#6a9188" fontSize="12">dirty input → clean product</text>
          <path className="factory-flow" d="M 875 338 H 172" stroke="#0a6866" strokeWidth="4" strokeDasharray="11 8" markerEnd="url(#factory-arrow)" />
          {stations.map((station) => (
            <g key={station.label} opacity={active === 0 || active === station.stop || compact ? 1 : .72}>
              <rect x={station.x - 51} y={station.y - 48} width="102" height="98" rx="13" fill={station.color} stroke="#3d8a80" strokeWidth="2" />
              <rect x={station.x - 36} y={station.y - 32} width="72" height="25" rx="4" fill="#f7f8ee" opacity=".72" />
              <text x={station.x} y={station.y + 12} textAnchor="middle" fill="#153f3c" fontSize="13" fontWeight="800" letterSpacing="1">{station.label}</text>
              <text x={station.x} y={station.y + 32} textAnchor="middle" fill="#285e58" fontSize="11">{station.sub}</text>
            </g>
          ))}
          <path className="factory-flow" d="M 1015 434 H 910" stroke="#0a6866" strokeWidth="3.5" strokeDasharray="10 7" markerEnd="url(#factory-arrow)" />
          <path className="factory-flow" d="M 830 402 V 337" stroke="#0a6866" strokeWidth="3.5" strokeDasharray="10 7" markerEnd="url(#factory-arrow)" />
          <path className="factory-flow" d="M 177 337 V 394" stroke="#0a6866" strokeWidth="3.5" strokeDasharray="10 7" markerEnd="url(#factory-arrow)" />
          <path className="factory-flow" d="M 205 452 H 365" stroke="#0a6866" strokeWidth="3.5" strokeDasharray="10 7" markerEnd="url(#factory-arrow)" />
          <path className="factory-flow" d="M 493 488 V 523" stroke="#0a6866" strokeWidth="3.5" strokeDasharray="10 7" markerEnd="url(#factory-arrow)" />
          <path className="factory-flow" d="M 574 223 V 94 H 1012 V 187" fill="none" stroke="#52bac1" strokeWidth="3" strokeDasharray="8 7" markerEnd="url(#water-arrow)" />
          <text x="747" y="87" fill="#338c94" fontSize="12" fontWeight="700" letterSpacing="1.5">WATER LOOP</text>
          <rect x="950" y="183" width="127" height="136" rx="13" fill="#c2e6e0" stroke="#72bcb6" strokeWidth="2" />
          <circle cx="989" cy="237" r="20" fill="#74c2c7" stroke="#e8f6ef" strokeWidth="5" />
          <circle cx="1037" cy="237" r="20" fill="#74c2c7" stroke="#e8f6ef" strokeWidth="5" />
          <text x="1013" y="290" textAnchor="middle" fill="#1a5f64" fontSize="12" fontWeight="800" letterSpacing="1">WATER TREATMENT</text>
          <rect x="784" y="405" width="123" height="94" rx="13" fill="#dfc9a8" stroke="#b99e7c" strokeWidth="2" />
          {[0, 1, 2].map((i) => <rect key={i} x={802 + i * 28} y="419" width="21" height="40" rx="3" fill="#b89368" />)}
          <text x="845" y="480" textAnchor="middle" fill="#554c40" fontSize="12" fontWeight="800" letterSpacing="1">BALE YARD</text>
          <rect x="958" y="407" width="113" height="92" rx="12" fill="#eaf4ec" stroke="#8faea2" strokeWidth="2" />
          <path d="M 975 435 H 1054 M 975 446 H 1054" stroke="#8da79d" strokeWidth="5" />
          <text x="1015" y="483" textAnchor="middle" fill="#345b55" fontSize="12" fontWeight="800" letterSpacing="1">WEIGH</text>
          <rect x="127" y="409" width="91" height="82" rx="12" fill="#e7f4ea" stroke="#a2cbb6" strokeWidth="2" />
          <text x="172" y="462" textAnchor="middle" fill="#265c53" fontSize="13" fontWeight="800">TEST</text>
          <rect x="234" y="409" width="95" height="82" rx="12" fill="#e7f4ea" stroke="#a2cbb6" strokeWidth="2" />
          <text x="281" y="462" textAnchor="middle" fill="#265c53" fontSize="13" fontWeight="800">PACK</text>
          <rect x="344" y="409" width="210" height="82" rx="12" fill="#cae8d9" stroke="#8dbaa8" strokeWidth="2" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={369 + i * 39} y="426" width="23" height="23" rx="3" fill="#f8f7ef" stroke="#91b6a4" />)}
          <text x="447" y="476" textAnchor="middle" fill="#265c53" fontSize="12" fontWeight="800" letterSpacing="1">FINISHED STORAGE</text>
          <rect x="438" y="537" width="110" height="65" rx="11" fill="#0b6463" />
          <text x="493" y="575" textAnchor="middle" fill="#f2fbf7" fontSize="13" fontWeight="800" letterSpacing="1">DISPATCH</text>
          <text x="73" y="112" fill="#47766a" fontSize="12" fontWeight="700" letterSpacing="1.4">CONCEPT PLAN · NOT TO SCALE</text>
          <text x="1126" y="606" textAnchor="end" fill="#4d786e" fontSize="12">separate receiving and finished-goods routes</text>
        </svg>
        {onSelect && markers.map(({ stop, x, y }) => (
          <button
            key={stop}
            type="button"
            onClick={() => onSelect(stop)}
            aria-label={`Explore ${FACTORY_STOPS[stop].title}`}
            title={FACTORY_STOPS[stop].title}
            className={cn("absolute z-10 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-[#075957] text-[10px] font-bold text-white shadow-lg transition-all hover:scale-125 focus-visible:ring-4 focus-visible:ring-amber-300", active === stop && "scale-125 bg-amber-400 text-[#153f3c] ring-4 ring-amber-300/60")}
            style={{ left: `${(x / 1200) * 100}%`, top: `${(y / 670) * 100}%` }}
          >
            {stop + 1}
          </button>
        ))}
        </div>
      </div>
      <div className={cn("absolute inset-0 flex items-center justify-center px-4 py-4 md:hidden", !compact && "sm:px-5")}>
        <ol className="grid w-full grid-cols-2 gap-3">
          {mobileStages.map((stage, index) => (
            <li key={stage.title} className={cn("min-h-32 rounded-2xl border p-4 shadow-xl transition-colors", stageFor(active) === index && active > 0 ? "border-amber-300 bg-amber-100 text-[#174440]" : "border-white/15 bg-[#e8f1e9] text-[#174440]")}>
              <span className="font-mono text-[11px] text-[#39776b]">{stage.span}</span>
              <h3 className="mt-2 font-display text-xl">{stage.title}</h3>
              <p className="mt-1 text-xs leading-snug text-[#46635b]">{stage.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
