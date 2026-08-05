import { NextRequest, NextResponse } from "next/server";
import ee from "@google/earthengine";
import { getEarthEngine, getViirsImage } from "@/lib/earthEngine";
import { COLOR_STYLES, DEFAULT_COLOR_STYLE, isColorStyleId } from "@/lib/colorStyles";

export async function GET(request: NextRequest) {
  const styleParam = request.nextUrl.searchParams.get("style");
  const styleId = isColorStyleId(styleParam) ? styleParam : DEFAULT_COLOR_STYLE;
  const style = COLOR_STYLES[styleId];

  const visParams = {
    min: style.min,
    max: style.max,
    palette: style.palette,
  };

  try {
    await getEarthEngine();
    // VIIRS's native ~15 arcsec (~463m) pixels are visibly blocky once the
    // map is zoomed past a certain point. Bilinear resampling only smooths
    // how this *tile layer* is rendered — it doesn't change the underlying
    // data, and point-value queries still read the raw pixel value.
    //
    // At world zoom the opposite problem shows up: without an explicit
    // aggregation step, EE falls back to its default pyramiding (picking a
    // single representative pixel per output pixel) when a tile pixel spans
    // hundreds of native VIIRS pixels — that reads as sparse, scattered dots
    // instead of the filled-in glow lit regions should have. reduceResolution
    // with a max reducer aggregates every source pixel under each output
    // pixel and keeps the brightest one, so a lit area stays visibly lit even
    // zoomed all the way out. maxPixels is raised well past the default (64)
    // since a world-zoom tile pixel covers far more than 64 source pixels.
    // At the very lowest zoom levels (world view and close to it), a single
    // output pixel can span *more* native VIIRS pixels than reduceResolution
    // is willing to aggregate (its maxPixels has a hard ceiling of 1024) —
    // without bestEffort it throws ("Too many input pixels per output
    // pixel") instead of just quietly using what it's given. bestEffort
    // tells it to aggregate over a subsample up to maxPixels rather than
    // fail outright; visually indistinguishable here since we only care
    // about "is anything in this patch lit", not exhaustively checking
    // every one of a thousand-plus candidate pixels.
    const image = getViirsImage()
      .reduceResolution({ reducer: ee.Reducer.max(), maxPixels: 1024, bestEffort: true })
      .resample("bilinear");

    const urlFormat = await new Promise<string>((resolve, reject) => {
      image.getMap(visParams, (mapInfo: { urlFormat?: string }, err: unknown) => {
        if (err || !mapInfo?.urlFormat) {
          reject(err instanceof Error ? err : new Error(String(err ?? "no urlFormat returned")));
          return;
        }
        resolve(mapInfo.urlFormat);
      });
    });

    return NextResponse.json({ urlFormat });
  } catch (error) {
    console.error("[tile-layer] Earth Engine error:", error);
    return NextResponse.json({ error: "Failed to build the light-pollution tile layer" }, { status: 502 });
  }
}
