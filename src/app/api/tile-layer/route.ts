import { NextResponse } from "next/server";
import { getEarthEngine, getViirsImage } from "@/lib/earthEngine";

const VIS_PARAMS = {
  min: 0,
  max: 60,
  palette: ["000000", "1a1a2e", "16213e", "e94560", "f9ed69", "ffffff"],
};

export async function GET() {
  try {
    await getEarthEngine();
    const image = getViirsImage();

    const urlFormat = await new Promise<string>((resolve, reject) => {
      image.getMap(VIS_PARAMS, (mapInfo: { urlFormat?: string }, err: unknown) => {
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
