"use client";

import { Moon, Sun } from "lucide-react";
import { SUNRISE_HOUR, SUNSET_HOUR, clock, getKpis } from "@/sim";
import { fmt } from "./format";
import { useSim } from "./sim-store";

type Card = { label: string; value: string; hint?: string; tone?: "good" | "bad" };

export function KpiCards() {
  const sim = useSim();
  if (!sim) return null;
  const k = getKpis(sim.state, sim.params);
  const dash = "—";

  const cards: Card[] = [
    { label: "Tonnes in", value: fmt.t(k.tonnesIn * 1000), hint: `${fmt.t(k.supplierStockT * 1000)} waiting at points` },
    { label: "Tonnes out", value: fmt.t(k.tonnesOut * 1000), hint: `${fmt.t(k.tonnesProduced * 1000)} packed` },
    { label: "Yield", value: k.yieldPct === null ? dash : `${fmt.n(k.yieldPct, 1)}%`, hint: "saleable pellets ÷ feedstock" },
    { label: "Energy", value: k.energyKwhPerT === null ? dash : `${fmt.n(k.energyKwhPerT)} kWh/t`, hint: "per tonne input" },
    { label: "Water", value: k.waterM3PerT === null ? dash : `${fmt.n(k.waterM3PerT, 2)} m³/t`, hint: `${fmt.n(k.waterM3)} m³ fresh make-up` },
    { label: "Uptime", value: k.uptimePct === null ? dash : `${fmt.n(k.uptimePct, 1)}%`, hint: "of productive line time", tone: k.uptimePct !== null && k.uptimePct < 95 ? "bad" : undefined },
    { label: "Plant inventory", value: fmt.t(k.plantInventoryT * 1000), hint: `${fmt.t(k.inventoryKg.baleYard)} in bale yard` },
    { label: "Cost / kg", value: k.costPerKg === null ? dash : fmt.rs(k.costPerKg), hint: "last 7 days, per kg packed" },
    { label: "Revenue", value: fmt.lakh(k.revenue), hint: `pellets at ${fmt.rs(k.pelletPriceNow, 0)}/kg now` },
    { label: "Margin / kg", value: k.marginPerKg === null ? dash : fmt.rs(k.marginPerKg), hint: "price − cost, last 7 days", tone: k.marginPerKg === null ? undefined : k.marginPerKg < 0 ? "bad" : "good" },
    { label: "EPR credits", value: fmt.t(k.eprCreditsT * 1000), hint: "eligible output dispatched" },
    { label: "Cash", value: fmt.lakh(k.cash), hint: `owed to us ${fmt.lakh(k.receivables)} · we owe ${fmt.lakh(k.payables)}`, tone: k.cash < 0 ? "bad" : undefined },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">{card.label}</p>
          <p
            className={`mt-1 font-display text-xl tabular-nums ${card.tone === "bad" ? "text-destructive" : card.tone === "good" ? "text-primary" : "text-foreground"}`}
          >
            {card.value}
          </p>
          {card.hint && <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{card.hint}</p>}
        </div>
      ))}
    </div>
  );
}

/** Simulated clock with a day/night icon. */
export function SimClock() {
  const sim = useSim();
  if (!sim) return null;
  const c = clock(sim.state.t);
  const isDay = c.hourFloat >= SUNRISE_HOUR && c.hourFloat < SUNSET_HOUR;
  return (
    <div className="flex items-center gap-2.5" aria-label={`Day ${c.day}, ${c.weekday} ${fmt.clock(c.hour, c.minute)}`}>
      {isDay ? <Sun className="size-5 text-chart-2" aria-hidden /> : <Moon className="size-5 text-chart-3" aria-hidden />}
      <div className="leading-tight">
        <p className="text-[11px] text-muted-foreground">
          Day {c.day} · {c.weekday}
        </p>
        <p className="font-mono text-lg tabular-nums">{fmt.clock(c.hour, c.minute)}</p>
      </div>
    </div>
  );
}
