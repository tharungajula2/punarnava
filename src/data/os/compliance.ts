/**
 * Compliance & licences tracker. Sequence, authorities, documents and planning
 * timelines from research/01-market.md (R1) and 02-unit-economics.md (R2).
 * Timelines are planning allowances, not statutory SLAs, unless stated.
 * Status is the real state today: nothing has been applied for yet.
 */
import { getAssumption, num, v, type AssumptionId, type Status } from "../assumptions";

export type LicenceStatus = "not-started" | "preparing" | "applied" | "granted" | "not-applicable";

export const licenceStatusLabel: Record<LicenceStatus, string> = {
  "not-started": "Not started",
  preparing: "Preparing",
  applied: "Applied",
  granted: "Granted",
  "not-applicable": "Not applicable",
};

export type Licence = {
  id: string;
  name: string;
  authority: string;
  stage: "Set-up" | "Before construction" | "Before production" | "Before EPR certificates" | "If applicable";
  documents: string[];
  timeline: { low?: AssumptionId; high?: AssumptionId; unit: string; text?: string };
  status: LicenceStatus;
  notes?: string;
};

export const licences: Licence[] = [
  {
    id: "incorporation",
    name: "Company incorporation & PAN",
    authority: "MCA / Income Tax",
    stage: "Set-up",
    documents: ["Founder KYC", "Registered office proof", "MoA / AoA (Pvt Ltd) or LLP agreement"],
    timeline: { unit: "", text: "Typically days" },
    status: "not-started",
    notes: "Pvt Ltd or LLP is normally preferable for project finance and contracts (R1).",
  },
  {
    id: "gst",
    name: "GST registration",
    authority: "GST authorities",
    stage: "Set-up",
    documents: ["PAN", "Place-of-business proof", "Bank details", "Authorised signatory KYC"],
    timeline: { unit: "", text: "Generally days if documents are clean" },
    status: "not-started",
    notes: "Needed for B2B invoicing; GST-linked records also back EPR traceability.",
  },
  {
    id: "land",
    name: "Industrial land / compatible lease",
    authority: "KIADB or private industrial property",
    stage: "Before construction",
    documents: ["Title / lease deed", "Zoning & permitted-use confirmation", "Landlord consent for ETP and drainage works"],
    timeline: { low: "lic_land_months_low", high: "lic_land_months_high", unit: "months" },
    status: "not-started",
    notes: "Lease should be conditional on KSPCB-compatible use and a legal treated-water / sludge route (R2).",
  },
  {
    id: "cfe",
    name: "KSPCB Consent for Establishment (CFE)",
    authority: "Karnataka State Pollution Control Board (XGN portal)",
    stage: "Before construction",
    documents: ["Process flow", "Water balance", "ETP design", "Air / noise controls", "Site & land documents", "Investment details"],
    timeline: { low: "lic_cfe_days_low", high: "kspcb_consent_days", unit: "days" },
    status: "not-started",
    notes: "Get written classification of the exact process first (sorting, cold/hot wash, extrusion).",
  },
  {
    id: "factory-plan",
    name: "Factory building / machinery layout approval",
    authority: "Dept. of Factories, Boilers, Industrial Safety & Health",
    stage: "Before construction",
    documents: ["Building plans", "Machinery layout", "Safety arrangements"],
    timeline: { low: "lic_factory_plan_days_low", high: "lic_factory_plan_days_high", unit: "days" },
    status: "not-started",
  },
  {
    id: "fire",
    name: "Building & fire approvals",
    authority: "KIADB / local authority / Fire Department",
    stage: "Before production",
    documents: ["Building plan", "Fire-load & storage plan", "Hydrant / sprinkler layout as applicable"],
    timeline: { low: "lic_fire_days_low", high: "lic_fire_days_high", unit: "days" },
    status: "not-started",
    notes: "Baled plastic is a high fire load — separate raw-stock and finished-goods zones (R1, R2).",
  },
  {
    id: "power",
    name: "Electrical sanction (HT connection)",
    authority: "BESCOM / Electrical Inspectorate",
    stage: "Before production",
    documents: ["Load application", "Single-line diagram", "Installation test report"],
    timeline: { unit: "", text: "Not researched yet" },
    status: "not-started",
    notes: "R2 sizes the 5 t/day plant on HT-2a supply. Refresh the model with a live BESCOM bill before financial close.",
  },
  {
    id: "cfo",
    name: "KSPCB Consent for Operation (CFO)",
    authority: "Karnataka State Pollution Control Board",
    stage: "Before production",
    documents: ["CFE copy", "Inspection readiness: ETP and controls as built", "Commissioning details"],
    timeline: { low: "lic_cfo_days_low", high: "lic_cfo_days_high", unit: "days" },
    status: "not-started",
  },
  {
    id: "factory-licence",
    name: "Factory registration & licence",
    authority: "Dept. of Factories, Boilers, Industrial Safety & Health",
    stage: "Before production",
    documents: ["Approved plans", "Worker count", "Connected power", "Safety arrangements"],
    timeline: { high: "lic_factory_licence_days", unit: "working days" },
    status: "not-started",
  },
  {
    id: "pwp",
    name: "Plastic Waste Processor registration",
    authority: "CPCB Common EPR Portal / KSPCB workflow",
    stage: "Before EPR certificates",
    documents: ["CFE / CFO", "Capacity & process description", "GST details", "Geo-tagged plant photos", "Electricity data", "Waste characterisation"],
    timeline: { high: "lic_pwp_processing_days", unit: "days", text: `processing target; physical audit within ${num(v("lic_pwp_audit_days"))} days` },
    status: "not-started",
    notes: `Fresh registration valid ${num(v("lic_pwp_valid_years"))} year; renewal 3 years. Certificates usable only after audit.`,
  },
  {
    id: "hazwaste",
    name: "Hazardous-waste authorisation",
    authority: "KSPCB",
    stage: "If applicable",
    documents: ["Residue classification (ETP sludge, used oil)", "Storage & disposal arrangements"],
    timeline: { high: "lic_hazwaste_days", unit: "days", text: "maximum after a complete application" },
    status: "not-started",
    notes: "Do not assume exemption — classify all residues.",
  },
  {
    id: "udyam",
    name: "Udyam (MSME) registration",
    authority: "Ministry of MSME",
    stage: "Set-up",
    documents: ["Aadhaar of signatory", "PAN", "GSTIN"],
    timeline: { unit: "", text: "Not researched yet" },
    status: "not-started",
    notes: "Mentioned in R2 as applicable; may matter for MSE schemes and DIC subsidy eligibility.",
  },
];

