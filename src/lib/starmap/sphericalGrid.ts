import { Vector3 } from "three";

export type GraticuleOptions = {
  parallelStepDeg: number; // spacing between "latitude" circles (e.g. altitude or declination)
  meridianStepDeg: number; // spacing between "longitude" meridians (e.g. azimuth or right ascension)
  segmentsPerCircle?: number;
};

const DEFAULT_SEGMENTS_PER_CIRCLE = 96;

// Generates a standard "graticule" (latitude circles + longitude meridians)
// as a flat position array ready for a THREE.BufferGeometry position
// attribute, rendered as <lineSegments> (GL_LINES -- every consecutive
// vertex PAIR is one independent segment, same convention
// ConstellationLines.tsx already uses for its own merged line geometry).
//
// Shared by AzimuthalGrid.tsx and EquatorialGrid.tsx, which differ only in
// which coordinate transform they pass in as `toWorld` (alt/az vs RA/Dec --
// structurally identical "two angular coordinates on a unit-radius sphere"
// problems). This function only knows about generic longitude-like
// (`coord1Deg`, wraps 0-360) / latitude-like (`coord2Deg`, -90..90) angles;
// the astronomical meaning lives entirely in the caller's `toWorld`.
export function buildGraticuleVertices(
  toWorld: (coord1Deg: number, coord2Deg: number) => Vector3,
  { parallelStepDeg, meridianStepDeg, segmentsPerCircle = DEFAULT_SEGMENTS_PER_CIRCLE }: GraticuleOptions,
): number[] {
  const vertices: number[] = [];

  // "Latitude" circles (constant coord2, e.g. altitude or declination) --
  // start/stop one step short of the poles since +/-90 is a single point,
  // not a circle.
  for (let coord2 = -90 + parallelStepDeg; coord2 < 90; coord2 += parallelStepDeg) {
    for (let i = 0; i < segmentsPerCircle; i++) {
      const a = toWorld((360 * i) / segmentsPerCircle, coord2);
      const b = toWorld((360 * (i + 1)) / segmentsPerCircle, coord2);
      vertices.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }

  // "Longitude" meridians (constant coord1). Each value of coord1 traces
  // one pole-to-pole HALF of a great circle (coord2 sweeping the full
  // -90..90 range) -- looping coord1 across the complete 0..360 range at
  // meridianStepDeg naturally draws both halves of every great circle as
  // two separate semicircle passes (coord1 and coord1+180), so no special
  // casing is needed for "the back half" of each meridian.
  for (let coord1 = 0; coord1 < 360; coord1 += meridianStepDeg) {
    for (let i = 0; i < segmentsPerCircle; i++) {
      const a = toWorld(coord1, -90 + (180 * i) / segmentsPerCircle);
      const b = toWorld(coord1, -90 + (180 * (i + 1)) / segmentsPerCircle);
      vertices.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }

  return vertices;
}
