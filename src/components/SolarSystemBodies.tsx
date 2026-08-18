"use client";

import { useMemo } from "react";
import { Body } from "astronomy-engine";
import { SphereGeometry } from "three";
import { raDecToEquatorial } from "@/lib/starmap/coordinates";
import { buildObserver } from "@/lib/starmap/observer";
import { computePlanetPositions } from "@/lib/starmap/planetPositions";

// Deliberately simplified, legibility-first size scale (same "compressed
// linear map, not real photometric flux" spirit as
// starCatalogLoader.ts's magnitudeToPointSize) -- these are world-space
// mesh radii (unlike stars' screen-space shader point size), tuned so the
// Sun/Moon read as obviously larger discs than the naked-eye-limit planets
// (Uranus/Neptune), without attempting real angular-size accuracy.
const MIN_RADIUS = 0.006;
const MAX_RADIUS = 0.05;
const BRIGHTEST_MAG = -27; // roughly the Sun
const DIMMEST_MAG = 6;

function magnitudeToRadius(mag: number): number {
  const t = (mag - BRIGHTEST_MAG) / (DIMMEST_MAG - BRIGHTEST_MAG);
  const clampedT = Math.min(Math.max(t, 0), 1);
  return MAX_RADIUS - clampedT * (MAX_RADIUS - MIN_RADIUS);
}

const BODY_COLOR: Partial<Record<Body, string>> = {
  [Body.Sun]: "#ffe9a8",
  [Body.Moon]: "#e8e8e0",
};
const DEFAULT_COLOR = "#d8e4ff";

type SolarSystemBodiesProps = {
  date: Date;
  latDeg: number;
  lngDeg: number;
};

// Child of the same rotating sky group as StarField/ConstellationLines
// (see StarMapCanvas.tsx's SkyGroup) -- deliberately positioned via the
// exact same raDecToEquatorial conversion those use, fed with of-date-but-
// J2000-frame RA/Dec from planetPositions.ts, so planets can never drift
// relative to the stars they're embedded among (see that file's own
// comment on why ofdate=false was chosen for this).
export default function SolarSystemBodies({ date, latDeg, lngDeg }: SolarSystemBodiesProps) {
  // computePlanetPositions is a pure function of (date, latDeg, lngDeg) --
  // no subscription or external-system sync involved, so this is plain
  // derived render data (useMemo), not something to push through
  // useEffect+setState (which would trigger an extra cascading render for
  // no benefit, and is exactly the pattern this project's ESLint config
  // already flags elsewhere -- see project history on
  // react-hooks/set-state-in-effect).
  //
  // Recomputes on the same cadence as the sky rotation (see SkyGroup's own
  // comment) -- once per second while live, immediately on manual
  // date/location edits. Planets' actual motion against the star
  // background happens on a timescale of days, so this is far more often
  // than astronomically necessary, but 9 bodies' worth of astronomy-engine
  // calls is computationally trivial even at 1Hz -- not worth a separate
  // 30-60s throttle just to under-use the CPU budget by a tiny amount.
  const positions = useMemo(() => {
    const observer = buildObserver(latDeg, lngDeg);
    return computePlanetPositions(date, observer);
  }, [date, latDeg, lngDeg]);

  // Built once, shared by every body via a per-mesh `scale` instead of
  // per-body geometry -- see the per-mesh comment below.
  const unitSphereGeometry = useMemo(() => new SphereGeometry(1, 12, 12), []);

  return (
    <>
      {positions.map((p) => {
        const v = raDecToEquatorial(p.raHours, p.decDeg);
        const radius = magnitudeToRadius(p.magnitude);
        const color = BODY_COLOR[p.body] ?? DEFAULT_COLOR;
        return (
          // Scaling a single shared unit-sphere geometry (below), not
          // regenerating <sphereGeometry args={[radius,...]}> per body --
          // magnitude (and so radius) is recomputed every ~1s along with
          // position, and a changed `args` array forces R3F to dispose the
          // old BufferGeometry and allocate a fresh one. Doing that for 9
          // bodies every second, indefinitely, for the lifetime of the
          // page is real GPU churn for no visual benefit -- scale is a
          // plain transform update, no allocation at all.
          <mesh key={p.body} position={[v.x, v.y, v.z]} scale={radius} geometry={unitSphereGeometry}>
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}
    </>
  );
}
