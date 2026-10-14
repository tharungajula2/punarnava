/**
 * Punarnava plant simulation engine — pure TypeScript, no React, no Date, no
 * Math.random. Advances in fixed one-minute steps; all randomness comes from a
 * seeded generator stored in the state, so the same seed + the same inputs
 * always give the same result.
 *
 * Material moves as FIFO "parcels" tagged with the lot (truckload) they came
 * from, which gives batch tracking for free. Money is booked as costs/revenue
 * when they happen and as cash when paid or collected (payables/receivables).
 */
import { BUYERS, COLLECTION_POINTS, PLANT, distanceKm, placeById } from "./layout";
import type {
  BufferId,
  CostKind,
  DayRecord,
  LineUnitId,
  LogEntry,
  Lot,
  Parcel,
  Scenario,
  SimEvent,
  SimParams,
  SimState,
  Truck,
  UnitId,
  UnitState,
} from "./types";

export const MIN_PER_HOUR = 60;
export const MIN_PER_DAY = 1440;
const MIN_PER_MONTH = (365 / 12) * MIN_PER_DAY;
const EPS = 1e-9;
const HOURLY_CAP = 24 * 60; // 60 days of hourly samples
const LOG_CAP = 60;
const DONE_LOTS_CAP = 12;

export const BUFFER_ORDER: BufferId[] = [
  "baleYard",
  "sorted",
  "flakes",
  "washed",
  "silo",
  "melt",
  "qcHold",
  "packQueue",
  "finishedGoods",
];

export const LINE_UNITS: LineUnitId[] = ["sorting", "shredder", "wash", "dryer", "extruder", "pelletizer"];

interface UnitDef {
  id: UnitId;
  input: BufferId;
  output: BufferId;
  schedule: "line" | "shift";
}

export const UNIT_DEFS: UnitDef[] = [
  { id: "sorting", input: "baleYard", output: "sorted", schedule: "line" },
  { id: "shredder", input: "sorted", output: "flakes", schedule: "line" },
  { id: "wash", input: "flakes", output: "washed", schedule: "line" },
  { id: "dryer", input: "washed", output: "silo", schedule: "line" },
  { id: "extruder", input: "silo", output: "melt", schedule: "line" },
  { id: "pelletizer", input: "melt", output: "qcHold", schedule: "line" },
  { id: "qc", input: "qcHold", output: "packQueue", schedule: "shift" },
  { id: "packing", input: "packQueue", output: "finishedGoods", schedule: "shift" },
];

/** Buffers with no surge-bin limit (yards, QC hold, warehouse). */
const UNBOUNDED: BufferId[] = ["baleYard", "qcHold", "packQueue", "finishedGoods"];

// ── Random numbers (mulberry32) ──────────────────────────────────────────────
function rand(s: SimState): number {
  let x = (s.rng = (s.rng + 0x6d2b79f5) | 0);
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
}

// ── Derived constants ───────────────────────────────────────────────────────
/** Loss fraction applied to each unit's own input, under the current scenario. */
export function lossFractions(p: SimParams, sc: Scenario): Partial<Record<UnitId, number>> {
  const baseSort = p.contaminationPct;
  return {
    sorting: sc.contaminationPct / 100,
    wash: p.lossWashPct / (100 - baseSort),
    extruder: p.lossProcessPct / (100 - baseSort - p.lossWashPct),
  };
}

/** Share of plant input that reaches each unit in the researched base case. */
function baseFraction(p: SimParams, id: LineUnitId): number {
  const s = p.contaminationPct / 100;
  const w = p.lossWashPct / 100;
  const pr = p.lossProcessPct / 100;
  switch (id) {
    case "sorting":
      return 1;
    case "shredder":
    case "wash":
      return 1 - s;
    case "dryer":
    case "extruder":
      return 1 - s - w;
    case "pelletizer":
      return 1 - s - w - pr;
  }
}

export function baseYield(p: SimParams): number {
  return 1 - (p.contaminationPct + p.lossWashPct + p.lossProcessPct) / 100;
}

