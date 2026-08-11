import { NextRequest, NextResponse } from "next/server";
import ee from "@google/earthengine";
import { getEarthEngine, getViirsImage, getViirsTrendCollection } from "@/lib/earthEngine";
import { BORTLE_CLASS_RADIANCE_BREAKPOINTS } from "@/lib/bortle";
import { COUNTRY_LIGHT_POLLUTION } from "@/lib/countryRankings";

// Zonal reduceRegion over a whole country (even a small one) is orders of
// magnitude more pixels than the single-point queries the rest of this app
// makes — same tradeoff already accepted for the static rankings dataset
// (see countryRankings.ts), except this endpoint runs it 13 times over (once
// per year in the trend) instead of once, on top of a live per-request
// geometry lookup instead of a precomputed one. Real measurements against a
// single fixed scale+simplify setting exposed a genuine conflict: Russia
// (thousands of border vertices, huge area) needed a coarse scale and a
// simplified boundary just to finish in reasonable time (scale=10km took
// 2 full minutes; scale=30km + simplify(2km) got it to ~19-29s), but that
// same coarse scale/simplify combination is far too blunt for a small
// country — at scale=30km, Bahrain's ~780km^2 extent barely spans a handful
// of pixels, so which specific 30km grid cells count as "inside" the
// country became noise: pixelCount swung from a real 27 down to 6-8, and
// avgSqm was off by over a full magnitude from the known-good static
// snapshot value. One fixed setting can't serve both ends of a dataset that
// spans micro-states to Russia, so this picks scale/simplify per request
// from the country's own pixelCount in the existing static rankings dataset
// (a reliable, already-computed size proxy — no live area query needed).
const ZONAL_MAX_PIXELS = 1e9;
const ZONAL_TILE_SCALE = 16;

type ZonalTier = { scaleMeters: number; simplifyMeters: number };

// Thresholds picked from the real pixelCount distribution across all 281
// countries in the static dataset (median country: ~488 pixels at the 10km
// scale that dataset was collected at; only 10 countries exceed 20,000 —
// India, Alaska, Greenland, Kazakhstan, Australia, Brazil, USA, China,
// Canada, Russia). Below 2,000 pixels, a country's real extent is small
// enough that even a light simplify can distort it (see Bahrain above), so
// "small" gets a fine scale and barely any simplification.
function pickZonalTier(referencePixelCount: number): ZonalTier {
  if (referencePixelCount < 2000) return { scaleMeters: 3000, simplifyMeters: 300 };
  if (referencePixelCount < 20000) return { scaleMeters: 10000, simplifyMeters: 1000 };
  return { scaleMeters: 30000, simplifyMeters: 3000 };
}

export type CountryTrendPoint = { year: number; avgSqm: number; pixelCount: number };
export type CountryBortleBreakdown = { bortleClass: number; percent: number };
export type CountryTrendResponse = {
  name: string;
  trend: CountryTrendPoint[];
  bortleDistribution: CountryBortleBreakdown[];
};

// Same log-scale radiance->SQM formula as bortle.ts's radianceToBortleEstimate
// (kept in sync by hand — bortle.ts's version has to run in plain JS for the
// point-value endpoint, this one has to run as an Earth Engine expression so
// it evaluates server-side over every pixel in a country at once).
function toSqmImage(image: ReturnType<typeof getViirsImage>) {
  return image
    .expression("22.0 - log10(max(radiance, 0) + 1) * 2.0", { radiance: image })
    .clamp(16, 22)
    .rename("sqm");
}

// Same gte-breakpoint classification tile-layer/route.ts uses to render
// discrete Bortle zones on the map, starting the running sum at 1 instead of
// 0 so the result is the actual Bortle class number (1-9), not a 0-indexed
// palette slot.
function toBortleClassImage(image: ReturnType<typeof getViirsImage>) {
  let classIndex = ee.Image(1);
  for (const breakpoint of BORTLE_CLASS_RADIANCE_BREAKPOINTS) {
    classIndex = classIndex.add(image.gte(breakpoint));
  }
  return classIndex.rename("bortleClass");
}

