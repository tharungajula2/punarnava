/**
 * Roadmap & tasks. Phases and gates are the landing-page roadmap (one source);
 * tasks are the founder's real to-do list drawn from the research
 * recommendations. "done" only for work that has actually happened.
 */
import { getAssumption, num, v, type AssumptionId } from "../assumptions";
import { roadmap as landingRoadmap } from "../landing";

export type TaskStatus = "todo" | "doing" | "done";
export type Priority = "P1" | "P2" | "P3";

export type Task = {
  id: string;
  title: string;
  phase: 1 | 2 | 3 | 4;
  module: string;
  status: TaskStatus;
  priority: Priority;
  owner: string;
  notes?: string;
  ownerOnly?: boolean;
};

export const taskStatusLabel: Record<TaskStatus, string> = { todo: "To do", doing: "In progress", done: "Done" };

export const phases = landingRoadmap.phases.map((p, i) => ({ ...p, n: (i + 1) as 1 | 2 | 3 | 4 }));

export const tasks: Task[] = [
  // Phase 1 — Prove
  { id: "t-research", title: "Commission market, unit-economics and competitor research", phase: 1, module: "R&D", status: "done", priority: "P1", owner: "Founder", notes: "Three reports in /research." },
  { id: "t-model", title: "Build the investor site, assumptions file and plant simulation", phase: 1, module: "R&D", status: "done", priority: "P2", owner: "Founder" },
  { id: "t-strategy", title: "Decide the starting strategy: HDPE pellets vs PET flakes vs feedstock network first", phase: 1, module: "Roadmap", status: "todo", priority: "P1", owner: "Founder", notes: "The three reports disagree; landing uses HDPE pellets as the base case.", ownerOnly: true },
  { id: "t-raise", title: "Set the raise amount and use of funds", phase: 1, module: "Finance", status: "todo", priority: "P1", owner: "Founder", notes: "raise_amount is still a placeholder." },
  { id: "t-trial", title: `Run the live procurement trial across Bengaluru (${num(v("procurement_trial_weeks"))} weeks)`, phase: 1, module: "Feedstock", status: "todo", priority: "P1", owner: "Founder", notes: "Landed cost per kg by source, by week." },
  { id: "t-bale-audit", title: "Audit bales from each prospective source (composition, contamination, moisture)", phase: 1, module: "Quality", status: "todo", priority: "P1", owner: "Founder" },
  { id: "t-feed-mou", title: `Sign feedstock agreements toward the ≥${num(v("gate_feedstock_contracted"))}% gate`, phase: 1, module: "Feedstock", status: "todo", priority: "P1", owner: "Founder" },
  { id: "t-toll", title: `Toll-recycle a trial batch and send pellet samples to ${num(v("sample_converters"))} converters`, phase: 1, module: "Sales", status: "todo", priority: "P1", owner: "Founder" },
  { id: "t-offtake", title: `Sign offtake letters toward the ≥${num(v("gate_offtake_contracted"))}% gate`, phase: 1, module: "Sales", status: "todo", priority: "P1", owner: "Founder" },
  { id: "t-entity", title: "Incorporate the company, then GST and Udyam registration", phase: 1, module: "Compliance", status: "todo", priority: "P2", owner: "Founder" },
  { id: "t-kspcb-class", title: "Get written KSPCB classification of the exact process", phase: 1, module: "Compliance", status: "todo", priority: "P2", owner: "Founder", notes: "Needed before freezing a commissioning schedule (R1)." },
  { id: "t-gaps", title: "Run the research-gap prompts and add source links to assumptions", phase: 1, module: "R&D", status: "todo", priority: "P2", owner: "Founder", notes: "Prompts are on /admin/assumptions." },
  // Phase 2 — Build
  { id: "t-shed", title: "Shortlist sheds in the Nelamangala–Dabaspete corridor with ETP-compatible lease terms", phase: 2, module: "Compliance", status: "todo", priority: "P1", owner: "Founder" },
  { id: "t-rfq", title: "RFQ the line from at least three vendors with performance guarantees", phase: 2, module: "Plant", status: "todo", priority: "P1", owner: "Founder", notes: "Guarantee kg/h, moisture, kW, screen changer, wet trial on our own material (R2)." },
  { id: "t-wc-line", title: "Arrange a working-capital / cash-credit line before commissioning", phase: 2, module: "Finance", status: "todo", priority: "P1", owner: "Founder" },
  { id: "t-subsidy", title: "Confirm DIC / state subsidy eligibility in writing", phase: 2, module: "Finance", status: "todo", priority: "P3", owner: "Founder", notes: "The model counts zero subsidy until then." },
  { id: "t-bescom", title: "Re-run the power cost with a live BESCOM bill for the chosen site", phase: 2, module: "Finance", status: "todo", priority: "P2", owner: "Founder" },
  { id: "t-cfe", title: "Apply for KSPCB Consent for Establishment", phase: 2, module: "Compliance", status: "todo", priority: "P1", owner: "Founder" },
  { id: "t-hire-core", title: "Hire the core team (supervisors, maintenance, QA, store)", phase: 2, module: "Hiring", status: "todo", priority: "P2", owner: "Founder" },
  { id: "t-cfo", title: "Commission the line and ETP; apply for Consent for Operation", phase: 2, module: "Compliance", status: "todo", priority: "P1", owner: "Founder" },
  { id: "t-pwp", title: "Register as a Plastic Waste Processor and pass the audit", phase: 2, module: "EPR", status: "todo", priority: "P1", owner: "Founder" },
  // Phase 3 — Run
  { id: "t-tds", title: "Publish a technical data sheet per grade (MFI, density, moisture, ash, colour)", phase: 3, module: "Quality", status: "todo", priority: "P1", owner: "Founder" },
  { id: "t-trace", title: "Daily mass balance: weighbridge, supplier KYC, lot IDs, GST reconciliation", phase: 3, module: "Operations", status: "todo", priority: "P1", owner: "Founder" },
  { id: "t-epr-sell", title: "Sell EPR certificates to several PIBOs periodically, not speculatively", phase: 3, module: "EPR", status: "todo", priority: "P2", owner: "Founder" },
  // Phase 4 — Scale
  { id: "t-expand", title: `Expansion study for ~${num(v("expansion_input_tpd"))} t/day once yield and offtake gates hold`, phase: 4, module: "Roadmap", status: "todo", priority: "P3", owner: "Founder" },
];

