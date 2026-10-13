/**
 * Stylised Bengaluru geography for the simulation. Coordinates are kilometres
 * east (x) and north (y) of the plant on the Nelamangala corridor (R2's
 * preferred site). Places are real areas, but the collection points and buyers
 * are SAMPLE locations — Punarnava has no suppliers or customers yet.
 */

export interface Place {
  id: string;
  name: string;
  x: number;
  y: number;
  /** Share of daily feedstock supply (collection points only, sums to 1). */
  share?: number;
}

export const PLANT: Place = { id: "plant", name: "Punarnava plant (Nelamangala)", x: 0, y: 0 };

export const COLLECTION_POINTS: Place[] = [
  { id: "peenya", name: "Peenya (sample)", x: 11, y: -6, share: 0.25 },
  { id: "yeshwanthpur", name: "Yeshwanthpur (sample)", x: 17, y: -9, share: 0.2 },
  { id: "hebbal", name: "Hebbal (sample)", x: 24, y: -4, share: 0.2 },
  { id: "rajajinagar", name: "Rajajinagar (sample)", x: 17, y: -13, share: 0.2 },
  { id: "kengeri", name: "Kengeri (sample)", x: 12, y: -22, share: 0.15 },
];

export const BUYERS: Place[] = [
  { id: "dabaspete", name: "Converter, Dabaspete (sample)", x: -19, y: 11 },
  { id: "peenya-ind", name: "Converter, Peenya (sample)", x: 12, y: -8 },
];

export function placeById(id: string): Place {
  return [PLANT, ...COLLECTION_POINTS, ...BUYERS].find((p) => p.id === id) ?? PLANT;
}

export function distanceKm(a: Place, b: Place): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Approximate Bengaluru sunrise/sunset, for the day/night visual only. */
export const SUNRISE_HOUR = 6;
export const SUNSET_HOUR = 18.5;