/** kWh per kg handled by a unit, calibrated so the base case uses kwhPerTInput. */
function kwhPerKg(p: SimParams, id: LineUnitId): number {
  return ((p.energySharePct[id] / 100) * (p.kwhPerTInput / 1000)) / baseFraction(p, id);
}

/** Part of the electricity bill that does not move with kWh (demand charge, duty). */
export function fixedPowerMonth(p: SimParams): number {
  return Math.max(0, p.electricityMonth - p.electricityKwhMonth * p.powerTariff);
}

function isOperatingDay(p: SimParams, day: number): boolean {
  return day >= 0 && day % 7 < p.operatingDaysWeek;
}

/** "productive" = line runs, "planned" = cleaning / changeover / PM, "off" = no shift. */
export function scheduleAt(p: SimParams, sc: Scenario, t: number, kind: "line" | "shift"): "productive" | "planned" | "off" {
  const day = Math.floor(t / MIN_PER_DAY);
  const shifts = Math.max(1, Math.min(3, Math.round(sc.shifts)));
  const netPerShift = (p.netLineHours / p.baseShifts) * MIN_PER_HOUR;
  for (const d of [day, day - 1]) {
    if (!isOperatingDay(p, d)) continue;
    for (let i = 0; i < shifts; i++) {
      const start = d * MIN_PER_DAY + (p.firstShiftHour + i * p.shiftHours) * MIN_PER_HOUR;
      const end = start + p.shiftHours * MIN_PER_HOUR;
      if (t >= start && t < end) {
        if (kind === "shift") return "productive";
        return t < start + netPerShift ? "productive" : "planned";
      }
    }
  }
  return "off";
}

function truckWindowOpen(p: SimParams, t: number): boolean {
  const day = Math.floor(t / MIN_PER_DAY);
  const hour = (t % MIN_PER_DAY) / MIN_PER_HOUR;
  return isOperatingDay(p, day) && hour >= p.truckStartHour && hour < p.truckEndHour;
}

function travelMinutes(p: SimParams, placeId: string): number {
  return Math.max(1, Math.round((distanceKm(PLANT, placeById(placeId)) / p.truckSpeedKmh) * MIN_PER_HOUR));
}

// ── Buffer helpers ──────────────────────────────────────────────────────────
export function bufferKg(s: SimState, id: BufferId): number {
  let kg = 0;
  for (const parcel of s.buffers[id]) kg += parcel.kg;
  return kg;
}

function push(s: SimState, id: BufferId, parcel: Parcel) {
  const list = s.buffers[id];
  const last = list[list.length - 1];
  // Merge with the tail parcel of the same lot (within 10 min so QC hold stays honest).
  if (last && last.lot === parcel.lot && parcel.t - last.t <= 10) last.kg += parcel.kg;
  else list.push({ ...parcel });
}

/** Removes up to `kg` from the front of a buffer (optionally only parcels that arrived by `before`). */
function take(s: SimState, id: BufferId, kg: number, before = Infinity): Parcel[] {
  const list = s.buffers[id];
  const out: Parcel[] = [];
  let need = kg;
  while (need > EPS && list.length > 0 && list[0].t <= before) {
    const head = list[0];
    if (head.kg <= need + EPS) {
      out.push(head);
      need -= head.kg;
      list.shift();
    } else {
      out.push({ ...head, kg: need });
      head.kg -= need;
      need = 0;
    }
  }
  return out;
}

function available(s: SimState, id: BufferId, before: number): number {
  let kg = 0;
  for (const parcel of s.buffers[id]) {
    if (parcel.t > before) break;
    kg += parcel.kg;
  }
  return kg;
}

// ── Money helpers ───────────────────────────────────────────────────────────
function spend(s: SimState, kind: CostKind, amount: number, payLater = 0) {
  if (amount === 0) return;
  s.money.costs[kind] += amount;
  s.today.cost += amount;
  if (payLater > 0) s.money.payables.push({ due: s.t + payLater, amount });
  else {
    s.money.cash -= amount;
    s.money.paid += amount;
  }
}

