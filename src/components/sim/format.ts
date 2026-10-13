import type { UnitStatus } from "@/sim";

export const fmt = {
  t: (kg: number, d = 1) => `${(kg / 1000).toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d })} t`,
  n: (x: number, d = 0) => x.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d }),
  lakh: (rupees: number) => `${rupees < 0 ? "−" : ""}₹${(Math.abs(rupees) / 100_000).toLocaleString("en-IN", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} L`,
  rs: (x: number, d = 2) => `${x < 0 ? "−" : ""}₹${Math.abs(x).toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d })}`,
  clock: (h: number, m: number) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
};

export const statusColor: Record<UnitStatus, string> = {
  running: "var(--status-verified)",
  idle: "var(--muted-foreground)",
  down: "var(--destructive)",
  maintenance: "var(--status-placeholder)",
};

export const statusLabel: Record<UnitStatus, string> = {
  running: "Running",
  idle: "Idle",
  down: "Down",
  maintenance: "Planned stop",
};

export const reasonLabel: Record<string, string> = {
  "off-shift": "no shift",
  starved: "waiting for material",
  blocked: "next stage full",
  planned: "cleaning / changeover",
  breakdown: "breakdown repair",
};
