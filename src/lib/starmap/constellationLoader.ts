import rawConstellations from "@/data/constellationLines.json";
import { raDecToEquatorial } from "@/lib/starmap/coordinates";

export type ConstellationData = {
  id: string;
  nameEn: string;
  nameZh: string;
  labelRa: number;
  labelDec: number;
  lines: [number, number][][]; // one array of [ra,dec] pairs per disjoint line segment
};

const data = rawConstellations as unknown as { constellations: ConstellationData[] };

export type ConstellationRenderData = {
  id: string;
  nameEn: string;
  nameZh: string;
  labelPosition: [number, number, number]; // equatorial-frame unit vector
  // One flat Vector3-triplet array per disjoint line segment, ready for
  // drei's <Line points={...} />.
  segments: [number, number, number][][];
};

export function getConstellations(): ConstellationData[] {
  return data.constellations;
}

// Same "convert once, never per-frame" approach as starCatalogLoader.ts.
export function buildConstellationRenderData(): ConstellationRenderData[] {
  return data.constellations.map((c) => {
    const label = raDecToEquatorial(c.labelRa, c.labelDec);
    const segments = c.lines.map((segment) =>
      segment.map(([ra, dec]) => {
        const v = raDecToEquatorial(ra, dec);
        return [v.x, v.y, v.z] as [number, number, number];
      }),
    );
    return {
      id: c.id,
      nameEn: c.nameEn,
      nameZh: c.nameZh,
      labelPosition: [label.x, label.y, label.z],
      segments,
    };
  });
}