export type LicenceRow = {
  id: string;
  name: string;
  authority: string;
  stage: string;
  status: string;
  timeline: string;
  timelineStatus: Status | null;
  documents: string[];
  notes: string;
};

export function licenceRows(): LicenceRow[] {
  return licences.map((l) => {
    const lo = l.timeline.low ? v(l.timeline.low) : null;
    const hi = l.timeline.high ? v(l.timeline.high) : null;
    const range = lo !== null && hi !== null ? `${num(lo)}–${num(hi)} ${l.timeline.unit}` : hi !== null ? `≤ ${num(hi)} ${l.timeline.unit}` : "";
    const timeline = [range, l.timeline.text].filter(Boolean).join(" · ");
    const ids = [l.timeline.low, l.timeline.high].filter(Boolean) as AssumptionId[];
    const st = ids.map((id) => getAssumption(id).status);
    return {
      id: l.id,
      name: l.name,
      authority: l.authority,
      stage: l.stage,
      status: licenceStatusLabel[l.status],
      timeline,
      timelineStatus: st.length ? (st.includes("placeholder") ? "placeholder" : "researched") : null,
      documents: l.documents,
      notes: l.notes ?? "",
    };
  });
}

/** Critical path to compliant production, from R1/R2 sequencing. */
export const sequence = ["Land / lease", "KSPCB CFE", "Factory plan approval", "Install line + ETP", "Fire & power", "KSPCB CFO", "Factory licence", "PWP registration + audit"];

export const timeToProductionMonths = () => v("time_to_production_months");
