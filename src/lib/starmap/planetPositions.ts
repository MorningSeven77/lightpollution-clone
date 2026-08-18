import { Body, Equator, Illumination, type Observer } from "astronomy-engine";

export const SOLAR_SYSTEM_BODIES = [
  Body.Sun,
  Body.Moon,
  Body.Mercury,
  Body.Venus,
  Body.Mars,
  Body.Jupiter,
  Body.Saturn,
  Body.Uranus,
  Body.Neptune,
] as const;

export type PlanetPosition = {
  body: (typeof SOLAR_SYSTEM_BODIES)[number];
  raHours: number;
  decDeg: number;
  magnitude: number;
};

// ofdate=false (J2000 mean equator/equinox) is deliberate, NOT the more
// "physically correct" ofdate=true that astronomy-engine's own Horizon()
// helper pairs with GAST internally. The star catalog (starCatalog.json) is
// fixed J2000 with no precession applied — using ofdate=false here keeps
// planets in that exact same reference frame, so both go through
// coordinates.ts's buildSkyRotation as one identical transform and can
// never drift apart relative to each other, which was the whole point of
// putting them in the same rotating group (see star-map plan doc). The
// tradeoff: both stars and planets carry the same small, slowly-growing
// precession offset from the true current-epoch sky (~doi 50 arcsec/year,
// so well under half a degree for years around 2026) instead of planets
// being precisely of-date while stars lag — a deliberate, documented
// simplification, consistent with this project's stance elsewhere
// (sunPosition.ts, terminator.ts) of not chasing full-ephemeris precision.
export function computePlanetPositions(date: Date, observer: Observer): PlanetPosition[] {
  return SOLAR_SYSTEM_BODIES.map((body) => {
    const eq = Equator(body, date, observer, false, true);
    const illum = Illumination(body, date);
    return { body, raHours: eq.ra, decDeg: eq.dec, magnitude: illum.mag };
  });
}
