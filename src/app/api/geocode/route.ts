import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json([]);
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");

  const upstream = await fetch(url, {
    headers: {
      // Nominatim's usage policy requires an identifying User-Agent for every request:
      // https://operations.osmfoundation.org/policies/nominatim/
      "User-Agent": "lightpollution-clone-practice-project (local dev, no production traffic)",
    },
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: "geocode upstream error" }, { status: 502 });
  }

  const data = (await upstream.json()) as NominatimResult[];

  const results = data.map((item) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));

  return NextResponse.json(results);
}
