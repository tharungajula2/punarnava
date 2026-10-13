// Display formatting shared by the OS modules (Indian digit grouping).

const group = (x: number, d: number) =>
  Math.abs(x).toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d });
const sign = (x: number) => (x < 0 ? "−" : "");

/** ₹1,23,456 */
export const inr = (rupees: number, d = 0) => `${sign(rupees)}₹${group(rupees, d)}`;
/** ₹12.3 L */
export const lakh = (rupees: number, d = 1) => `${sign(rupees)}₹${group(rupees / 100_000, d)} L`;
/** ₹2.80 cr */
export const crore = (rupees: number, d = 2) => `${sign(rupees)}₹${group(rupees / 10_000_000, d)} cr`;
/** 12.3 t (from kg) */
export const tonnes = (kg: number, d = 1) => `${sign(kg)}${group(kg / 1000, d)} t`;
/** 1,234 kg */
export const kg = (x: number, d = 0) => `${sign(x)}${group(x, d)} kg`;
export const pct = (x: number, d = 0) => `${sign(x)}${group(x, d)}%`;
export const int = (x: number, d = 0) => `${sign(x)}${group(x, d)}`;
