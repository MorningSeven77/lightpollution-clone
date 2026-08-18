"use client";

import { useMemo } from "react";
import { SphereGeometry } from "three";
import { buildDeepSkyObjectRenderPoints, type DeepSkyObjectCategory } from "@/lib/starmap/deepSkyObjectsLoader";

// Deliberately simplified, legibility-first size scale -- same
// "compressed linear map, not real photometric flux" spirit as
// starCatalogLoader.ts's magnitudeToPointSize and SolarSystemBodies.tsx's
// magnitudeToRadius. Smaller overall range than SolarSystemBodies's, since
// these should read as a subtler background layer, not compete visually
// with the Sun/Moon/planets.
const MIN_RADIUS = 0.007;
const MAX_RADIUS = 0.018;
const BRIGHTEST_MAG = 1.5; // roughly the Pleiades, the brightest Messier object
const DIMMEST_MAG = 10;

function magnitudeToRadius(mag: number): number {
  const t = (mag - BRIGHTEST_MAG) / (DIMMEST_MAG - BRIGHTEST_MAG);
  const clampedT = Math.min(Math.max(t, 0), 1);
  return MAX_RADIUS - clampedT * (MAX_RADIUS - MIN_RADIUS);
}

// Conventional-ish star-chart color coding: warm tan for galaxies, cool
// white-blue for clusters, soft magenta for nebulae/planetary
// nebulae/supernova remnants -- not attempting real astrophotography
// color, just enough separation to tell the three categories apart at a
// glance.
const CATEGORY_COLOR: Record<DeepSkyObjectCategory, string> = {
  galaxy: "#e8c88c",
  cluster: "#bfe3ff",
  nebula: "#ff9ecb",
};

// The 108-object Messier catalog (110 minus M40, a double star with no
// OpenNGC entry, plus M45 added manually -- see build-deep-sky-objects.mjs)
// rendered as small colored markers. Fixed equatorial-frame positions, so
// (like StarField and ConstellationLines) this is a child of
// StarMapCanvas's rotating sky group, sharing the exact same
// raDecToEquatorial conversion -- no per-frame recomputation, no drift
// relative to the stars they're embedded among.
//
// No text labels here (unlike ConstellationLines) -- 108 more labels on
// top of the 88 constellation names would clutter the sky more than help,
// and this project already hit a real GPU-context-loss bug from one
// batch of simultaneous glyph rendering (see ConstellationLines.tsx's own
// history); object names/details belong in the search feature instead,
// not as permanent on-screen text.
export default function DeepSkyObjects() {
  const points = useMemo(() => buildDeepSkyObjectRenderPoints(), []);
  const geometry = useMemo(() => new SphereGeometry(1, 10, 10), []);

  return (
    <>
      {points.map((p) => (
        <mesh key={p.id} position={p.position} scale={magnitudeToRadius(p.mag)} geometry={geometry}>
          <meshBasicMaterial color={CATEGORY_COLOR[p.category]} transparent opacity={0.85} />
        </mesh>
      ))}
    </>
  );
}
