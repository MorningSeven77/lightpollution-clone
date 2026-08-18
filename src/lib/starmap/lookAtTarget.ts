import { Equator, Horizon, type Observer } from "astronomy-engine";
import type { SearchResult } from "@/lib/starmap/searchIndex";

export type AzAlt = { azimuthDeg: number; altitudeDeg: number };

// Where the camera should point, right now, to look at a search result.
// Planets need a fresh Equator() call (their RA/Dec changes over time);
// stars/DSOs already carry a fixed RA/Dec. ofdate=false for planets to
// match planetPositions.ts's own documented convention -- keeps this
// one-off lookup consistent with how the same body is actually rendered
// in the scene, even though a single Horizon() call here doesn't care
// about the group-rotation-drift argument that convention exists for.
export function computeLookAtTarget(result: SearchResult, date: Date, observer: Observer): AzAlt {
  if (result.kind === "planet") {
    const eq = Equator(result.body, date, observer, false, true);
    const hor = Horizon(date, observer, eq.ra, eq.dec);
    return { azimuthDeg: hor.azimuth, altitudeDeg: hor.altitude };
  }
  const hor = Horizon(date, observer, result.raHours, result.decDeg);
  return { azimuthDeg: hor.azimuth, altitudeDeg: hor.altitude };
}
