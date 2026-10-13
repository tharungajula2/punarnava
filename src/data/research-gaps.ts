/**
 * Open research questions, each with a ready-to-paste prompt for ChatGPT deep research.
 * Shown in /admin/assumptions and /lab/research-gaps. Tick one off by deleting it once its answer is in /research
 * and assumptions.ts has been updated.
 */
export type ResearchGap = {
  id: string;
  title: string;
  why: string;
  /** Assumption ids this would firm up. */
  affects: string[];
  prompt: string;
};

const CONTEXT =
  "Context: I am setting up a ~5 tonne/day post-consumer rigid HDPE wash-and-pelletise recycling plant in outer Bengaluru (Nelamangala–Dabaspete corridor), Karnataka, India. Today is October 2026. For every number, give the source URL, the date, and say whether it is a real quote/transaction, an asking price or an estimate. Do not blend sources that are not comparable. Where you cannot find something, say so instead of estimating.";

export const researchGaps: ResearchGap[] = [
  {
    id: "source-urls",
    title: "Clickable sources for the numbers we already use",
    why: "The three research files have no working links, so no number can be called 'verified'. Investors will ask for sources.",
    affects: ["epr_cat1_recycled_content_fy27", "registered_pibos", "epr_credit_price", "india_recycled_plastics_market_2026"],
    prompt: `${CONTEXT}

Task: For each claim below, give the primary source (Gazette notification, CPCB/MoEFCC page, Lok Sabha/Rajya Sabha reply, company page, or market report) with a full URL and publication date. Prefer official government sources.
1. Recycled-content obligation for Category I rigid plastic packaging: 30% FY2025-26, 40% FY2026-27, 50% FY2027-28, 60% FY2028-29 onward (G.S.R. 237(E), 31 March 2026).
2. Minimum recycling share of the EPR target for Category I: 50% / 60% / 70% / 80% for FY2024-25 to FY2027-28.
3. 65,241 registered PIBOs and 3,117 registered plastic waste processors (August 2026).
4. CPCB/MoEFCC plastic waste generation: India 4.136 million t and Karnataka 360,781 t in FY2022-23.
5. IMARC India recycled plastics market US$4.64 billion (2026).
6. Karnataka Industrial Policy 2025-30 capital incentive and ETP support for MSMEs.
Output a table: claim | exact figure in the source | URL | date | confirmed / differs (and by how much).`,
  },
  {
    id: "hdpe-feedstock",
    title: "Real Bengaluru HDPE feedstock prices and sellers",
    why: "Feedstock is ~70% of cost per kg. ₹38/kg is a planning number sitting above a single ₹30/kg listing.",
    affects: ["feedstock_price", "hdpe_scrap_bengaluru", "inbound_freight", "yield"],
    prompt: `${CONTEXT}

Task: Build a feedstock price and supplier map for post-consumer rigid HDPE (shampoo/detergent/milk bottles, jerrycans, crates excluded) in Bengaluru.
1. Current ₹/kg bands at each step: kabadiwala, secondary aggregator/baler, MRF/Dry Waste Collection Centre, direct bulk generator — separately for natural/white, coloured and mixed HDPE, loose vs baled.
2. Typical monthly volumes available per aggregator and how many such sellers operate within 40 km of Nelamangala. Name 10 real aggregators, DWCCs or associations (with contact route, not private numbers).
3. How prices moved over the last 12 months and what drives swings (monsoon, imports, recycler demand).
4. Typical contamination, moisture and reject % reported for bales of this material, and what a recycler should specify in a purchase contract.
5. Inbound freight ₹/kg for 100–300 km hauls in a 9–16 t truck from Bengaluru and from Tumkur/Hosur/Mysuru.`,
  },
  {
    id: "pellet-buyers",
    title: "Who actually buys recycled HDPE pellets, and at what price",
    why: "The ₹82/kg pellet price and 0% signed offtake are the weakest link in the model. Investors fund offtake, not capacity.",
    affects: ["pellet_price", "hdpe_pellet_black_low", "hdpe_pellet_natural", "signed_offtake_pct"],
    prompt: `${CONTEXT}

Task: Identify the real buyers of non-food-grade recycled HDPE pellets within South India.
1. List 15 converters/compounders/moulders (pipes, drums, crates, films, automotive, furniture) that buy recycled HDPE — company, town, product, whether they state they use PCR, and how to contact them.
2. For each grade (natural, black, coloured): current delivered price ₹/kg ex-GST from actual quotes or transaction reports, MFI range typically demanded, and typical payment terms in days.
3. Technical data sheet parameters buyers ask for and how long qualification takes.
4. Virgin HDPE blow-moulding and injection grade delivered price in Bengaluru for the last 12 months (monthly), so I can compute the recycled discount.
5. Any buyer that has published a recycled-content target that would require non-food HDPE.`,
  },
  {
    id: "epr-prices",
    title: "What EPR certificates really sell for, and the registration steps",
    why: "EPR is modelled at ₹1.10/kg against public quotes up to ₹20/kg. We need to know which is real, and exactly what registration costs and takes.",
    affects: ["epr_credit_price", "epr_market_low", "epr_market_high", "kspcb_consent_days"],
    prompt: `${CONTEXT}

Task: EPR certificate economics for a mechanical recycler of Category I rigid HDPE.
1. Actual transaction prices (₹/kg or ₹/tonne) for Category I recycling certificates in FY2024-25, FY2025-26 and so far in FY2026-27, from named brokers, platforms (Recykal, ReCircle, EPR exchanges) or court/enforcement documents. Separate certificate-only from bundled compliance services.
2. Step-by-step registration of a Plastic Waste Processor on the CPCB Common EPR Portal: documents, fees, timelines, audit process, and what blocks certificate generation.
3. How certificate quantity is calculated from processed tonnage, whether rejects/caps/labels count, and any cap tied to installed capacity.
4. Known cases of certificate cancellation or enforcement against recyclers and what triggered them.
5. Expected effect of the recycled-content mandate on certificate prices over FY2026-27 to FY2028-29.`,
  },
  {
    id: "mandate-demand",
    title: "How the recycled-content mandate turns into demand for non-food HDPE",
    why: "Our landing page promises demand from the mandate. We need the exact legal scope to say it precisely and size the demand.",
    affects: ["epr_cat1_recycled_content_fy27", "epr_cat1_recycled_content_fy29", "india_recycled_plastics_market_2026"],
    prompt: `${CONTEXT}

Task: Explain the Plastic Waste Management (Amendment) Rules 2026 recycled-content obligation for a practical reader.
1. Exact definition of Category I rigid plastic packaging and which HDPE products fall in it (bottles, jerrycans, drums, closures).
2. Which of those are food-contact, pharma or agrochemical and therefore exempt or carry-forward, and which are non-food packaging that can use ordinary recycled HDPE.
3. Who is obligated, how recycled content is verified (certificates, audits), and penalties for non-compliance.
4. An estimate, with workings, of annual tonnes of recycled HDPE needed in India and Karnataka in FY2026-27 and FY2028-29 to meet the mandate for non-food rigid HDPE packaging, versus current recycled HDPE supply.
5. Whether recycled content can be met with imported or industrial (pre-consumer) scrap, and so whether post-consumer Bengaluru feedstock is advantaged.`,
  },
  {
    id: "machinery-quotes",
    title: "Three installed-price quotes for the 500 kg/h wash-and-pellet line",
    why: "CAPEX of ₹1.8 crore is ±25% pre-quotation. R2 says to RFQ at least three vendors before financing.",
    affects: ["capex_machinery", "capex_etp", "capex_total", "electricity_kwh_t"],
    prompt: `${CONTEXT}

Task: Find at least five Indian (Gujarat, Maharashtra, Tamil Nadu, Delhi-NCR) manufacturers of complete rigid HDPE/PP wash-and-pelletising lines at 400–600 kg/h and give:
1. Company, location, website, years in business, number of installations they cite in India (with customer names if public).
2. Published or reported price for: crusher + friction wash + float-sink + hot wash + dryer; pelletising extruder with degassing and melt filter; and a 20 KLD ETP with recirculation. State what is and is not included (freight, erection, GST).
3. Connected kW, water use per tonne, and guaranteed output kg/h and moisture.
4. Reported problems or reviews from operators.
Finish with a draft RFQ spec (one page) I can email to vendors.`,
  },
  {
    id: "incentives",
    title: "Subsidies and loans we can actually claim at a Nelamangala site",
    why: "No subsidy is assumed. A written eligibility answer could cut the ₹2.8 crore need or the interest cost.",
    affects: ["subsidy_assumed_pct", "funding_total", "raise_amount"],
    prompt: `${CONTEXT}

Task: For a new MSME plastic recycling plant with ~₹1.8 crore plant & machinery in Bengaluru Rural (Nelamangala/Dabaspete):
1. Karnataka Industrial Policy 2025-30: which zone applies, capital/investment subsidy %, caps, stamp duty, electricity-tax, ETP support — with the notification numbers and whether each is currently operational.
2. Central schemes (CGTMSE, MSE-GIFT, PMEGP limits, SIDBI green/circular-economy lines, MUDRA): eligibility, interest rates and collateral norms in 2026.
3. KSIDC/KIADB/KSFC loan products and typical term-loan terms for recycling units.
4. A step-by-step list of what documents the District Industries Centre needs for an eligibility letter.`,
  },
  {
    id: "competitors-bengaluru",
    title: "Competitors and feedstock rivals around Bengaluru",
    why: "Banyan reportedly has a 48,000 TPA Bengaluru plant coming. That could change feedstock prices before we start.",
    affects: ["feedstock_price", "bengaluru_plastic_waste_low", "bengaluru_plastic_waste_high"],
    prompt: `${CONTEXT}

Task: Map existing and planned plastic recyclers (HDPE/PP/PE) within 150 km of Bengaluru.
1. For each: name, location, polymer, stated capacity, status (operating/under construction), PWP registration status if public, known feedstock sources.
2. Verify the Banyan Nation Bengaluru-area plant: location, capacity, expected start date, polymers.
3. Total installed rHDPE/rPP capacity in Karnataka vs reported waste generation, to judge feedstock competition.
4. Any shortage or price-war reports for HDPE scrap in Karnataka in 2025–26.`,
  },
  {
    id: "funding-structure",
    title: "How a ₹3 crore first plant is usually funded in India",
    why: "raise_amount is a placeholder. We need a realistic equity/debt split and investor types for a plant this small.",
    affects: ["raise_amount", "funding_total", "working_capital"],
    prompt: `${CONTEXT}

Task: Funding structure for a first recycling plant needing ~₹2.8–3.5 crore all-in.
1. Realistic split between promoter equity, angel/impact equity, term loan and working-capital limit, with typical interest rates, DSCR and collateral requirements in 2026.
2. Named Indian investors or programmes that fund recycling plants this small (ticket ₹0.5–5 crore): impact funds, angel networks, CSR, brand-backed financing. Give fund, typical ticket, recent comparable deals.
3. What evidence they ask for at this stage (offtake LoIs, supplier agreements, trial yields, consents).
4. Typical equity dilution for such a round.`,
  },
  {
    id: "rhdpe-market-size",
    title: "How big is the recycled HDPE market in South India, by grade?",
    why: "Market figures cover all recycled plastics nationally. Nothing sizes demand for the one product we would sell.",
    affects: ["india_recycled_plastics_market_2026", "karnataka_recycled_market_2026", "india_recycled_market_cagr"],
    prompt: `${CONTEXT}

Task: Size demand for non-food recycled HDPE pellets in Karnataka, Tamil Nadu, Andhra Pradesh and Telangana.
1. Tonnes/year of recycled HDPE consumed by end use (pipes, drums, crates, blow-moulded containers, film, other), with sources.
2. Split by grade: natural/light vs coloured vs black, and typical price premium of natural over black.
3. How much of the Category I rigid recycled-content obligation (30% → 60%) falls on HDPE packaging in tonnes/year, and how much of it can legally use non-food-grade rHDPE.
4. Growth outlook to 2031 for rHDPE specifically, compared with IMARC's all-plastics 4.45% CAGR.`,
  },
  {
    id: "competitor-verification",
    title: "Check the competitor scale figures against filings",
    why: "Every competitor tonnage in the lab is a company claim or an annualised capacity, so all are low-confidence.",
    affects: ["comp_banyan_tpa", "comp_banyan_blr_tpa", "comp_lucro_tpa", "comp_srichakra_tpa", "comp_ganesha_tpa", "comp_nepra_tpa", "comp_saahas_tpa"],
    prompt: `${CONTEXT}

Task: For Banyan Nation, Lucro Plastecycle, Srichakra Polyplast, Ganesha Ecosphere, revalyu, Shakti Plastic Industries, Re Sustainability, NEPRA, Saahas Zero Waste and Hasiru Dala Innovations:
1. Actual tonnes processed in the latest year from audited accounts, annual reports, MCA filings, CPCB PWP registration data or investor disclosures — separately from stated capacity.
2. Latest revenue and EBITDA if public (MCA/Tofler/annual report).
3. Polymers and grades actually sold, and whether they buy feedstock in Karnataka.
4. Any public PWP registration number and registered processing capacity on the CPCB/Common EPR portal.
Output a table: company | figure | type (actual/capacity/claim) | year | URL.`,
  },
  {
    id: "seed-investors",
    title: "Who writes a first cheque for a ₹2–3 crore recycling plant",
    why: "R3's investor list is for ₹20–50 crore rounds. Our raise is roughly a tenth of that, so the data room must target different investors.",
    affects: ["raise_amount"],
    prompt: `${CONTEXT}

Task: List investors who have made seed or pre-Series A investments of ₹0.5–5 crore in Indian waste, recycling or circular-economy companies since 2023.
1. For each: investor name, type (angel network, impact fund, climate VC, family office, CSR programme, government scheme), ticket range, 2–3 named portfolio deals with dates and amounts.
2. What each one publicly says it looks for (traction, impact metrics, founder profile).
3. Non-dilutive options: grants, accelerators and competitions open to a pre-revenue recycler in Karnataka in 2026–27, with deadlines.
4. Which documents they typically request in a data room at this stage.`,
  },
];