const priorityRank: Record<Priority, number> = { P1: 0, P2: 1, P3: 2 };

export function visibleTasks(isOwner: boolean) {
  return tasks.filter((t) => isOwner || !t.ownerOnly);
}

export function nextActions(isOwner: boolean, n = 5) {
  return visibleTasks(isOwner)
    .filter((t) => t.status !== "done")
    .sort((a, b) => a.phase - b.phase || priorityRank[a.priority] - priorityRank[b.priority])
    .slice(0, n);
}

export function phaseProgress(isOwner: boolean) {
  const list = visibleTasks(isOwner);
  return phases.map((p) => {
    const mine = list.filter((t) => t.phase === p.n);
    const done = mine.filter((t) => t.status === "done").length;
    return { n: p.n, tag: p.tag, name: p.name, when: p.when, gate: p.gate, done, total: mine.length, pct: mine.length ? (done / mine.length) * 100 : 0 };
  });
}

/** Phase 1 → 2 investment gates: where we are vs where we must be. */
export function gates() {
  const g = (label: string, current: AssumptionId, target: AssumptionId) => ({
    label,
    current: v(current),
    target: v(target),
    currentStatus: getAssumption(current).status,
  });
  return [g("Feedstock under written agreement", "signed_feedstock_pct", "gate_feedstock_contracted"), g("Pellet offtake under written agreement", "signed_offtake_pct", "gate_offtake_contracted")];
}