function settleDues(s: SimState) {
  const { receivables, payables } = s.money;
  while (receivables.length && receivables[0].due <= s.t) {
    const r = receivables.shift()!;
    s.money.cash += r.amount;
    s.money.received += r.amount;
  }
  while (payables.length && payables[0].due <= s.t) {
    const d = payables.shift()!;
    s.money.cash -= d.amount;
    s.money.paid += d.amount;
  }
}

function log(s: SimState, kind: LogEntry["kind"], text: string) {
  s.log.unshift({ t: s.t, kind, text });
  if (s.log.length > LOG_CAP) s.log.length = LOG_CAP;
}

// ── State construction ──────────────────────────────────────────────────────
function emptyUnit(id: UnitId): UnitState {
  return {
    id,
    status: "idle",
    reason: "off-shift",
    rateKgH: 0,
    processedKg: 0,
    energyKwh: 0,
    runningMin: 0,
    scheduledMin: 0,
    downScheduledMin: 0,
    repairLeft: 0,
    breakdowns: 0,
  };
}

function emptyDay(day: number, cash: number): DayRecord {
  return { day, inKg: 0, producedKg: 0, soldKg: 0, revenue: 0, cost: 0, cashEnd: cash };
}

export function scenarioFrom(p: SimParams): Scenario {
  return {
    feedstockPrice: p.feedstockPrice,
    pelletPrice: p.pelletPrice,
    throughputTpd: p.throughputTpd,
    shifts: p.shifts,
    powerTariff: p.powerTariff,
    contaminationPct: p.contaminationPct,
  };
}

export function createState(p: SimParams, seed: number): SimState {
  const trucks: Truck[] = [];
  for (let i = 0; i < p.inboundTrucks; i++) {
    trucks.push({ id: `in-${i + 1}`, kind: "inbound", phase: "parked", target: null, cargoKg: 0, timer: 0, phaseMinutes: 0, trips: 0 });
  }
  trucks.push({ id: "out-1", kind: "outbound", phase: "parked", target: null, cargoKg: 0, timer: 0, phaseMinutes: 0, trips: 0 });

  const buffers = Object.fromEntries(BUFFER_ORDER.map((b) => [b, [] as Parcel[]])) as unknown as SimState["buffers"];
  const units = Object.fromEntries(UNIT_DEFS.map((u) => [u.id, emptyUnit(u.id)])) as Record<UnitId, UnitState>;

  return {
    t: 0,
    seed,
    rng: seed | 0,
    scenario: scenarioFrom(p),
    buffers,
    units,
    points: COLLECTION_POINTS.map((c) => ({ id: c.id, stockKg: 0, collectedKg: 0 })),
    trucks,
    weighbridge: { truckId: null, weighings: 0 },
    lots: [],
    doneLots: [],
    nextLot: 1,
    nextBuyer: 0,
    mass: { weighedIn: 0, packed: 0, dispatched: 0, losses: { sortRejects: 0, washLoss: 0, processLoss: 0 } },
    money: {
      pelletRevenue: 0,
      eprRevenue: 0,
      costs: { feedstock: 0, inbound: 0, power: 0, water: 0, consumables: 0, maintenance: 0, outbound: 0, labour: 0, rent: 0, overhead: 0 },
      cash: p.startingCash,
      received: 0,
      paid: 0,
      receivables: [],
      payables: [],
    },
    energyKwh: 0,
    waterM3: 0,
    eprCreditsKg: 0,
    lotYield: { kgIn: 0, kgPacked: 0 },
    events: [],
    log: [{ t: 0, kind: "info", text: "Day 1, Monday 00:00 — plant empty, trucks parked." }],
    today: emptyDay(0, p.startingCash),
    days: [],
    hour: { inKg: 0, outKg: 0, lineKg: 0 },
    hourly: [],
  };
}

// ── The simulation ──────────────────────────────────────────────────────────
export class PlantSim {
  readonly params: SimParams;
  state: SimState;

  constructor(params: SimParams, seed = 1) {
    this.params = params;
    this.state = createState(params, seed);
  }

  setScenario(patch: Partial<Scenario>) {
    this.state.scenario = { ...this.state.scenario, ...patch };
    this.state.scenario.shifts = Math.max(1, Math.min(3, Math.round(this.state.scenario.shifts)));
  }

