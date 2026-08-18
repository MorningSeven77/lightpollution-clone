"use client";

import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { raDecToEquatorial } from "@/lib/starmap/coordinates";
import { buildGraticuleVertices } from "@/lib/starmap/sphericalGrid";

const LINE_COLOR = "#8a5a6a";
const LINE_OPACITY = 0.35;
const PARALLEL_STEP_DEG = 15; // declination circles
const MERIDIAN_STEP_DEG = 30; // right-ascension meridians, every 30deg = 2h (12 total)

// Fixed in the (non-rotating) equatorial reference frame -- the same frame
// raDecToEquatorial's own doc comment describes as "before the LST+
// latitude transform is applied". Unlike AzimuthalGrid, this genuinely
// belongs INSIDE SkyGroup as a child, rotating along with the stars/
// constellation lines/DSOs/planets it shares that frame with: declination
// circles and right-ascension meridians are properties of the star field
// itself, not of the observer's horizon, so they need to turn with the sky
// as Earth rotates, same as everything else in that group.
export default function EquatorialGrid() {
  const geometry = useMemo(() => {
    const vertices = buildGraticuleVertices((raDeg, decDeg) => raDecToEquatorial(raDeg / 15, decDeg), {
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
