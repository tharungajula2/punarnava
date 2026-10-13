/** Client-safe formatting for an assumption value with its unit. */
export function fmtValue(value: number, unit: string): string {
  const n = value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  if (unit === "%") return `${n}%`;
  if (unit.startsWith("₹")) {
    const rest = unit.slice(1);
    const money = Number.isInteger(value) ? n : value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `₹${money}${rest}`;
  }
  if (unit.startsWith("US$")) return `US$${n}${unit.slice(3)}`;
  return `${n} ${unit}`;
}

/** "research/02-unit-economics.md" → "R2" style short names for tight spaces. */
export function shortSource(source: string): string {
  return source
    .replace(/research\/01-market\.md/g, "R1")
    .replace(/research\/02-unit-economics\.md/g, "R2")
    .replace(/research\/03-competitors-investors\.md/g, "R3");
}
