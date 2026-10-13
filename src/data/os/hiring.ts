/**
 * Hiring plan — R2's 5 t/day two-shift roster. Counts and costs come from
 * assumptions.ts; "when" is relative to the first day of production
 * (hire_lead_* are modelling placeholders until the build plan is fixed).
 */
import { getAssumption, v, type AssumptionId, type Status } from "../assumptions";

export type RoleGroup = "core" | "line";

export type Role = {
  id: string;
  title: string;
  group: RoleGroup;
  countId: AssumptionId;
  costId: AssumptionId;
  duties: string;
};

export const roles: Role[] = [
  { id: "supervisor", title: "Shift supervisor", group: "core", countId: "hire_supervisors_count", costId: "hire_supervisors_cost", duties: "Runs a shift: safety, line rate, handovers, daily mass-balance sign-off." },
  { id: "maintenance", title: "Maintenance / electrical technician", group: "core", countId: "hire_maintenance_count", costId: "hire_maintenance_cost", duties: "Preventive maintenance, screen and blade changes, breakdown response." },
  { id: "qa", title: "Quality assurance", group: "core", countId: "hire_qa_count", costId: "hire_qa_cost", duties: "Incoming bale checks, lot sampling, pellet tests, release decisions." },
  { id: "admin", title: "Store / admin", group: "core", countId: "hire_admin_count", costId: "hire_admin_cost", duties: "Weighbridge records, stores, supplier KYC files, GST paperwork." },
  { id: "operator", title: "Machine operator", group: "line", countId: "hire_operators_count", costId: "hire_operators_cost", duties: "Shredder, wash line, dryer, extruder and pelletiser operation." },
  { id: "sorter", title: "Sorter / helper / loader", group: "line", countId: "hire_sorters_count", costId: "hire_sorters_cost", duties: "Bale opening, manual pre-sort, loading, bagging, housekeeping." },
];

export const groupLabel: Record<RoleGroup, string> = { core: "Core team", line: "Line crew" };

export type HiringRow = {
  id: string;
  title: string;
  group: string;
  count: number;
  costMonth: number; // ₹ per FTE, loaded
  totalMonth: number; // ₹
  monthsBefore: number;
  when: string;
  duties: string;
  status: Status;
};

export function hiringPlan() {
  const lead: Record<RoleGroup, AssumptionId> = { core: "hire_lead_core_months", line: "hire_lead_line_months" };
  const rows: HiringRow[] = roles.map((r) => {
    const count = v(r.countId);
    const cost = v(r.costId) * 1000;
    const before = v(lead[r.group]);
    const statuses = [getAssumption(r.countId).status, getAssumption(r.costId).status, getAssumption(lead[r.group]).status];
    return {
      id: r.id,
      title: r.title,
      group: groupLabel[r.group],
      count,
      costMonth: cost,
      totalMonth: count * cost,
      monthsBefore: before,
      when: `${before} month${before === 1 ? "" : "s"} before production`,
      duties: r.duties,
      status: statuses.includes("placeholder") ? "placeholder" : "researched",
    };
  });
  const headcount = rows.reduce((a, r) => a + r.count, 0);
  const payroll = rows.reduce((a, r) => a + r.totalMonth, 0);
  // Payroll build-up by month relative to production start (−N … +3).
  const maxLead = Math.max(...rows.map((r) => r.monthsBefore));
  const timeline = Array.from({ length: maxLead + 4 }, (_, i) => {
    const rel = i - maxLead; // 0 = first production month
    const active = rows.filter((r) => rel >= -r.monthsBefore);
    return {
      label: rel === 0 ? "Start" : rel < 0 ? `M${rel}` : `M+${rel}`,
      core: active.filter((r) => r.group === groupLabel.core).reduce((a, r) => a + r.count, 0),
      line: active.filter((r) => r.group === groupLabel.line).reduce((a, r) => a + r.count, 0),
      payroll: active.reduce((a, r) => a + r.totalMonth, 0),
    };
  });
  return {
    rows,
    headcount,
    payroll,
    checks: { employees: v("employees"), labourMonth: v("labour_month") * 100_000 },
    expansion: { headcount: v("employees_expansion"), managerCost: v("hire_manager_cost") * 1000, scaleTpd: v("expansion_input_tpd") },
    timeline,
  };
}
