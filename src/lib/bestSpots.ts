export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;

export function haversineDistanceKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Grid spacing scales linearly with radius so the candidate count stays
// roughly constant (a few hundred) regardless of search area — a 300km
// search at a fixed 1km spacing would generate tens of thousands of points
// and make the Earth Engine batch query far too slow. Circle area / grid
// cell area ≈ π(radius/spacing)², so spacing = radius/k keeps that ratio,
// and count, constant for any radius.
const GRID_SPACING_DIVISOR = 13;
const MIN_GRID_SPACING_KM = 1;

export function generateSearchGrid(center: LatLng, radiusKm: number): LatLng[] {
  const spacingKm = Math.max(MIN_GRID_SPACING_KM, radiusKm / GRID_SPACING_DIVISOR);
  const latSpacingDeg = spacingKm / 111;
  const lngSpacingDeg = spacingKm / (111 * Math.cos((center.lat * Math.PI) / 180) || 1);
  const steps = Math.ceil(radiusKm / spacingKm);

  const candidates: LatLng[] = [];
  for (let i = -steps; i <= steps; i++) {
    for (let j = -steps; j <= steps; j++) {
      const candidate = { lat: center.lat + i * latSpacingDeg, lng: center.lng + j * lngSpacingDeg };
      if (haversineDistanceKm(center, candidate) <= radiusKm) {
        candidates.push(candidate);
      }
    }
  }
  return candidates;
}

export type RankedSpot = LatLng & { sqm: number; bortleClass: number; distanceKm: number; score: number };

// A deliberately simplified "how good is this spot" score — not a
// reverse-engineered match of the reference site's own (private) ranking
// formula, same spirit as stargazing.ts's own scoring function. Combines
// normalized darkness (SQM 16-22 -> 0-100, the same bounds bortle.ts itself
// classifies against) with a mild penalty for being farther from the
// search center — a slightly darker spot much farther away isn't
// necessarily the more useful real-world recommendation.
const SQM_SCORE_MIN = 16;
const SQM_SCORE_MAX = 22;
const DISTANCE_PENALTY_WEIGHT = 15;

export function computeSpotScore(sqm: number, distanceKm: number, radiusKm: number): number {
  const darkness = ((sqm - SQM_SCORE_MIN) / (SQM_SCORE_MAX - SQM_SCORE_MIN)) * 100;
  const distancePenalty = (distanceKm / radiusKm) * DISTANCE_PENALTY_WEIGHT;
  return Math.round(Math.min(100, Math.max(0, darkness - distancePenalty)) * 10) / 10;
}

// Greedily selects the top-scoring candidates such that no two selected
// spots are closer than minDistanceKm to each other — without this, the
// top N results tend to all cluster inside a single especially dark patch
// instead of spreading across genuinely distinct options.
export function selectSpacedTopSpots(ranked: RankedSpot[], maxResults: number, minDistanceKm: number): RankedSpot[] {
  const sorted = [...ranked].sort((a, b) => b.score - a.score);
  const selected: RankedSpot[] = [];
  for (const candidate of sorted) {
    if (selected.length >= maxResults) break;
    const tooClose = selected.some((s) => haversineDistanceKm(s, candidate) < minDistanceKm);
    if (!tooClose) selected.push(candidate);
  }
  return selected;
}