  trigger(event: SimEvent) {
    const s = this.state;
    const p = this.params;
    if (event.kind === "breakdown") {
      const id = event.unit ?? LINE_UNITS[Math.floor(rand(s) * LINE_UNITS.length)];
      breakDown(s, id, Math.round(p.mttrHours * MIN_PER_HOUR));
      return;
    }
    const days = event.kind === "monsoon" ? p.monsoonDays : p.priceShockDays;
    s.events = s.events.filter((e) => e.kind !== event.kind);
    s.events.push({ kind: event.kind, start: s.t, end: s.t + days * MIN_PER_DAY });
    log(
      s,
      "warn",
      event.kind === "monsoon"
        ? `Monsoon: feedstock supply down ${p.monsoonDipPct}% for ${days} days.`
        : `Price shock: pellet price down ${p.priceShockPct}% for ${days} days.`,
    );
  }

  /** Advance by whole minutes. */
  run(minutes: number) {
    for (let i = 0; i < minutes; i++) this.step();
  }

  step() {
    const s = this.state;
    const p = this.params;

    if (s.t > 0 && s.t % MIN_PER_DAY === 0) closeDay(s);
    if (s.t % MIN_PER_DAY === 0) accrueSupply(s, p);

    expireEvents(s);
    settleDues(s);
    fixedCosts(s, p);
    runUnits(s, p);
    runInbound(s, p);
    runOutbound(s, p);
    trackLots(s);

    s.t += 1;
    if (s.t % MIN_PER_HOUR === 0) sampleHour(s);
  }
}

function breakDown(s: SimState, id: LineUnitId, minutes: number) {
  const u = s.units[id];
  u.repairLeft = Math.max(u.repairLeft, minutes);
  u.breakdowns += 1;
  u.status = "down";
  u.reason = "breakdown";
  log(s, "bad", `${unitLabel(id)} broke down — repair ≈ ${Math.round(minutes / 6) / 10} h.`);
}

export function unitLabel(id: UnitId): string {
  return {
    sorting: "Sorting line",
    shredder: "Shredder",
    wash: "Wash line",
    dryer: "Dryer",
    extruder: "Extruder",
    pelletizer: "Pelletizer",
    qc: "QC lab",
    packing: "Packing",
  }[id];
}

function expireEvents(s: SimState) {
  const before = s.events.length;
  s.events = s.events.filter((e) => {
    if (e.end > s.t) return true;
    log(s, "good", e.kind === "monsoon" ? "Monsoon dip over — supply back to normal." : "Pellet price recovered.");
    return false;
  });
  return before !== s.events.length;
}

function supplyFactor(s: SimState, p: SimParams) {
  return s.events.some((e) => e.kind === "monsoon") ? 1 - p.monsoonDipPct / 100 : 1;
}

export function priceFactor(s: SimState, p: SimParams) {
  return s.events.some((e) => e.kind === "priceShock") ? 1 - p.priceShockPct / 100 : 1;
}

/** Collection points gain the day's supply at midnight on operating days. */
function accrueSupply(s: SimState, p: SimParams) {
  const day = Math.floor(s.t / MIN_PER_DAY);
  if (!isOperatingDay(p, day)) return;
  const total = s.scenario.throughputTpd * 1000 * supplyFactor(s, p);
  COLLECTION_POINTS.forEach((c, i) => {
    const noise = 0.85 + 0.3 * rand(s); // mean 1
    s.points[i].stockKg += total * (c.share ?? 0) * noise;
  });
}

function fixedCosts(s: SimState, p: SimParams) {
  const perMin = 1 / MIN_PER_MONTH;
  spend(s, "labour", p.labourMonth * (s.scenario.shifts / p.baseShifts) * perMin);
  spend(s, "rent", p.rentMonth * perMin);
  spend(s, "overhead", p.overheadMonth * perMin);
  spend(s, "power", fixedPowerMonth(p) * perMin);
}

