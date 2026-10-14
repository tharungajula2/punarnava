/**
 * Simulation types. Everything here is plain data so a whole SimState can be
 * copied, compared (determinism tests) or handed to any renderer (2D now, 3D in
 * Phase 6). Time is in whole simulated minutes from Monday 00:00 of day 1.
 */

export type LineUnitId = "sorting" | "shredder" | "wash" | "dryer" | "extruder" | "pelletizer";
export type StationId = "qc" | "packing";
export type UnitId = LineUnitId | StationId;

export type BufferId =
  | "baleYard"
  | "sorted"
  | "flakes"
  | "washed"
  | "silo"
  | "melt"
  | "qcHold"
  | "packQueue"
  | "finishedGoods";

export type UnitStatus = "running" | "idle" | "down" | "maintenance";
export type UnitReason = "off-shift" | "starved" | "blocked" | "planned" | "breakdown" | null;

/** Every parameter the engine uses. Built from assumptions.ts by params.ts. */
export interface SimParams {
  // Scenario defaults (sliders start here)
  feedstockPrice: number; // ₹/kg input
  pelletPrice: number; // ₹/kg output
  throughputTpd: number; // feedstock intake, t per operating day
  shifts: number;
  powerTariff: number; // ₹/kWh energy charge
  contaminationPct: number; // sorting rejects, % of input

  inboundFreight: number; // ₹/kg input
  eprPrice: number; // ₹/kg dispatched
  lineRateKgH: number;
  baseShifts: number;
  shiftHours: number;
  netLineHours: number; // productive line-hours per day at baseShifts
  firstShiftHour: number;
  operatingDaysWeek: number;
  lossWashPct: number; // % of plant input at base
  lossProcessPct: number; // % of plant input at base
  kwhPerTInput: number;
  energySharePct: Record<LineUnitId, number>;
  waterM3PerTInput: number;
  costWaterKgOut: number;
  costConsumablesKgOut: number;
  costMaintenanceKgOut: number;
  costOutboundKgOut: number;
  labourMonth: number; // ₹ at baseShifts
  rentMonth: number; // ₹
  overheadMonth: number; // ₹
  electricityMonth: number; // ₹, whole bill at base
  electricityKwhMonth: number;
  receivableDays: number;
  payableDays: number;
  bagKg: number;
  inboundTrucks: number;
  inboundPayloadKg: number;
  minLoadPct: number;
  truckSpeedKmh: number;
  loadMinutes: number;
  unloadMinutes: number;
  truckStartHour: number;
  truckEndHour: number;
  outboundPayloadKg: number;
  bufferKg: number;
  qcHoldHours: number;
  mtbfHours: number; // Infinity disables random breakdowns
  mttrHours: number;
  monsoonDipPct: number;
  monsoonDays: number;
  priceShockPct: number;
  priceShockDays: number;
  startingCash: number; // ₹
}

/** The six sliders. */
export interface Scenario {
  feedstockPrice: number;
  pelletPrice: number;
  throughputTpd: number;
  shifts: number;
  powerTariff: number;
  contaminationPct: number;
}

/** A slice of material in a buffer. `t` = minute it entered that buffer. */
export interface Parcel {
  lot: number;
  kg: number;
  t: number;
}

export interface UnitState {
  id: UnitId;
  status: UnitStatus;
  reason: UnitReason;
  /** kg of input handled in the last minute, as kg/h. */
  rateKgH: number;
  processedKg: number;
  energyKwh: number;
  runningMin: number;
  /** Productive-window minutes, whether running, starved or down. */
  scheduledMin: number;
  downScheduledMin: number;
  repairLeft: number;
  breakdowns: number;
}

export interface CollectionPointState {
  id: string;
  stockKg: number;
  collectedKg: number;
}

export type InboundPhase = "parked" | "to-point" | "loading" | "to-plant" | "queued" | "unloading";
export type OutboundPhase = "parked" | "loading" | "to-buyer" | "unloading" | "returning";

export interface Truck {
  id: string;
  kind: "inbound" | "outbound";
  phase: InboundPhase | OutboundPhase;
  /** Collection point id (inbound) or buyer id (outbound). */
  target: string | null;
  cargoKg: number;
  timer: number;
  phaseMinutes: number;
  trips: number;
}

export type Milestone = "received" | "sorted" | "washed" | "pelletized" | "qc" | "dispatched";

export interface Lot {
  id: number;
  pointId: string;
  kgIn: number;
  kgPacked: number;
  kgDispatched: number;
  milestones: Partial<Record<Milestone | "packed", number>>;
}

export type CostKind =
  | "feedstock"
  | "inbound"
  | "power"
  | "water"
  | "consumables"
  | "maintenance"
  | "outbound"
  | "labour"
  | "rent"
  | "overhead";

export type LossKind = "sortRejects" | "washLoss" | "processLoss";

export interface Due {
  due: number;
  amount: number;
}

export type EventKind = "breakdown" | "monsoon" | "priceShock";

export interface ActiveEvent {
  kind: Exclude<EventKind, "breakdown">;
  start: number;
  end: number;
}

export interface LogEntry {
  t: number;
  kind: "info" | "warn" | "bad" | "good";
  text: string;
}

export interface DayRecord {
  day: number;
  inKg: number;
  producedKg: number;
  soldKg: number;
  revenue: number;
  cost: number;
  cashEnd: number;
}

export interface HourSample {
  t: number;
  inKg: number;
  outKg: number;
  lineKg: number;
  baleYardT: number;
  wipT: number;
  finishedT: number;
  cash: number;
  marginPerKg: number | null;
  eprKg: number;
  yieldPct: number | null;
}

export interface SimState {
  t: number;
  seed: number;
  rng: number;
  scenario: Scenario;
  buffers: Record<BufferId, Parcel[]>;
  units: Record<UnitId, UnitState>;
  points: CollectionPointState[];
  trucks: Truck[];
  weighbridge: { truckId: string | null; weighings: number };
  lots: Lot[];
  doneLots: Lot[];
  nextLot: number;
  nextBuyer: number;
  mass: { weighedIn: number; packed: number; dispatched: number; losses: Record<LossKind, number> };
  money: {
    pelletRevenue: number;
    eprRevenue: number;
    costs: Record<CostKind, number>;
    cash: number;
    received: number;
    paid: number;
    receivables: Due[];
    payables: Due[];
  };
  energyKwh: number;
  waterM3: number;
  eprCreditsKg: number;
  lotYield: { kgIn: number; kgPacked: number };
  events: ActiveEvent[];
  log: LogEntry[];
  today: DayRecord;
  days: DayRecord[];
  hour: { inKg: number; outKg: number; lineKg: number };
  hourly: HourSample[];
}

export type SimEvent =
  | { kind: "breakdown"; unit?: LineUnitId }
  | { kind: "monsoon" }
  | { kind: "priceShock" };
