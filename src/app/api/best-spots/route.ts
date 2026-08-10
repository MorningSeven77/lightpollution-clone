import { NextRequest, NextResponse } from "next/server";
import ee from "@google/earthengine";
import { getEarthEngine, getViirsImage } from "@/lib/earthEngine";
import { radianceToBortleEstimate } from "@/lib/bortle";
import { generateSearchGrid, haversineDistanceKm, computeSpotScore, selectSpacedTopSpots, RankedSpot } from "@/lib/bestSpots";

const MIN_RADIUS_KM = 5;
const MAX_RADIUS_KM = 300;
const MIN_RESULTS = 1;
const MAX_RESULTS = 25;
const MIN_MIN_DISTANCE_KM = 1;
const MAX_MIN_DISTANCE_KM = 50;
// Protects the Earth Engine batch query from an unreasonably large grid —
// generateSearchGrid's spacing formula already keeps candidate counts in
// the same few-hundred ballpark across the whole radius range, so this is
// a defensive ceiling, not something normal inputs should ever hit.
const MAX_CANDIDATES = 900;

function clampNumber(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

type SampledFeature = {
  properties: { average?: number | null };
  geometry: { coordinates: [number, number] };
};

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lng = parseFloat(request.nextUrl.searchParams.get("lng") ?? "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng query params are required" }, { status: 400 });
  }

  const radiusKm = clampNumber(parseFloat(request.nextUrl.searchParams.get("radiusKm") ?? ""), MIN_RADIUS_KM, MAX_RADIUS_KM, 100);
  const maxResults = clampNumber(parseInt(request.nextUrl.searchParams.get("maxResults") ?? "", 10), MIN_RESULTS, MAX_RESULTS, 10);
  const minDistanceKm = clampNumber(
    parseFloat(request.nextUrl.searchParams.get("minDistanceKm") ?? ""),
    MIN_MIN_DISTANCE_KM,
    MAX_MIN_DISTANCE_KM,
    10,
  );

  try {
    await getEarthEngine();
    const image = getViirsImage();
    const center = { lat, lng };

    let candidates = generateSearchGrid(center, radiusKm);
    if (candidates.length > MAX_CANDIDATES) {
      // Thin evenly across the grid rather than truncating, so we don't
      // lose an entire edge of the search area.
      const step = Math.ceil(candidates.length / MAX_CANDIDATES);
      candidates = candidates.filter((_, i) => i % step === 0);
    }

    const points = ee.FeatureCollection(candidates.map((c) => ee.Feature(ee.Geometry.Point([c.lng, c.lat]))));
    const sampled = image.sampleRegions({ collection: points, scale: 500, geometries: true });

    const info = await new Promise<{ features: SampledFeature[] }>((resolve, reject) => {
      sampled.getInfo((result: { features: SampledFeature[] }, err: unknown) => {
        if (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
          return;
        }
        resolve(result);
      });
    });

    const ranked: RankedSpot[] = info.features
      .filter((f) => f.properties.average != null)
      .map((f) => {
        const [candidateLng, candidateLat] = f.geometry.coordinates;
        const { bortleClass, sqm } = radianceToBortleEstimate(f.properties.average!);
        const distanceKm = haversineDistanceKm(center, { lat: candidateLat, lng: candidateLng });
        return {
          lat: candidateLat,
          lng: candidateLng,
          sqm,
          bortleClass,
          distanceKm,
          score: computeSpotScore(sqm, distanceKm, radiusKm),
        };
      });

    const spots = selectSpacedTopSpots(ranked, maxResults, minDistanceKm);

    return NextResponse.json({ spots });
  } catch (error) {
    console.error("[best-spots] Earth Engine error:", error);
    return NextResponse.json({ error: "Failed to search for stargazing spots" }, { status: 502 });
  }
}
