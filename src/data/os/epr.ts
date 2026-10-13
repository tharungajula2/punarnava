/**
 * EPR credits. Process from R1; prices and volumes from assumptions.ts.
 * Punarnava is not registered as a Plastic Waste Processor yet, so no real
 * certificates exist — the simulation's figures are labelled sample.
 */
import { getAssumption, v } from "../assumptions";

export const steps = [
  { title: "Consents in hand", body: "KSPCB Consent for Establishment and Consent for Operation." },
  { title: "Register as a Plastic Waste Processor", body: "On CPCB's Common EPR Portal: capacity, process, GST, photos, electricity data." },
  { title: "Pass the physical audit", body: "Certificates become usable only after audit / validation." },
  { title: "Generate certificates", body: "Against processed, invoiced and reconciled tonnes — capped by declared capacity." },
  { title: "Sell to obligated brands (PIBOs)", body: "Periodically, to several buyers; contracts state who owns material vs certificate." },
];

export function eprScenarios() {
  const outKgMonth = v("output_t_month") * 1000;
  const row = (label: string, id: "epr_credit_price" | "epr_market_low" | "epr_market_high", note: string) => ({
    label,
    priceKg: v(id),
    status: getAssumption(id).status,
    monthly: outKgMonth * v(id),
    annual: outKgMonth * v(id) * 12,
    note,
  });
  return [
    row("Base case (used in the model)", "epr_credit_price", "R2: do not underwrite above this."),
    row("2026 market range — low", "epr_market_low", "Upside only."),
    row("2026 market range — high", "epr_market_high", "Upside only; weak price discovery."),
  ];
}

export function eprSummary() {
  return {
    registered: false,
    outputTMonth: v("output_t_month"),
    basePrice: v("epr_credit_price"),
    pelletPrice: v("pellet_price"),
    ebitdaKg: v("ebitda_kg_base"),
    ebitdaKgNoEpr: v("ebitda_kg_no_epr"),
    pibos: v("registered_pibos"),
    pwps: v("registered_pwps"),
    recycledContent: [
      { year: "FY26", pct: v("epr_cat1_recycled_content_fy26") },
      { year: "FY27", pct: v("epr_cat1_recycled_content_fy27") },
      { year: "FY28", pct: v("epr_cat1_recycled_content_fy28") },
      { year: "FY29+", pct: v("epr_cat1_recycled_content_fy29") },
    ],
    pwpProcessingDays: v("lic_pwp_processing_days"),
    pwpAuditDays: v("lic_pwp_audit_days"),
  };
}
