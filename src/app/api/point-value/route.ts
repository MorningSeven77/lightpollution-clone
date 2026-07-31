import { NextRequest, NextResponse } from "next/server";
import ee from "@google/earthengine";
import { getEarthEngine, getViirsImage } from "@/lib/earthEngine";
import { radianceToBortleEstimate } from "@/lib/bortle";

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lng = parseFloat(request.nextUrl.searchParams.get("lng") ?? "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng query params are required" }, { status: 400 });
  }

  try {
    await getEarthEngine();
    const image = getViirsImage();
    const point = ee.Geometry.Point([lng, lat]);
    const region = image.reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point,
      scale: 500,
    });

    const info = await new Promise<{ average?: number | null }>((resolve, reject) => {
      region.getInfo((result: { average?: number | null }, err: unknown) => {
        if (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
          return;
        }
        resolve(result);
      });
    });

    // No VIIRS coverage at this point (e.g. open ocean far from any lights).
    if (info.average == null) {
      return NextResponse.json({ radiance: 0, bortleClass: 1, sqm: 22.0 });
    }

    return NextResponse.json(radianceToBortleEstimate(info.average));
  } catch (error) {
    console.error("[point-value] Earth Engine error:", error);
    return NextResponse.json({ error: "Failed to query the light-pollution value" }, { status: 502 });
  }
}