function runUnits(s: SimState, p: SimParams) {
  const losses = lossFractions(p, s.scenario);
  const capacity = p.lineRateKgH / MIN_PER_HOUR;
  const breakChance = Number.isFinite(p.mtbfHours) && p.mtbfHours > 0 ? 1 / (p.mtbfHours * MIN_PER_HOUR) : 0;

  // Downstream first, so space freed this minute can be used upstream next minute.
  for (let i = UNIT_DEFS.length - 1; i >= 0; i--) {
    const def = UNIT_DEFS[i];
    const u = s.units[def.id];
    const sched = scheduleAt(p, s.scenario, s.t, def.schedule);
    u.rateKgH = 0;

    if (u.repairLeft > 0) {
      u.repairLeft -= 1;
      if (sched === "productive") u.downScheduledMin += 1;
      if (u.repairLeft === 0) log(s, "good", `${unitLabel(def.id)} repaired.`);
      else {
        u.status = "down";
        u.reason = "breakdown";
        continue;
      }
    }
    if (sched !== "productive") {
      u.status = sched === "planned" ? "maintenance" : "idle";
      u.reason = sched === "planned" ? "planned" : "off-shift";
      continue;
    }
    u.scheduledMin += 1;

    const loss = losses[def.id] ?? 0;
    const before = def.id === "qc" ? s.t - p.qcHoldHours * MIN_PER_HOUR : Infinity;
    const avail = available(s, def.input, before);
    const space = UNBOUNDED.includes(def.output) ? Infinity : Math.max(0, p.bufferKg - bufferKg(s, def.output));
    const amount = Math.min(capacity, avail, space / (1 - loss));

    if (amount <= EPS) {
      u.status = "idle";
      u.reason = avail <= EPS ? "starved" : "blocked";
      continue;
    }

    const moved = take(s, def.input, amount, before);
    for (const parcel of moved) {
      const out = parcel.kg * (1 - loss);
      const lost = parcel.kg - out;
      if (def.id === "sorting") s.mass.losses.sortRejects += lost;
      else if (def.id === "wash") s.mass.losses.washLoss += lost;
      else if (def.id === "extruder") s.mass.losses.processLoss += lost;
      push(s, def.output, { lot: parcel.lot, kg: out, t: s.t });
      if (def.id === "packing") {
        const lot = s.lots.find((l) => l.id === parcel.lot);
        if (lot) lot.kgPacked += out;
      }
    }

    u.status = "running";
    u.reason = null;
    u.runningMin += 1;
    u.processedKg += amount;
    u.rateKgH = amount * MIN_PER_HOUR;

    if (def.schedule === "line") {
      const id = def.id as LineUnitId;
      const kwh = amount * kwhPerKg(p, id);
      u.energyKwh += kwh;
      s.energyKwh += kwh;
      spend(s, "power", kwh * s.scenario.powerTariff);
      if (id === "sorting") s.hour.lineKg += amount;
      if (id === "wash") {
        const frac = baseFraction(p, "wash");
        s.waterM3 += (amount * p.waterM3PerTInput) / 1000 / frac;
        spend(s, "water", (amount * p.costWaterKgOut * baseYield(p)) / frac);
      }
      if (rand(s) < breakChance) breakDown(s, id, Math.max(30, Math.round(p.mttrHours * MIN_PER_HOUR * (0.5 + rand(s)))));
    }
    if (def.id === "packing") {
      s.mass.packed += amount;
      s.today.producedKg += amount;
      s.hour.outKg += amount;
      spend(s, "consumables", amount * p.costConsumablesKgOut);
      spend(s, "maintenance", amount * p.costMaintenanceKgOut);
    }
  }
}

function setPhase(t: Truck, phase: Truck["phase"], minutes: number) {
  t.phase = phase;
  t.timer = minutes;
  t.phaseMinutes = minutes;
}

