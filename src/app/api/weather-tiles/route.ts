import { NextRequest, NextResponse } from "next/server";

const ALLOWED_LAYERS = new Set(["clouds_new", "precipitation_new"]);
const OPENWEATHERMAP_TILE_URL = "https://tile.openweathermap.org/map";

// Proxies OpenWeatherMap's raster tile layers server-side so the API key
// never reaches the client — MapLibre's raster source `tiles` array just
// points at this route (?z={z}&x={x}&y={y}) instead of OpenWeatherMap
// directly. Requires OPENWEATHERMAP_API_KEY in .env.local (free tier is
// enough for this project); see CLAUDE.md for setup.
export async function GET(request: NextRequest) {
  const layer = request.nextUrl.searchParams.get("layer");
  const z = request.nextUrl.searchParams.get("z");
  const x = request.nextUrl.searchParams.get("x");
  const y = request.nextUrl.searchParams.get("y");

  if (!layer || !ALLOWED_LAYERS.has(layer) || !z || !x || !y) {
    return NextResponse.json({ error: "layer, z, x, y query params are required" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENWEATHERMAP_API_KEY is not configured" }, { status: 503 });
  }

  const upstreamUrl = `${OPENWEATHERMAP_TILE_URL}/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;

  try {
    // Tile imagery refreshes roughly every 10 minutes upstream, so a
    // matching revalidate window avoids re-fetching the same tile constantly
    // while panning back and forth.
    const upstream = await fetch(upstreamUrl, { next: { revalidate: 600 } });
    if (!upstream.ok) throw new Error(`OpenWeatherMap tile request failed: ${upstream.status}`);
    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (error) {
    console.error("[weather-tiles] OpenWeatherMap fetch error:", error);
    return NextResponse.json({ error: "Failed to load weather tile" }, { status: 502 });
  }
}
