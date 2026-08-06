import { NextRequest, NextResponse } from "next/server";
import { moonPhaseToIlluminationPercent, nightCloudCoverByDate } from "@/lib/weather";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

type OpenMeteoResponse = {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    relative_humidity_2m_max: number[];
    relative_humidity_2m_min: number[];
    visibility_mean: number[]; // meters
    moon_phase: number[]; // 0-1 synodic fraction
  };
  hourly: {
    time: string[];
    cloud_cover: number[];
    is_day: number[];
  };
};

export type WeatherDay = {
  date: string; // "2026-08-07"
  weatherCode: number;
  tempMinC: number;
  tempMaxC: number;
  humidityMinPercent: number;
  humidityMaxPercent: number;
  visibilityKm: number;
  nightCloudCoverPercent: number;
  moonIlluminationPercent: number;
};

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lng = parseFloat(request.nextUrl.searchParams.get("lng") ?? "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng query params are required" }, { status: 400 });
  }

  const url = new URL(OPEN_METEO_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,relative_humidity_2m_min,visibility_mean,moon_phase",
  );
  url.searchParams.set("hourly", "cloud_cover,is_day");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("past_days", "1");
  url.searchParams.set("forecast_days", "6");

  try {
    // Open-Meteo regenerates forecasts roughly hourly; a 30-minute revalidate
    // window keeps this reasonably fresh without hitting it on every request.
    const upstream = await fetch(url, { next: { revalidate: 1800 } });
    if (!upstream.ok) throw new Error(`Open-Meteo request failed: ${upstream.status}`);
    const data = (await upstream.json()) as OpenMeteoResponse;

    const nightCloudByDate = nightCloudCoverByDate(data.hourly.time, data.hourly.cloud_cover, data.hourly.is_day);

    const days: WeatherDay[] = data.daily.time.map((date, i) => ({
      date,
      weatherCode: data.daily.weather_code[i],
      tempMinC: data.daily.temperature_2m_min[i],
      tempMaxC: data.daily.temperature_2m_max[i],
      humidityMinPercent: data.daily.relative_humidity_2m_min[i],
      humidityMaxPercent: data.daily.relative_humidity_2m_max[i],
      visibilityKm: Math.round((data.daily.visibility_mean[i] / 1000) * 10) / 10,
      nightCloudCoverPercent: nightCloudByDate[date] ?? 0,
      moonIlluminationPercent: moonPhaseToIlluminationPercent(data.daily.moon_phase[i]),
    }));

    return NextResponse.json({ days });
  } catch (error) {
    console.error("[weather] Open-Meteo fetch error:", error);
    return NextResponse.json({ error: "Failed to load weather forecast" }, { status: 502 });
  }
}
