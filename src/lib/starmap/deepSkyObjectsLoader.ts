import rawDeepSkyObjects from "@/data/deepSkyObjects.json";
import { raDecToEquatorial } from "@/lib/starmap/coordinates";

export type DeepSkyObjectCategory = "galaxy" | "cluster" | "nebula";

export type DeepSkyObject = {
  id: string; // "M31"
  designation: string; // "NGC0224"
  category: DeepSkyObjectCategory;
  ra: number; // hours
  dec: number; // degrees
  mag: number;
  commonName: string | null;
};

const data = rawDeepSkyObjects as { objects: DeepSkyObject[] };

export function getDeepSkyObjects(): DeepSkyObject[] {
  return data.objects;
}

export type DeepSkyObjectRenderPoint = {
  id: string;
  category: DeepSkyObjectCategory;
  position: [number, number, number]; // equatorial-frame unit vector
  mag: number;
};

// Same "convert once, never per-frame" approach as starCatalogLoader.ts /
// constellationLoader.ts.
export function buildDeepSkyObjectRenderPoints(): DeepSkyObjectRenderPoint[] {
  return data.objects.map((o) => {
    const v = raDecToEquatorial(o.ra, o.dec);
    return { id: o.id, category: o.category, position: [v.x, v.y, v.z], mag: o.mag };
  });
}
