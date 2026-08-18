import { Observer, SiderealTime } from "astronomy-engine";

// Sea-level observer (height=0) — this feature doesn't collect elevation
// from the user, and the altitude correction it would make to alt/az is
// far smaller than the other simplifications already in play elsewhere in
// this project (see sunPosition.ts's own ~0.2deg error-bound comment).
export function buildObserver(latDeg: number, lngDeg: number): Observer {
  return new Observer(latDeg, lngDeg, 0);
}

// Local (not Greenwich) apparent sidereal time, in hours 0..24 — this is
// the value coordinates.ts's buildSkyRotation consumes as "local sidereal
// hours". SiderealTime() returns GAST (Greenwich); converting to local just
// adds the observer's own longitude contribution (15deg of longitude = 1
// hour of sidereal time).
export function localSiderealTimeHours(date: Date, lngDeg: number): number {
  const gastHours = SiderealTime(date);
  return (((gastHours + lngDeg / 15) % 24) + 24) % 24;
}
