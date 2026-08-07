export type BortleEstimate = {
  radiance: number;
  bortleClass: number;
  sqm: number;
};

// This is a deliberately simplified approximation, not the real atmospheric
// propagation model that lightpollutionmap.app / the Falchi-Cinzano "World
// Atlas" use to turn satellite radiance into sky brightness. VIIRS radiance
// spans several orders of magnitude (near 0 in dark-sky areas to 700+
// nW/sr/cm^2 over city cores), so it's compressed on a log scale and mapped
// onto the SQM range astronomers typically associate with each Bortle class.
const SQM_AT_ZERO_RADIANCE = 22.0;
const LOG_SCALE_FACTOR = 2.0;
const SQM_MIN = 16.0;
const SQM_MAX = 22.0;

// Commonly cited approximate correspondence between SQM (mag/arcsec^2) and
// the Bortle dark-sky scale, from brightest (1) to darkest (9) thresholds.
const BORTLE_SQM_THRESHOLDS: Array<{ bortleClass: number; minSqm: number }> = [
  { bortleClass: 1, minSqm: 21.75 },
  { bortleClass: 2, minSqm: 21.6 },
  { bortleClass: 3, minSqm: 21.3 },
  { bortleClass: 4, minSqm: 20.8 },
  { bortleClass: 5, minSqm: 19.5 },
  { bortleClass: 6, minSqm: 18.5 },
  { bortleClass: 7, minSqm: 18.0 },
  { bortleClass: 8, minSqm: 17.0 },
];
const DARKEST_BORTLE_CLASS = 9;

// Text descriptions live in src/lib/i18n/translations.ts
// (dataLabels.bortleDescriptions) so this module stays language-agnostic.

// Rough, illustrative naked-eye visible-star-count ranges per Bortle class —
// not a precise model, just a commonly cited ballpark to make the numbers
// feel tangible next to the Bortle/SQM values.
export const STAR_COUNT_ESTIMATES: Record<number, { min: number; max: number }> = {
  1: { min: 5000, max: 15000 },
  2: { min: 3000, max: 5000 },
  3: { min: 2000, max: 3000 },
  4: { min: 1000, max: 2000 },
  5: { min: 500, max: 1000 },
  6: { min: 250, max: 500 },
  7: { min: 100, max: 250 },
  8: { min: 50, max: 100 },
  9: { min: 15, max: 50 },
};

// Inverse of the log-scale mapping above — used to pin a color style's
// min/max to specific, meaningful SQM endpoints (e.g. "22 down to 17")
// instead of an arbitrary radiance range tuned by eye.
export function sqmToRadiance(sqm: number): number {
  const logRadiance = (SQM_AT_ZERO_RADIANCE - sqm) / LOG_SCALE_FACTOR;
  return Math.pow(10, logRadiance) - 1;
}

// Radiance breakpoints between each pair of adjacent Bortle classes (1|2,
// 2|3, ..., 8|9 — 8 breakpoints separating 9 classes), derived from the same
// SQM thresholds radianceToBortleEstimate() itself classifies against. Used
// to render the "bortle" legendType styles' map tiles as genuinely discrete
// zones aligned with real Bortle-class boundaries, rather than uniform steps
// across an arbitrary radiance range — the boundaries are heavily
// front-loaded near zero (classes 1-4 are within radiance ~3 of each other;
// classes 5-9 spread across the remaining hundreds) because the underlying
// SQM relationship is logarithmic, not linear. Ascending order, since
// BORTLE_SQM_THRESHOLDS is listed brightest-class-last and sqmToRadiance is
// monotonically increasing as SQM decreases.
export const BORTLE_CLASS_RADIANCE_BREAKPOINTS: number[] = BORTLE_SQM_THRESHOLDS.map((t) => sqmToRadiance(t.minSqm));

export function radianceToBortleEstimate(radiance: number): BortleEstimate {
  const clampedRadiance = Math.max(radiance, 0);
  const logRadiance = Math.log10(clampedRadiance + 1);
  const rawSqm = SQM_AT_ZERO_RADIANCE - logRadiance * LOG_SCALE_FACTOR;
  const sqm = Math.min(Math.max(rawSqm, SQM_MIN), SQM_MAX);

  const match = BORTLE_SQM_THRESHOLDS.find((t) => sqm >= t.minSqm);
  const bortleClass = match ? match.bortleClass : DARKEST_BORTLE_CLASS;

  return { radiance: clampedRadiance, bortleClass, sqm: Math.round(sqm * 100) / 100 };
}
