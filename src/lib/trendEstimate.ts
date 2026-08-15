export type YearlyRadiancePoint = { year: number; radiance: number };

// Extrapolates a modeled radiance value for a year the VIIRS annual
// composite hasn't been published for yet (e.g. the current calendar year),
// via ordinary least-squares linear regression over the most recent years of
// real satellite data. This is a deliberately simple trend projection, not a
// forecast — same "clearly simplified, not a live measurement" spirit as the
// rest of this map's derived estimates (see bortle.ts, stargazing.ts). Only
// the most recent RECENT_YEARS_WINDOW points feed the fit so a decade-old
// reading (back when VIIRS sensor calibration also differed) doesn't pull
// the extrapolated slope away from the area's actual recent trajectory.
const RECENT_YEARS_WINDOW = 6;
const MIN_POINTS_FOR_FIT = 3;

export function estimateRadianceForYear(points: YearlyRadiancePoint[], targetYear: number): number | null {
  const recent = points
    .filter((p) => p.year < targetYear)
    .sort((a, b) => a.year - b.year)
    .slice(-RECENT_YEARS_WINDOW);
  if (recent.length < MIN_POINTS_FOR_FIT) return null;

  const n = recent.length;
  const meanX = recent.reduce((sum, p) => sum + p.year, 0) / n;
  const meanY = recent.reduce((sum, p) => sum + p.radiance, 0) / n;
  const denominator = recent.reduce((sum, p) => sum + (p.year - meanX) ** 2, 0);
  if (denominator === 0) return null; // all points on the same year — no slope to fit

  const slope = recent.reduce((sum, p) => sum + (p.year - meanX) * (p.radiance - meanY), 0) / denominator;
  const intercept = meanY - slope * meanX;

  return Math.max(0, slope * targetYear + intercept);
}
