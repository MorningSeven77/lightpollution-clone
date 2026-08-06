import { NextRequest, NextResponse } from "next/server";
import ee from "@google/earthengine";
import { getEarthEngine, getViirsImage } from "@/lib/earthEngine";
import { COLOR_STYLES, DEFAULT_COLOR_STYLE, isColorStyleId } from "@/lib/colorStyles";
import { BORTLE_CLASS_RADIANCE_BREAKPOINTS } from "@/lib/bortle";

// "Classic" is described as "Clear zones" and its legend is 9 discrete
// Bortle-class swatches, not a continuous scale — but until now the tile
// itself was still a smooth per-pixel gradient, which reads as a blur
// instead of distinct regions (reference site's Classic style renders
// crisp, contour-like bands). visualize() has no "posterize" option, so
// turning the continuous radiance into a discrete 0-8 Bortle class index
// *before* visualize() is what actually produces the "zone" look — each
// pixel can only take one of 9 values, so visualize() has no continuum left
// to interpolate across.
//
// This intentionally classifies by the *real* Bortle-class radiance
// breakpoints (see bortle.ts) rather than uniform steps across style.min–max
// — uniform steps were tried first and looked wrong: with 9 equal-width
// steps across a 0-150 range, anything under ~17 radiance (a huge share of
// real inhabited areas — see radianceToBortleEstimate's own log-scale
// comment) fell into the first bucket and rendered solid black, which is
// exactly why the map looked mostly black with only isolated colorful spots
// instead of broad, colorful coverage like the reference site. The real
// breakpoints are heavily front-loaded near zero for the same reason the
// SQM curve is logarithmic, so low light levels already register as a
// non-black class.
function classifyByBortleBreakpoints(image: ReturnType<typeof getViirsImage>) {
  let classIndex = ee.Image(0);
  for (const breakpoint of BORTLE_CLASS_RADIANCE_BREAKPOINTS) {
    classIndex = classIndex.add(image.gte(breakpoint));
  }
  return classIndex;
}

export async function GET(request: NextRequest) {
  const styleParam = request.nextUrl.searchParams.get("style");
  const styleId = isColorStyleId(styleParam) ? styleParam : DEFAULT_COLOR_STYLE;
  const style = COLOR_STYLES[styleId];
  const isBortle = style.legendType === "bortle";

  // "bortle" styles render a discrete 0..N class index (N = number of
  // breakpoints) instead of raw radiance, so they need their own min/max
  // for visualize() — style.min/max describes the *radiance* range and
  // doesn't apply once the value being visualized is a class index.
  const visParams = isBortle
    ? { min: 0, max: BORTLE_CLASS_RADIANCE_BREAKPOINTS.length, palette: style.palette }
    : { min: style.min, max: style.max, palette: style.palette };

  try {
    await getEarthEngine();
    // At world zoom, a tile pixel spans hundreds to thousands of native
    // VIIRS pixels. Without correcting for that, EE's default pyramiding
    // just picks whichever single native pixel lands on the output grid —
    // that reads as sparse, scattered dots instead of the filled-in glow lit
    // regions should have, since most of those "hundreds of source pixels"
    // never get sampled at all. reduceResolution (aggregate every source
    // pixel under each output pixel, keep the brightest) fixes that.
    //
    // maxPixels stays at EE's own default (64) rather than a much higher
    // value tried earlier (1024, then chaining a real-world-radius
    // focal_max dilation on top of it) — both cost noticeably more without
    // reliably looking any better; 64 measured consistently fast (1-3s)
    // across every zoom level tested, world view included. What actually
    // fixed "mostly black, dots of color" at world zoom turned out to be
    // unrelated to this aggregation step at all — see
    // classifyByBortleBreakpoints below.
    let image = getViirsImage()
      .reduceResolution({ reducer: ee.Reducer.max(), maxPixels: 64, bestEffort: true })
      .resample("bilinear");

    if (isBortle) {
      // Quantizing raw per-pixel noise straight into classes reads as
      // speckle (every noisy pixel can land in a different class from its
      // neighbors); smoothing the *continuous* signal first, then
      // classifying, is what actually produces clean contour-like
      // boundaries — smoothing *after* classifying would just blur the flat
      // colors back together at the edges.
      image = image.focal_mean({ radius: 4, units: "pixels" });
      image = classifyByBortleBreakpoints(image);
    }

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