function runInbound(s: SimState, p: SimParams) {
  const minLoad = (p.minLoadPct / 100) * p.inboundPayloadKg;
  for (const truck of s.trucks) {
    if (truck.kind !== "inbound") continue;
    if (truck.timer > 0) truck.timer -= 1;

    if (truck.phase === "parked") {
      if (!truckWindowOpen(p, s.t)) continue;
      // Richest point that no other truck is already heading to.
      const busy = new Set(s.trucks.filter((x) => x.kind === "inbound" && x.phase !== "parked").map((x) => x.target));
      let best: (typeof s.points)[number] | null = null;
      for (const pt of s.points) if (!busy.has(pt.id) && pt.stockKg >= minLoad && (!best || pt.stockKg > best.stockKg)) best = pt;
      if (best) {
        truck.target = best.id;
        setPhase(truck, "to-point", travelMinutes(p, best.id));
      }
      continue;
    }
    if (truck.timer > 0) continue;

    if (truck.phase === "to-point") setPhase(truck, "loading", p.loadMinutes);
    else if (truck.phase === "loading") {
      const pt = s.points.find((x) => x.id === truck.target)!;
      truck.cargoKg = Math.min(p.inboundPayloadKg, pt.stockKg);
      pt.stockKg -= truck.cargoKg;
      pt.collectedKg += truck.cargoKg;
      setPhase(truck, "to-plant", travelMinutes(p, truck.target!));
    } else if (truck.phase === "to-plant") setPhase(truck, "queued", 0);

    if (truck.phase === "queued" && s.weighbridge.truckId === null) {
      s.weighbridge.truckId = truck.id;
      setPhase(truck, "unloading", p.unloadMinutes);
    } else if (truck.phase === "unloading" && truck.timer === 0) {
      receiveLoad(s, p, truck);
      s.weighbridge.truckId = null;
      truck.trips += 1;
      truck.cargoKg = 0;
      truck.target = null;
      setPhase(truck, "parked", 0);
    }
  }
}

function receiveLoad(s: SimState, p: SimParams, truck: Truck) {
  const kg = truck.cargoKg;
  const lot: Lot = { id: s.nextLot++, pointId: truck.target!, kgIn: kg, kgPacked: 0, kgDispatched: 0, milestones: { received: s.t } };
  s.lots.push(lot);
  push(s, "baleYard", { lot: lot.id, kg, t: s.t });
  s.mass.weighedIn += kg;
  s.today.inKg += kg;
  s.hour.inKg += kg;
  s.weighbridge.weighings += 1;
  spend(s, "feedstock", kg * s.scenario.feedstockPrice, p.payableDays * MIN_PER_DAY);
  spend(s, "inbound", kg * p.inboundFreight);
}

function runOutbound(s: SimState, p: SimParams) {
  for (const truck of s.trucks) {
    if (truck.kind !== "outbound") continue;
    if (truck.timer > 0) truck.timer -= 1;

    if (truck.phase === "parked") {
      if (truckWindowOpen(p, s.t) && bufferKg(s, "finishedGoods") >= p.outboundPayloadKg - EPS) {
        truck.target = BUYERS[s.nextBuyer % BUYERS.length].id;
        s.nextBuyer += 1;
        setPhase(truck, "loading", p.loadMinutes);
      }
      continue;
    }
    if (truck.timer > 0) continue;

    if (truck.phase === "loading") {
      dispatch(s, p, truck);
      setPhase(truck, "to-buyer", travelMinutes(p, truck.target!));
    } else if (truck.phase === "to-buyer") {
      setPhase(truck, "unloading", p.unloadMinutes);
    } else if (truck.phase === "unloading") {
      truck.cargoKg = 0;
      setPhase(truck, "returning", travelMinutes(p, truck.target!));
    } else if (truck.phase === "returning") {
      truck.trips += 1;
      truck.target = null;
      setPhase(truck, "parked", 0);
    }
  }
}

/** Goods leave the plant: revenue, EPR credits and a receivable are booked now. */
function dispatch(s: SimState, p: SimParams, truck: Truck) {
  const parcels = take(s, "finishedGoods", Math.min(p.outboundPayloadKg, bufferKg(s, "finishedGoods")));
  let kg = 0;
  for (const parcel of parcels) {
    kg += parcel.kg;
    const lot = s.lots.find((l) => l.id === parcel.lot);
    if (lot) lot.kgDispatched += parcel.kg;
  }
  truck.cargoKg = kg;
  const pellets = kg * s.scenario.pelletPrice * priceFactor(s, p);
  const epr = kg * p.eprPrice;
  s.money.pelletRevenue += pellets;
  s.money.eprRevenue += epr;
  s.money.receivables.push({ due: s.t + p.receivableDays * MIN_PER_DAY, amount: pellets + epr });
  s.mass.dispatched += kg;
  s.eprCreditsKg += kg;
  s.today.soldKg += kg;
  s.today.revenue += pellets + epr;
  spend(s, "outbound", kg * p.costOutboundKgOut);
  log(s, "info", `Dispatched ${(kg / 1000).toFixed(1)} t of pellets to ${placeById(truck.target!).name}.`);
}

