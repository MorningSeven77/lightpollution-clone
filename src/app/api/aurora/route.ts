import { NextResponse } from "next/server";

const OVATION_URL = "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json";

type OvationResponse = {
  "Forecast Time": string;
  // [longitude 0-359, latitude -90..90, aurora probability 0-100]
  coordinates: [number, number, number][];
};

export type AuroraFeatureCollection = {
  type: "FeatureCollection";
  forecastTime: string;
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: { probability: number };
  }>;
};

export async function GET() {
  try {
    // NOAA regenerates this file every 5-15 minutes; a short revalidate window
    // avoids hitting SWPC on every single page load without serving stale data.
    const upstream = await fetch(OVATION_URL, { next: { revalidate: 300 } });
    if (!upstream.ok) throw new Error(`NOAA OVATION request failed: ${upstream.status}`);
    const data = (await upstream.json()) as OvationResponse;

    const features: AuroraFeatureCollection["features"] = [];
    for (const [lon, lat, probability] of data.coordinates) {
      if (probability <= 0) continue;
      // NOAA reports longitude as 0-359; GeoJSON/MapLibre expect -180..180,
      // otherwise the eastern half of the grid renders shifted a full world away.
      const normalizedLon = lon > 180 ? lon - 360 : lon;
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [normalizedLon, lat] },
        properties: { probability },
      });
    }

    const result: AuroraFeatureCollection = {
      type: "FeatureCollection",
      forecastTime: data["Forecast Time"],
      features,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error("[aurora] NOAA OVATION fetch error:", error);
    return NextResponse.json({ error: "Failed to load aurora forecast" }, { status: 502 });
  }
}
