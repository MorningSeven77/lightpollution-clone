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

export function radianceToBortleEstimate(radiance: number): BortleEstimate {
  const clampedRadiance = Math.max(radiance, 0);
  const logRadiance = Math.log10(clampedRadiance + 1);
  const rawSqm = SQM_AT_ZERO_RADIANCE - logRadiance * LOG_SCALE_FACTOR;
  const sqm = Math.min(Math.max(rawSqm, SQM_MIN), SQM_MAX);

  const match = BORTLE_SQM_THRESHOLDS.find((t) => sqm >= t.minSqm);
  const bortleClass = match ? match.bortleClass : DARKEST_BORTLE_CLASS;

  return { radiance: clampedRadiance, bortleClass, sqm: Math.round(sqm * 100) / 100 };
}