/** Stamps lot milestones from where each lot's furthest-behind material sits. */
function trackLots(s: SimState) {
  if (s.lots.length === 0) return;
  const furthestBack = new Map<number, number>();
  BUFFER_ORDER.forEach((b, idx) => {
    for (const parcel of s.buffers[b]) if (!furthestBack.has(parcel.lot)) furthestBack.set(parcel.lot, idx);
  });
  const stamp = (lot: Lot, m: keyof Lot["milestones"], idx: number, stage: number) => {
    if (lot.milestones[m] === undefined && stage >= idx) lot.milestones[m] = s.t;
  };
  for (const lot of s.lots) {
    const stage = furthestBack.get(lot.id) ?? BUFFER_ORDER.length; // gone = past everything
    stamp(lot, "sorted", 1, stage);
    stamp(lot, "washed", 3, stage);
    stamp(lot, "pelletized", 6, stage);
    stamp(lot, "qc", 7, stage);
    if (lot.milestones.packed === undefined && stage >= 8) {
      lot.milestones.packed = s.t;
      s.lotYield.kgIn += lot.kgIn;
      s.lotYield.kgPacked += lot.kgPacked;
    }
    stamp(lot, "dispatched", 9, stage);
  }
  const done = s.lots.filter((l) => l.milestones.dispatched !== undefined);
  if (done.length) {
    s.lots = s.lots.filter((l) => l.milestones.dispatched === undefined);
    s.doneLots = [...done.reverse(), ...s.doneLots].slice(0, DONE_LOTS_CAP);
  }
}

function closeDay(s: SimState) {
  s.today.cashEnd = s.money.cash;
  s.days.push(s.today);
  if (s.days.length > 400) s.days.shift();
  s.today = emptyDay(Math.floor(s.t / MIN_PER_DAY), s.money.cash);
}

function sampleHour(s: SimState) {
  const wip = BUFFER_ORDER.slice(1, 8).reduce((a, b) => a + bufferKg(s, b), 0);
  s.hourly.push({
    t: s.t,
    inKg: s.hour.inKg,
    outKg: s.hour.outKg,
    lineKg: s.hour.lineKg,
    baleYardT: bufferKg(s, "baleYard") / 1000,
    wipT: wip / 1000,
    finishedT: bufferKg(s, "finishedGoods") / 1000,
    cash: s.money.cash,
    marginPerKg: trailingUnitEconomics(s).marginPerKg,
    eprKg: s.eprCreditsKg,
    yieldPct: yieldPct(s),
  });
  if (s.hourly.length > HOURLY_CAP) s.hourly.shift();
  s.hour = { inKg: 0, outKg: 0, lineKg: 0 };
}

// ── Read-only views (the single source for every sim KPI) ───────────────────
/** Unit economics over the last 7 completed days (or today, on day 1). */
export function trailingUnitEconomics(s: SimState) {
  const window = s.days.length ? s.days.slice(-7) : [s.today];
  const sum = (k: keyof DayRecord) => window.reduce((a, d) => a + d[k], 0);
  const sold = sum("soldKg");
  const produced = sum("producedKg");
  const pricePerKg = sold > 0 ? sum("revenue") / sold : null;
  const costPerKg = produced > 0 ? sum("cost") / produced : null;
  return {
    pricePerKg,
    costPerKg,
    marginPerKg: pricePerKg !== null && costPerKg !== null ? pricePerKg - costPerKg : null,
  };
}

export function totalCosts(s: SimState): number {
  return Object.values(s.money.costs).reduce((a, b) => a + b, 0);
}

