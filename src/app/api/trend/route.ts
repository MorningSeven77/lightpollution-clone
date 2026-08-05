import { NextRequest, NextResponse } from "next/server";
import { getEarthEngine, getViirsTrendCollection } from "@/lib/earthEngine";
import ee from "@google/earthengine";
import { radianceToBortleEstimate } from "@/lib/bortle";

export type TrendPoint = {
  year: number;
  radiance: number;
  bortleClass: number;
  sqm: number;
};

type GetRegionRow = [string, number, number, number, number | null];

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lng = parseFloat(request.nextUrl.searchParams.get("lng") ?? "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng query params are required" }, { status: 400 });
  }

  try {
    await getEarthEngine();
    const collection = getViirsTrendCollection();
    const point = ee.Geometry.Point([lng, lat]);

    // getRegion returns every year's value in a single round trip — [header, ...rows].
    const rows = await new Promise<GetRegionRow[]>((resolve, reject) => {
      collection.getRegion(point, 500).getInfo((result: GetRegionRow[], err: unknown) => {
        if (err || !result) {
          reject(err instanceof Error ? err : new Error(String(err ?? "no result")));
          return;
        }
        resolve(result);
      });
    });

    const [header, ...dataRows] = rows;
    const timeIndex = header.indexOf("time");
    const valueIndex = header.indexOf("average");

    const points: TrendPoint[] = dataRows
      .map((row): TrendPoint | null => {
        const radiance = row[valueIndex] as number | null;
        if (radiance == null) return null;
        const year = new Date(row[timeIndex] as number).getUTCFullYear();
        const { bortleClass, sqm } = radianceToBortleEstimate(radiance);
        return { year, radiance, bortleClass, sqm };
      })
      .filter((p): p is TrendPoint => p !== null)
      .sort((a, b) => a.year - b.year);

    return NextResponse.json({ points });
  } catch (error) {
    console.error("[trend] Earth Engine error:", error);
    return NextResponse.json({ error: "Failed to compute the light-pollution trend" }, { status: 502 });
  }
}
