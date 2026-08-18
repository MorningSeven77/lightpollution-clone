import rawCatalog from "@/data/starCatalog.json";
import { raDecToEquatorial } from "@/lib/starmap/coordinates";

export type StarCatalog = {
  count: number;
  ra: number[];
  dec: number[];
  mag: number[];
  bv: number[];
  name: (string | null)[];
};

const catalog = rawCatalog as StarCatalog;

const MIN_POINT_SIZE = 1.2;
const MAX_POINT_SIZE = 7;
// Naked-eye stars span roughly mag -1.44 (Sirius) to +6.5 (catalog cutoff),
// a ~1500x real flux ratio — far too much dynamic range for a sane point-size
// spread in pixels. This is a deliberately compressed LINEAR map from
// magnitude to point size (brighter = bigger), not a true photometric flux
// scale; it's for legibility, not accuracy, same spirit as bortle.ts's
// simplified radiance->color-class mapping.
function magnitudeToPointSize(mag: number): number {
  const t = (mag - -1.44) / (6.5 - -1.44);
  const clampedT = Math.min(Math.max(t, 0), 1);
  return MAX_POINT_SIZE - clampedT * (MAX_POINT_SIZE - MIN_POINT_SIZE);
}

export type StarFieldGeometry = {
  positions: Float32Array; // xyz per star, equatorial frame, unit sphere
  sizes: Float32Array;
  count: number;
};

// Pure, testable-without-a-canvas conversion from the static catalog into
// render-ready typed arrays. Computed once (see StarField.tsx's useMemo) --
// this is the whole point of pre-baking Cartesian positions instead of
// re-projecting RA/Dec every frame.
export function buildStarFieldGeometry(): StarFieldGeometry {
  const { count, ra, dec, mag } = catalog;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const v = raDecToEquatorial(ra[i], dec[i]);
    positions[i * 3] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;
    sizes[i] = magnitudeToPointSize(mag[i]);
  }

  return { positions, sizes, count };
}

export function getStarCatalog(): StarCatalog {
  return catalog;
}
