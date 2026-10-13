/**
 * Competitor map for /lab/competitors, from R3 (research/03-competitors-investors.md).
 * Scale figures live in assumptions.ts (category "competitors"); qualitative
 * fields are R3's descriptions, shortened. `chain` is OUR classification of
 * where each company mainly sits in the value chain, used only for the
 * positioning chart — it is a judgement, not a research figure.
 */
import { getAssumption, v, type AssumptionId } from "../assumptions";

export type Chain = 1 | 2 | 3 | 4;
export const chainLabel: Record<Chain, string> = {
  1: "Collection & aggregation",
  2: "MRF / waste services & EPR",
  3: "Mechanical recycling (pellets / flake)",
  4: "Premium: food-grade, chemical, deodorised",
};

export type Competitor = {
  name: string;
  hq: string;
  /** Assumption holding the scale figure; null when R3 says "unspecified". */
  scaleId: AssumptionId | null;
  scaleNote: string;
  polymers: string;
  model: string;
  funding: string;
  chain: Chain;
  bengaluru: boolean;
  /** Why it matters to Punarnava. */
  relevance: string;
};

export const competitors: Competitor[] = [
  { name: "Banyan Nation", hq: "Hyderabad (Bengaluru plant reported)", scaleId: "comp_banyan_tpa", scaleNote: "Bengaluru plant reported under construction", polymers: "rPE, rPP", model: "Pellets, EPR credits, advisory", funding: "VC + development-finance debt", chain: 4, bengaluru: true, relevance: "Direct rival for clean PE/PP feedstock around Bengaluru once its plant opens." },
  { name: "Lucro Plastecycle", hq: "Mumbai / Gujarat", scaleId: "comp_lucro_tpa", scaleNote: "Collection volume reported higher than recycling", polymers: "LDPE, HDPE, PP (flexibles)", model: "Collection + pellets + own packaging", funding: "Circulate Capital; HUL strategic stake (2025)", chain: 3, bengaluru: false, relevance: "Shows a brand taking equity to secure PCR supply." },
  { name: "Srichakra Polyplast", hq: "Hyderabad", scaleId: "comp_srichakra_tpa", scaleNote: "Actual processed tonnage", polymers: "PET, HDPE, PP", model: "Food-grade bottle-to-bottle resin", funding: "Circulate Capital", chain: 4, bengaluru: false, relevance: "Quality bar for premium rHDPE / rPP." },
  { name: "Ganesha Ecosphere", hq: "Kanpur", scaleId: "comp_ganesha_tpa", scaleNote: "Listed company; capacity above this", polymers: "PET", model: "rPET chips, fibre, yarn", funding: "Public equity and debt", chain: 3, bengaluru: false, relevance: "PET giant — a reason not to start in PET." },
  { name: "revalyu Recycling", hq: "Nashik", scaleId: "comp_revalyu_tpa", scaleNote: "Stated capacity, annualised", polymers: "PET", model: "Chemical recycling; chips and yarn, export-led", funding: "German corporate parent", chain: 4, bengaluru: false, relevance: "Different technology and market; not a feedstock rival for HDPE." },
  { name: "Shakti Plastic Industries", hq: "Mumbai / Palghar", scaleId: "comp_shakti_tpa", scaleNote: "Stated capacity in company material", polymers: "PE, PP, mixed", model: "Collection + recycling + EPR", funding: "Private; LyondellBasell JV", chain: 3, bengaluru: false, relevance: "Its EPR certificate case is a traceability lesson for the whole market." },
  { name: "Re Sustainability", hq: "Hyderabad", scaleId: "comp_re_tpa", scaleNote: "Part installed, part in development", polymers: "rHDPE, rPP, rLDPE", model: "Integrated environmental services + PCR", funding: "KKR majority-owned", chain: 3, bengaluru: false, relevance: "Large group entering the same rHDPE grades." },
  { name: "NEPRA", hq: "Ahmedabad", scaleId: "comp_nepra_tpa", scaleNote: "Dry waste handled, not plastic recycled", polymers: "Mixed dry waste", model: "MRFs, sorting, material resale, EPR", funding: "Aavishkaar, Circulate Capital, BlueEarth", chain: 2, bengaluru: false, relevance: "Model for formalising waste pickers at scale." },
  { name: "Saahas Zero Waste", hq: "Bengaluru", scaleId: "comp_saahas_tpa", scaleNote: "Total waste handled, not plastic recycled", polymers: "Many dry-waste categories", model: "Waste-as-a-service fees + recyclables + EPR", funding: "C4D Partners-led round (2019)", chain: 2, bengaluru: true, relevance: "Possible feedstock partner; service fees reduce scrap-price exposure." },
  { name: "Hasiru Dala Innovations", hq: "Bengaluru", scaleId: null, scaleNote: "Annual tonnage unspecified", polymers: "LDPE milk covers and others", model: "Inclusive waste-picker aggregation", funding: "Rainmatter, Next Bharat (pre-Series A, 2025)", chain: 1, bengaluru: true, relevance: "Possible feedstock partner; proves the local informal model works." },
  { name: "Recykal", hq: "Hyderabad", scaleId: null, scaleNote: "Annual tonnage unspecified (cumulative only)", polymers: "All", model: "Digital marketplace, EPR platform, deposit-return", funding: "Morgan Stanley-led (2022), 360 ONE (2024), bridge (2026)", chain: 1, bengaluru: false, relevance: "Likely channel for selling EPR certificates and buying feedstock." },
  { name: "ReCircle", hq: "Mumbai", scaleId: null, scaleNote: "Annual tonnage unspecified (cumulative only)", polymers: "All", model: "EPR programmes, MRFs, traceability", funding: "Flipkart Ventures, 3i Partners, Acumen", chain: 2, bengaluru: false, relevance: "EPR buyer-side intermediary." },
];

/** Plain rows for the table and chart (resolved on the server). */
export function competitorRows() {
  return competitors.map((c) => {
    const a = c.scaleId ? getAssumption(c.scaleId) : null;
    return {
      ...c,
      chainLabel: chainLabel[c.chain],
      tpa: c.scaleId ? v(c.scaleId) : null,
      scaleStatus: a?.status ?? null,
      scaleConfidence: a?.confidence ?? null,
      scaleSource: a?.source ?? "research/03-competitors-investors.md",
      scaleDetail: a?.notes ?? c.scaleNote,
    };
  });
}

/** Punarnava's planned position on the same chart (pellet output per year). */
export function punarnavaPoint() {
  return { name: "Punarnava (planned)", tpa: v("output_t_month") * 12, chain: 3 as Chain };
}
