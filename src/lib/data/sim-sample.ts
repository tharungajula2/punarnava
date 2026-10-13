import "server-only";
import { BUFFER_ORDER, PlantSim, clock, getKpis, inventoryKg, placeById, unitLabel, UNIT_DEFS } from "@/sim";
import type { BufferId, DayRecord, Lot, UnitId } from "@/sim/types";
import { defaultParams } from "@/sim/params";

/**
 * SAMPLE operating data for the OS modules: four weeks of the base-case plant,
 * produced by the same deterministic engine as /sim (fixed seed). Every number
 * traces back to assumptions.ts; nothing here is a real record.
 */
export const SAMPLE_DAYS = 28;
const SEED = 7;

export type SampleTrip = { id: string; lot: number; when: string; day: number; point: string; truck: string; kg: number };
export type SampleLot = {
  id: string;
  point: string;
  received: string;
  kgIn: number;
  kgPacked: number;
  yieldPct: number | null;
  qcHoursAfterReceipt: number | null;
  stage: string;
};
export type SampleDispatch = { id: string; when: string; day: number; buyer: string; kg: number; revenue: number };
export type SampleUnit = {
  id: UnitId;
  name: string;
  status: string;
  utilisationPct: number;
  uptimePct: number;
  processedKg: number;
  kwhPerT: number | null;
  breakdowns: number;
};

export type SimSample = {
  days: number;
  trips: SampleTrip[];
  lots: SampleLot[];
  dispatches: SampleDispatch[];
  daily: (DayRecord & { label: string })[];
  units: SampleUnit[];
  inventory: { id: BufferId; kg: number }[];
  inventorySeries: { label: string; baleYardT: number; wipT: number; finishedT: number }[];
  kpis: ReturnType<typeof getKpis>;
  losses: { sortRejects: number; washLoss: number; processLoss: number };
  eprCreditsKg: number;
};

const when = (t: number) => {
  const c = clock(t);
  return `Day ${c.day} · ${c.weekday} ${String(c.hour).padStart(2, "0")}:${String(c.minute).padStart(2, "0")}`;
};

const stageOf = (l: Lot) => {
  const m = l.milestones;
  if (m.dispatched !== undefined) return "Dispatched";
  if (m.packed !== undefined) return "Packed";
  if (m.qc !== undefined) return "QC released";
  if (m.pelletized !== undefined) return "Pelletised";
  if (m.washed !== undefined) return "Washed";
  if (m.sorted !== undefined) return "Sorted";
  return "Received";
};

let cached: SimSample | null = null;

export function simSample(): SimSample {
  if (cached) return cached;
  const params = defaultParams();
  const sim = new PlantSim(params, SEED);
  const s = sim.state;
  const lots = new Map<number, Lot>();
  const trips: SampleTrip[] = [];
  const dispatches: SampleDispatch[] = [];

  for (let i = 0; i < SAMPLE_DAYS * 1440; i++) {
    const nextLot = s.nextLot;
    const dispatched = s.mass.dispatched;
    const revenue = s.money.pelletRevenue + s.money.eprRevenue;
    sim.step();
    for (const lot of s.lots) {
      if (lot.id < nextLot || lots.has(lot.id)) continue;
      lots.set(lot.id, lot); // engine mutates this object as the lot moves on
      const truck = s.trucks.find((t) => t.kind === "inbound" && t.phase === "unloading" && t.target === lot.pointId);
      trips.push({
        id: `TRIP-${String(trips.length + 1).padStart(3, "0")}`,
        lot: lot.id,
        when: when(s.t),
        day: clock(s.t).day,
        point: placeById(lot.pointId).name,
        truck: truck ? truck.id.toUpperCase() : "—",
        kg: lot.kgIn,
      });
    }
    if (s.mass.dispatched > dispatched) {
      const truck = s.trucks.find((t) => t.kind === "outbound" && t.target);
      dispatches.push({
        id: `DSP-${String(dispatches.length + 1).padStart(3, "0")}`,
        when: when(s.t),
        day: clock(s.t).day,
        buyer: truck?.target ? placeById(truck.target).name : "—",
        kg: s.mass.dispatched - dispatched,
        revenue: s.money.pelletRevenue + s.money.eprRevenue - revenue,
      });
    }
  }

  const unitRows: SampleUnit[] = UNIT_DEFS.map(({ id }) => {
    const u = s.units[id];
    const window = u.scheduledMin + u.downScheduledMin;
    return {
      id,
      name: unitLabel(id),
      status: u.status,
      utilisationPct: window > 0 ? (u.runningMin / window) * 100 : 0,
      uptimePct: window > 0 ? (1 - u.downScheduledMin / window) * 100 : 0,
      processedKg: u.processedKg,
      kwhPerT: u.processedKg > 0 && u.energyKwh > 0 ? u.energyKwh / (u.processedKg / 1000) : null,
      breakdowns: u.breakdowns,
    };
  });

  const inv = inventoryKg(s);
  cached = {
    days: SAMPLE_DAYS,
    trips,
    lots: [...lots.values()].map((l) => ({
      id: `LOT-${String(l.id).padStart(4, "0")}`,
      point: placeById(l.pointId).name,
      received: when(l.milestones.received ?? 0),
      kgIn: l.kgIn,
      kgPacked: l.kgPacked,
      yieldPct: l.milestones.packed !== undefined && l.kgIn > 0 ? (l.kgPacked / l.kgIn) * 100 : null,
      qcHoursAfterReceipt: l.milestones.qc !== undefined && l.milestones.received !== undefined ? (l.milestones.qc - l.milestones.received) / 60 : null,
      stage: stageOf(l),
    })),
    dispatches,
    daily: s.days.map((d) => ({ ...d, label: `D${d.day + 1}` })),
    units: unitRows,
    inventory: BUFFER_ORDER.map((id) => ({ id, kg: inv[id] })),
    inventorySeries: s.hourly
      .filter((_, i) => i % 6 === 0)
      .map((h) => {
        const c = clock(h.t);
        return { label: `D${c.day} ${String(c.hour).padStart(2, "0")}h`, baleYardT: h.baleYardT, wipT: h.wipT, finishedT: h.finishedT };
      }),
    kpis: getKpis(s, params),
    losses: { ...s.mass.losses },
    eprCreditsKg: s.eprCreditsKg,
  };
  return cached;
}