export function inventoryKg(s: SimState): Record<BufferId, number> {
  return Object.fromEntries(BUFFER_ORDER.map((b) => [b, bufferKg(s, b)])) as Record<BufferId, number>;
}

export function clock(t: number) {
  const day = Math.floor(t / MIN_PER_DAY);
  const minute = t % MIN_PER_DAY;
  return {
    day: day + 1,
    weekday: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day % 7],
    hour: Math.floor(minute / MIN_PER_HOUR),
    minute: minute % MIN_PER_HOUR,
    hourFloat: minute / MIN_PER_HOUR,
  };
}

/** Saleable pellets ÷ feedstock, %: from finished lots once any exist, else from losses so far. */
export function yieldPct(s: SimState): number | null {
  const lossesKg = s.mass.losses.sortRejects + s.mass.losses.washLoss + s.mass.losses.processLoss;
  const y =
    s.lotYield.kgIn > 0
      ? s.lotYield.kgPacked / s.lotYield.kgIn
      : s.mass.packed + lossesKg > 0
        ? s.mass.packed / (s.mass.packed + lossesKg)
        : null;
  return y === null ? null : y * 100;
}

export function getKpis(s: SimState, p: SimParams) {
  const inv = inventoryKg(s);
  const plantInventory = Object.values(inv).reduce((a, b) => a + b, 0);
  const costs = totalCosts(s);
  const revenue = s.money.pelletRevenue + s.money.eprRevenue;
  const sortedKg = s.units.sorting.processedKg;
  const line = LINE_UNITS.map((id) => s.units[id]);
  const scheduled = line.reduce((a, u) => a + u.scheduledMin + u.downScheduledMin, 0);
  const down = line.reduce((a, u) => a + u.downScheduledMin, 0);
  const ue = trailingUnitEconomics(s);
  const receivables = s.money.receivables.reduce((a, d) => a + d.amount, 0);
  const payables = s.money.payables.reduce((a, d) => a + d.amount, 0);
  return {
    tonnesIn: s.mass.weighedIn / 1000,
    tonnesProduced: s.mass.packed / 1000,
    tonnesOut: s.mass.dispatched / 1000,
    yieldPct: yieldPct(s),
    energyKwhPerT: sortedKg > 0 ? s.energyKwh / (sortedKg / 1000) : null,
    waterM3: s.waterM3,
    waterM3PerT: sortedKg > 0 ? s.waterM3 / (sortedKg / 1000) : null,
    uptimePct: scheduled > 0 ? (1 - down / scheduled) * 100 : null,
    inventoryKg: inv,
    plantInventoryT: plantInventory / 1000,
    supplierStockT: s.points.reduce((a, x) => a + x.stockKg, 0) / 1000,
    revenue,
    costs,
    ebitda: revenue - costs,
    costPerKg: ue.costPerKg,
    pricePerKg: ue.pricePerKg,
    marginPerKg: ue.marginPerKg,
    eprCreditsT: s.eprCreditsKg / 1000,
    bags: Math.floor(s.mass.packed / p.bagKg),
    cash: s.money.cash,
    receivables,
    payables,
    pelletPriceNow: s.scenario.pelletPrice * priceFactor(s, p),
  };
}

export type Kpis = ReturnType<typeof getKpis>;

/** Where a truck is, in layout km, for any renderer. */
export function truckPosition(truck: Truck): { x: number; y: number; atPlant: boolean } {
  const place = truck.target ? placeById(truck.target) : PLANT;
  const progress = truck.phaseMinutes > 0 ? 1 - truck.timer / truck.phaseMinutes : 1;
  const lerp = (f: number) => ({ x: PLANT.x + (place.x - PLANT.x) * f, y: PLANT.y + (place.y - PLANT.y) * f, atPlant: f === 0 });
  switch (truck.phase) {
    case "to-point":
    case "to-buyer":
      return lerp(progress);
    case "to-plant":
    case "returning":
      return lerp(1 - progress);
    case "loading":
      return truck.kind === "inbound" ? lerp(1) : lerp(0);
    case "unloading":
      return truck.kind === "inbound" ? lerp(0) : lerp(1);
    default:
      return lerp(0);
  }
}
