import { NextRequest, NextResponse } from "next/server";
import ee from "@google/earthengine";
import { getEarthEngine, getViirsImage } from "@/lib/earthEngine";
import { radianceToBortleEstimate } from "@/lib/bortle";
import {
  generateDirectionalSamplePoints,
  aggregateDirectionalRadiance,
  CENTER_SENTINEL_AZIMUTH,
} from "@/lib/directionalSkyBrightness";

type SampledFeature = {
  properties: { average?: number | null; azimuthDeg?: number | null; distanceKm?: number | null };
};

export type DirectionalBrightnessPoint = { azimuthDeg: number; sqm: number; bortleClass: number };

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lng = parseFloat(request.nextUrl.searchParams.get("lng") ?? "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng query params are required" }, { status: 400 });
  }

  try {
    await getEarthEngine();
    const image = getViirsImage();
    const center = { lat, lng };

    // Includes the center point itself (as the CENTER_SENTINEL_AZIMUTH entry)
    // in the same batch — see directionalSkyBrightness.ts for why that's
    // sampled here rather than reusing a separately-fetched value.
    const samplePoints = generateDirectionalSamplePoints(center);
    const points = ee.FeatureCollection(
      samplePoints.map((p) =>
        ee.Feature(ee.Geometry.Point([p.lng, p.lat]), { azimuthDeg: p.azimuthDeg, distanceKm: p.distanceKm }),
      ),
    );
    const sampled = image.sampleRegions({
      collection: points,
      scale: 500,
      properties: ["azimuthDeg", "distanceKm"],
    });

    const info = await new Promise<{ features: SampledFeature[] }>((resolve, reject) => {
      sampled.getInfo((result: { features: SampledFeature[] }, err: unknown) => {
        if (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
          return;
        }
        resolve(result);
      });
    });

    const valid = info.features.filter(
      (f) => f.properties.average != null && f.properties.azimuthDeg != null && f.properties.distanceKm != null,
    );

    const centerFeature = valid.find((f) => f.properties.azimuthDeg === CENTER_SENTINEL_AZIMUTH);
    const localRadiance = centerFeature?.properties.average ?? 0;

    const samples = valid
      .filter((f) => f.properties.azimuthDeg !== CENTER_SENTINEL_AZIMUTH)
      .map((f) => ({
        azimuthDeg: f.properties.azimuthDeg!,
        distanceKm: f.properties.distanceKm!,
        radiance: f.properties.average!,
      }));

    const totals = aggregateDirectionalRadiance(localRadiance, samples);

    const directions: DirectionalBrightnessPoint[] = Array.from(totals.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([azimuthDeg, radiance]) => {
        const { sqm, bortleClass } = radianceToBortleEstimate(radiance);
        return { azimuthDeg, sqm, bortleClass };
      });

    if (directions.length === 0) {
      return NextResponse.json({ error: "No directional samples available for this point" }, { status: 502 });
    }

    // Darker sky = higher SQM, so "darkest" is the max and "brightest glow" is the min.
    const darkest = directions.reduce((max, d) => (d.sqm > max.sqm ? d : max));
    const brightest = directions.reduce((min, d) => (d.sqm < min.sqm ? d : min));

    return NextResponse.json({ directions, darkest, brightest });
  } catch (error) {
    console.error("[directional-sky-brightness] Earth Engine error:", error);
    return NextResponse.json({ error: "Failed to compute directional sky brightness" }, { status: 502 });
  }
}