type TrendFeatureCollectionInfo = {
  features: Array<{ properties: { year: number; sqm_mean: number | null; sqm_count: number | null } }>;
};
type FrequencyHistogramInfo = { bortleClass?: Record<string, number> };

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "name query param is required" }, { status: 400 });
  }

  const referenceEntry = COUNTRY_LIGHT_POLLUTION.find((c) => c.name === name);
  if (!referenceEntry) {
    return NextResponse.json({ error: `Unknown country "${name}"` }, { status: 404 });
  }
  const { scaleMeters, simplifyMeters } = pickZonalTier(referenceEntry.pixelCount);

  try {
    await getEarthEngine();

    // LSIB_SIMPLE splits multi-part countries (Canada, Russia, ...) into
    // several same-name features — .geometry() on the filtered collection
    // combines them into one geometry so a single reduceRegion area-weights
    // across every fragment, instead of needing to merge per-fragment
    // results by hand the way the offline rankings batch script did.
    const countryGeometry = ee
      .FeatureCollection("USDOS/LSIB_SIMPLE/2017")
      .filter(ee.Filter.eq("country_na", name))
      .geometry()
      .simplify({ maxError: simplifyMeters });

    const trendCollection = ee.FeatureCollection(
      getViirsTrendCollection().map((image: ReturnType<typeof getViirsImage>) => {
        const stats = toSqmImage(image).reduceRegion({
          reducer: ee.Reducer.mean().combine({ reducer2: ee.Reducer.count(), sharedInputs: true }),
          geometry: countryGeometry,
          scale: scaleMeters,
          maxPixels: ZONAL_MAX_PIXELS,
          tileScale: ZONAL_TILE_SCALE,
        });
        return ee.Feature(null, stats).set("year", image.date().get("year"));
      }),
    );

    const bortleStats = toBortleClassImage(getViirsImage()).reduceRegion({
      reducer: ee.Reducer.frequencyHistogram(),
      geometry: countryGeometry,
      scale: scaleMeters,
      maxPixels: ZONAL_MAX_PIXELS,
      tileScale: ZONAL_TILE_SCALE,
    });

    const [trendInfo, bortleInfo] = await Promise.all([
      new Promise<TrendFeatureCollectionInfo>((resolve, reject) => {
        trendCollection.getInfo((result: TrendFeatureCollectionInfo, err: unknown) => {
          if (err || !result) {
            reject(err instanceof Error ? err : new Error(String(err ?? "no result")));
            return;
          }
          resolve(result);
        });
      }),
      new Promise<FrequencyHistogramInfo>((resolve, reject) => {
        bortleStats.getInfo((result: FrequencyHistogramInfo, err: unknown) => {
          if (err || !result) {
            reject(err instanceof Error ? err : new Error(String(err ?? "no result")));
            return;
          }
          resolve(result);
        });
      }),
    ]);

    const trend: CountryTrendPoint[] = trendInfo.features
      .map((f) => f.properties)
      .filter((p) => p.sqm_mean != null && p.sqm_count != null && p.sqm_count > 0)
      .map((p) => ({ year: p.year, avgSqm: Math.round((p.sqm_mean as number) * 100) / 100, pixelCount: p.sqm_count as number }))
      .sort((a, b) => a.year - b.year);

    if (trend.length === 0) {
      return NextResponse.json({ error: `No VIIRS coverage found for country "${name}"` }, { status: 404 });
    }

    const histogram = bortleInfo.bortleClass ?? {};
    const totalPixels = Object.values(histogram).reduce((sum, count) => sum + count, 0);
    const bortleDistribution: CountryBortleBreakdown[] = Array.from({ length: 9 }, (_, i) => i + 1).map((bortleClass) => ({
      bortleClass,
      percent: totalPixels > 0 ? Math.round(((histogram[String(bortleClass)] ?? 0) / totalPixels) * 1000) / 10 : 0,
    }));

    const response: CountryTrendResponse = { name, trend, bortleDistribution };
    return NextResponse.json(response);
  } catch (error) {
    console.error("[country-trend] Earth Engine error:", error);
    return NextResponse.json({ error: "Failed to compute the country trend" }, { status: 502 });
  }
}
