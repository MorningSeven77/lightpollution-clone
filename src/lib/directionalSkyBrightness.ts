import type { LatLng } from "@/lib/bestSpots";

const EARTH_RADIUS_KM = 6371;

// Standard great-circle "destination point given start, bearing, distance"
// formula — used to place sample points along each compass direction from
// the observer, the same way a real horizon-brightness readout would need
// to look outward toward the light sources contributing to skyglow in that
// direction.
export function destinationPoint(origin: LatLng, bearingDeg: number, distanceKm: number): LatLng {
  const angularDistance = distanceKm / EARTH_RADIUS_KM;
  const bearingRad = (bearingDeg * Math.PI) / 180;
  const lat1 = (origin.lat * Math.PI) / 180;
  const lng1 = (origin.lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    lat: (lat2 * 180) / Math.PI,
    // Normalizes into [-180, 180) — atan2 above can wrap past +-180 for
    // points that cross the antimeridian relative to the origin.
    lng: (((lng2 * 180) / Math.PI + 540) % 360) - 180,
  };
}

export const AZIMUTH_STEP_DEG = 15;
// 5 rings per direction, out to 140km — loosely bounded by the commonly
// cited "skyglow can be detected 100+ km from a city" figure, not a precise
// atmospheric propagation limit.
export const SAMPLE_DISTANCES_KM = [10, 25, 50, 90, 140];
// The center point itself, sampled in the same batch as a stand-in for the
// observer's own local ambient sky glow (azimuth-independent baseline every
// direction's total brightness builds on top of).
export const CENTER_SENTINEL_AZIMUTH = -1;

export type DirectionalSamplePoint = LatLng & { azimuthDeg: number; distanceKm: number };

export function generateDirectionalSamplePoints(center: LatLng): DirectionalSamplePoint[] {
  const points: DirectionalSamplePoint[] = [{ ...center, azimuthDeg: CENTER_SENTINEL_AZIMUTH, distanceKm: 0 }];
  for (let az = 0; az < 360; az += AZIMUTH_STEP_DEG) {
    for (const distanceKm of SAMPLE_DISTANCES_KM) {
      points.push({ ...destinationPoint(center, az, distanceKm), azimuthDeg: az, distanceKm });
    }
  }
  return points;
}

// How quickly a distant light source's contribution to the observer's sky
// glow fades with distance — a simplified exponential stand-in for a real
// atmospheric-scattering skyglow model (e.g. Garstang's), not derived from
// first principles, just tuned so nearby sources dominate while sources out
// past ~100km still contribute a little.
export const GLOW_DECAY_KM = 60;

// Sums each direction's distance-weighted contributions on top of the
// observer's own local radiance (present in every direction, since it's the
// ambient dome overhead regardless of which way you're looking) — a
// simplified 2D "horizon slice" model, not a full radiative sky dome.
export function aggregateDirectionalRadiance(
  localRadiance: number,
  samples: Array<{ azimuthDeg: number; distanceKm: number; radiance: number }>,
): Map<number, number> {
  const totals = new Map<number, number>();
  for (let az = 0; az < 360; az += AZIMUTH_STEP_DEG) totals.set(az, localRadiance);
  for (const s of samples) {
    if (s.azimuthDeg === CENTER_SENTINEL_AZIMUTH) continue;
    const weight = Math.exp(-s.distanceKm / GLOW_DECAY_KM);
    totals.set(s.azimuthDeg, (totals.get(s.azimuthDeg) ?? localRadiance) + s.radiance * weight);
  }
  return totals;
}
