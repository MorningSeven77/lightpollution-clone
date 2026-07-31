import { NextRequest, NextResponse } from "next/server";
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
    const image = getViirsImage().resample("bilinear");

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
