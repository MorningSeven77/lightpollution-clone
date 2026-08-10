import { equationOfTimeMinutes, solarDeclinationDeg, subsolarLongitudeDeg } from "@/lib/terminator";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Hour angle in degrees: 0 at local solar noon, negative before noon,
// positive after — standard solar-geometry convention, same one
// terminator.ts's own polygon math is built on.
function hourAngleDeg(date: Date, lngDeg: number): number {
  const raw = lngDeg - subsolarLongitudeDeg(date);
  return (((raw + 180) % 360) + 360) % 360 - 180;
}

export type SolarPosition = {
  elevationDeg: number;
  azimuthDeg: number; // 0-360, measured clockwise from true north
};

// Standard spherical-trig solar position formula (the same one behind most
// simplified sunrise/sunset calculators) — accurate to within about the
// same ~0.2° the declination approximation itself carries (see
// terminator.ts's own comment), not full ephemeris precision.
export function computeSolarPosition(date: Date, latDeg: number, lngDeg: number): SolarPosition {
  const declRad = solarDeclinationDeg(date) * DEG_TO_RAD;
  const latRad = latDeg * DEG_TO_RAD;
  const hRad = hourAngleDeg(date, lngDeg) * DEG_TO_RAD;

  const sinElevation = Math.sin(latRad) * Math.sin(declRad) + Math.cos(latRad) * Math.cos(declRad) * Math.cos(hRad);
  const elevationRad = Math.asin(clamp(sinElevation, -1, 1));

  const cosAzimuth =
    (Math.sin(declRad) - Math.sin(elevationRad) * Math.sin(latRad)) / (Math.cos(elevationRad) * Math.cos(latRad) || 1e-9);
  let azimuthDeg = Math.acos(clamp(cosAzimuth, -1, 1)) * RAD_TO_DEG;
  if (hRad > 0) azimuthDeg = 360 - azimuthDeg;

  return { elevationDeg: elevationRad * RAD_TO_DEG, azimuthDeg };
}

// Converts a solar hour angle back into an actual UTC instant on the given
// date, via the standard local-apparent-solar-time <-> UTC relationship
// (inverse of subsolarLongitudeDeg's own conversion). Overflowing outside
// 0-24h is intentional and fine — it just lands the result on the
// UTC-adjacent day, which JS Date handles automatically.
function hourAngleToDate(baseDate: Date, angleDeg: number, lngDeg: number): Date {
  const eotHours = equationOfTimeMinutes(baseDate) / 60;
  const solarTimeHours = 12 + angleDeg / 15;
  const utcHours = solarTimeHours - lngDeg / 15 - eotHours;
  const baseMidnightUtc = Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate());
  return new Date(baseMidnightUtc + utcHours * 3600000);
}

export type SunEvent = { time: Date; azimuthDeg: number };

// Solves for the two hour angles (morning ascending, evening descending)
// at which the sun crosses a given elevation — exact spherical-trig
// inverse of computeSolarPosition's elevation formula, not a sampled
// search. Returns null for either branch the sun never actually reaches
// that day (e.g. golden hour "never happens" deep in polar summer/winter).
function solveElevationCrossing(
  date: Date,
  latDeg: number,
  lngDeg: number,
  targetElevationDeg: number,
): { morning: SunEvent; evening: SunEvent } | null {
  const declRad = solarDeclinationDeg(date) * DEG_TO_RAD;
  const latRad = latDeg * DEG_TO_RAD;
  const targetElevationRad = targetElevationDeg * DEG_TO_RAD;

  const cosH =
    (Math.sin(targetElevationRad) - Math.sin(latRad) * Math.sin(declRad)) / (Math.cos(latRad) * Math.cos(declRad));
  if (cosH < -1 || cosH > 1) return null;

  const hDeg = Math.acos(cosH) * RAD_TO_DEG;
  const morningTime = hourAngleToDate(date, -hDeg, lngDeg);
  const eveningTime = hourAngleToDate(date, hDeg, lngDeg);

  return {
    morning: { time: morningTime, azimuthDeg: computeSolarPosition(morningTime, latDeg, lngDeg).azimuthDeg },
    evening: { time: eveningTime, azimuthDeg: computeSolarPosition(eveningTime, latDeg, lngDeg).azimuthDeg },
  };
}

export type SunTimeWindow = { start: SunEvent; end: SunEvent };

export type SunEvents = {
  sunrise: SunEvent | null;
  sunset: SunEvent | null;
  morningBlueHour: SunTimeWindow | null;
  morningGoldenHour: SunTimeWindow | null;
  eveningGoldenHour: SunTimeWindow | null;
  eveningBlueHour: SunTimeWindow | null;
};

// Standard golden/blue hour elevation bands, same definition the reference
// site cites (NOAA / U.S. Naval Observatory): golden hour is -4° to +6°,
// blue hour is the deeper twilight from -6° to -4°. Sunrise/sunset uses the
// -0.833° convention (accounts for atmospheric refraction and the sun's
// apparent radius), not a bare 0°.
const SUNRISE_SUNSET_ELEVATION_DEG = -0.833;
const GOLDEN_HOUR_LOW_DEG = -4;
const GOLDEN_HOUR_HIGH_DEG = 6;
const BLUE_HOUR_LOW_DEG = -6;

export function computeSunEvents(date: Date, latDeg: number, lngDeg: number): SunEvents {
  const sunriseSunset = solveElevationCrossing(date, latDeg, lngDeg, SUNRISE_SUNSET_ELEVATION_DEG);
  const goldenLow = solveElevationCrossing(date, latDeg, lngDeg, GOLDEN_HOUR_LOW_DEG);
  const goldenHigh = solveElevationCrossing(date, latDeg, lngDeg, GOLDEN_HOUR_HIGH_DEG);
  const blueLow = solveElevationCrossing(date, latDeg, lngDeg, BLUE_HOUR_LOW_DEG);

  return {
    sunrise: sunriseSunset?.morning ?? null,
    sunset: sunriseSunset?.evening ?? null,
    morningBlueHour: blueLow && goldenLow ? { start: blueLow.morning, end: goldenLow.morning } : null,
    morningGoldenHour: goldenLow && goldenHigh ? { start: goldenLow.morning, end: goldenHigh.morning } : null,
    eveningGoldenHour: goldenHigh && goldenLow ? { start: goldenHigh.evening, end: goldenLow.evening } : null,
    eveningBlueHour: goldenLow && blueLow ? { start: goldenLow.evening, end: blueLow.evening } : null,
  };
}
