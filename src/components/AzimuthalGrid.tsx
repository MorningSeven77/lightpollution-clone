"use client";

import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { altAzToWorld } from "@/lib/starmap/coordinates";
import { buildGraticuleVertices } from "@/lib/starmap/sphericalGrid";

const LINE_COLOR = "#4a7a5a";
const LINE_OPACITY = 0.35;
const PARALLEL_STEP_DEG = 15; // altitude circles
const MERIDIAN_STEP_DEG = 30; // azimuth meridians, every 30deg (12 total)

// A fixed, non-rotating overlay -- like the (now-removed) ground silhouette
// before it, this belongs to the observer's own local alt/az frame
// (altitude circles and azimuth meridians are directions relative to THIS
// OBSERVER's horizon and zenith, not to the star field), so
// StarMapCanvas.tsx renders this as a SIBLING of SkyGroup, not a child --
// rotating it along with the sidereal-time rotation would make the grid
// visibly spin relative to the horizon over time, which is wrong (the
// exact class of bug the ground silhouette had before its depth-order fix,
// see that component's history -- this one doesn't have that specific bug
// since there's no occlusion involved, but the "which frame does this
// belong to" reasoning is the same).
export default function AzimuthalGrid() {
  const geometry = useMemo(() => {
    const vertices = buildGraticuleVertices((azimuthDeg, altitudeDeg) => altAzToWorld(altitudeDeg, azimuthDeg), {
      parallelStepDeg: PARALLEL_STEP_DEG,
      meridianStepDeg: MERIDIAN_STEP_DEG,
    });
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    return geo;
  }, []);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={LINE_COLOR} transparent opacity={LINE_OPACITY} />
    </lineSegments>
  );
}
