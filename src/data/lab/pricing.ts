/**
 * Pricing intelligence for /lab/pricing: feedstock vs pellet vs virgin vs EPR,
 * and the spreads between them. Every figure is an assumption id.
 * R1/R3 both stress there is no exchange price for any of these — the ranges
 * are listings, quotes and planning bands, labelled as such.
 */
import { getAssumption, v, type AssumptionId } from "../assumptions";

export type Band = {
  key: string;
  label: string;
  group: "Feedstock" | "Recycled pellet" | "Virgin resin" | "EPR certificate";
  low: AssumptionId;
  high?: AssumptionId;
  /** Point we plan on, if any. */
  base?: AssumptionId;
  kind: string;
};

export const bands: Band[] = [
  { key: "mixed", label: "Mixed plastic scrap", group: "Feedstock", low: "mixed_plastic_scrap_low", high: "mixed_plastic_scrap_high", kind: "Public collection quote, unsorted" },
  { key: "hdpe-list", label: "HDPE bottle scrap, Bengaluru listing", group: "Feedstock", low: "hdpe_scrap_bengaluru", kind: "Single online listing" },
  { key: "hdpe-feed", label: "Sorted HDPE container feed", group: "Feedstock", low: "hdpe_feed_working_low", high: "hdpe_feed_working_high", base: "feedstock_price", kind: "R1 working range; our planning price" },
  { key: "rhdpe", label: "Recycled HDPE pellet", group: "Recycled pellet", low: "rhdpe_pellet_working_low", high: "rhdpe_pellet_working_high", base: "pellet_price", kind: "R1 working range; our blended planning price" },
  { key: "rhdpe-black", label: "Black reprocessed HDPE, Bengaluru quote", group: "Recycled pellet", low: "hdpe_pellet_black_low", kind: "Low end of a supplier quote" },
  { key: "rhdpe-natural", label: "Natural blow-grade rHDPE", group: "Recycled pellet", low: "hdpe_pellet_natural", kind: "Listing, Jul 2026" },
  { key: "virgin", label: "Virgin HDPE", group: "Virgin resin", low: "virgin_hdpe_low", high: "virgin_hdpe_high", kind: "R1 planning benchmark, not an exchange close" },
  { key: "epr-cert", label: "EPR certificate only (2025)", group: "EPR certificate", low: "epr_cert_only_low", high: "epr_cert_only_high", base: "epr_credit_price", kind: "Intermediary quote; our base case" },
  { key: "epr-market", label: "EPR compliance packages (2026)", group: "EPR certificate", low: "epr_market_low", high: "epr_market_high", kind: "Vendor ranges; include services — not comparable" },
];

const meta = (id: AssumptionId) => {
  const a = getAssumption(id);
  return { id, value: a.value, status: a.status, confidence: a.confidence, source: a.source, label: a.label };
};

export function bandRows() {
  return bands.map((b) => ({
    key: b.key,
    label: b.label,
    group: b.group,
    kind: b.kind,
    low: meta(b.low),
    high: b.high ? meta(b.high) : null,
    base: b.base ? meta(b.base) : null,
  }));
}

/** The spreads that matter, per kg of saleable pellet (base case). */
export function spreads() {
  const y = v("yield") / 100;
  const feedPerOut = v("feedstock_price") / y;
  const rows = [
    {
      key: "virgin-gap",
      label: "Virgin discount: virgin HDPE − our pellet price",
      value: (v("virgin_hdpe_low") + v("virgin_hdpe_high")) / 2 - v("pellet_price"),
      ids: ["virgin_hdpe_low", "virgin_hdpe_high", "pellet_price"] as AssumptionId[],
      note: "Why converters buy recycled at all. Recycled-content mandates can narrow this gap.",
    },
    {
      key: "headline",
      label: "Headline spread: pellet price − feedstock price",
      value: v("pellet_price") - v("feedstock_price"),
      ids: ["pellet_price", "feedstock_price"] as AssumptionId[],
      note: "Looks generous, but ignores that only part of each kilogram bought becomes pellet.",
    },
    {
      key: "yield-adjusted",
      label: "Yield-adjusted spread: pellet price − feedstock ÷ yield",
      value: v("pellet_price") - feedPerOut,
      ids: ["pellet_price", "feedstock_price", "yield"] as AssumptionId[],
      note: "What is left to pay for freight, conversion and overheads.",
    },
    {
      key: "ebitda",
      label: "After all costs: EBITDA per kg (incl. EPR)",
      value: v("ebitda_kg_base"),
      ids: ["ebitda_kg_base"] as AssumptionId[],
      note: "R2's base case. EPR adds only a small slice of it.",
    },
  ];
  return { rows, feedPerOut, yieldPct: v("yield") };
}

/** Waterfall from pellet price to EBITDA per kg output (R2 cost lines). */
export function waterfall() {
  const step = (id: AssumptionId, sign: 1 | -1) => ({ id, label: getAssumption(id).label, value: sign * v(id), status: getAssumption(id).status });
  const steps = [
    step("pellet_price", 1),
    step("epr_credit_price", 1),
    step("cost_feedstock_kg", -1),
    step("cost_inbound_kg", -1),
    step("cost_labour_kg", -1),
    step("cost_power_kg", -1),
    step("cost_overhead_kg", -1),
    step("cost_rent_kg", -1),
    step("cost_other_kg", -1),
  ];
  let running = 0;
  const rows = steps.map((x) => {
    const start = running;
    running += x.value;
    return { ...x, start, end: running };
  });
  return { rows, total: running, top: Math.max(...rows.map((r) => Math.max(r.start, r.end))) };
}

export const pricingNotes = [
  "Buy and sell to a technical data sheet (MFI, density, colour, moisture, ash), not by polymer name — quality moves price more than the label.",
  "Natural / light HDPE is worth much more than mixed black: store it separately rather than blending it down.",
  "Price EPR certificates quarterly and treat them as upside; the plant must stand on pellet margin alone.",
  "Replace every planning band with three same-week delivered quotes before ordering the line.",
];
