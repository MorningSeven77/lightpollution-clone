export function dayOfYear(date: Date): number {
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((today - yearStart) / 86400000) + 1;
}

// Standard simplified solar declination approximation (accurate to roughly
// 0.2°) — good enough for a visual day/night overlay, same "simplified
// approximation" spirit as bortle.ts's own radiance->Bortle math.
export function solarDeclinationDeg(date: Date): number {
  const n = dayOfYear(date);
  return -23.44 * Math.cos(((2 * Math.PI) / 365.24) * (n + 10));
}

// Equation of time (minutes) — how far apparent solar time drifts from mean
// solar time across the year, due to Earth's elliptical orbit and axial
// tilt. Spencer's commonly-cited approximation.
export function equationOfTimeMinutes(date: Date): number {
  const n = dayOfYear(date);
  const b = ((2 * Math.PI) / 365) * (n - 81);
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

// The longitude currently experiencing solar noon (the sun directly
// overhead, ignoring latitude).
export function subsolarLongitudeDeg(date: Date): number {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const solarTime = utcHours + equationOfTimeMinutes(date) / 60;
  const lng = -(solarTime - 12) * 15;
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

// A GeoJSON polygon covering the night hemisphere at the given moment,
// suitable for a MapLibre "fill" layer. The boundary curve is the classic
// day/night terminator formula: on the terminator, solar altitude is 0,
// which solves to tan(lat) = -cos(hourAngle) / tan(declination). The ring is
// closed by running along whichever pole is in deep night this side of the
// terminator (opposite the sun's declination) — a standard trick for
// capping a polar region with a flat lng/lat polygon.
export function computeTerminatorPolygon(date: Date): GeoJSON.Polygon {
  const declinationDeg = solarDeclinationDeg(date);
  const subsolarLng = subsolarLongitudeDeg(date);
  const declinationRad = (declinationDeg * Math.PI) / 180;

  const curve: [number, number][] = [];
  for (let lng = -180; lng <= 180; lng += 2) {
    const hourAngleRad = ((lng - subsolarLng) * Math.PI) / 180;
    const latRad = Math.atan(-Math.cos(hourAngleRad) / Math.tan(declinationRad));
    curve.push([lng, (latRad * 180) / Math.PI]);
  }

  const nightPoleLat = declinationDeg >= 0 ? -90 : 90;
  const ring: [number, number][] = [[-180, nightPoleLat], ...curve, [180, nightPoleLat], [-180, nightPoleLat]];

  return { type: "Polygon", coordinates: [ring] };
}
