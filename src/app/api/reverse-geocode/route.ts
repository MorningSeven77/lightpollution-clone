import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

type NominatimReverseResult = {
  display_name?: string;
  error?: string;
};

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");
  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lng);
  url.searchParams.set("format", "jsonv2");
  // Zoom 10 ≈ city/town level — enough to identify "roughly where this is"
  // for a stargazing-location context without a verbose street address.
  url.searchParams.set("zoom", "10");

  const upstream = await fetch(url, {
    headers: {
      // Nominatim's usage policy requires an identifying User-Agent for every request:
      // https://operations.osmfoundation.org/policies/nominatim/
      "User-Agent": "lightpollution-clone-practice-project (local dev, no production traffic)",
    },
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: "reverse-geocode upstream error" }, { status: 502 });
  }

  // Nominatim responds 200 with an `error` field (not a non-2xx status) for
  // points it can't name, e.g. open ocean — that's a normal "no name" case,
  // not an upstream failure.
  const data = (await upstream.json()) as NominatimReverseResult;
  const displayName = data.error ? null : (data.display_name ?? null);

  return NextResponse.json({ displayName });
}
