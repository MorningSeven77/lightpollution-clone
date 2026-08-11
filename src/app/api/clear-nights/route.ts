import { NextRequest, NextResponse } from "next/server";
import { nightCloudCoverByDate } from "@/lib/weather";

const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
// Balances statistical stability against request count/latency — 5 years is
// roughly what "climate normal" style stats commonly use for a quick
// estimate, not a rigorous 30-year normal.
const YEARS_SAMPLED = 5;
// A night counts as "clear" when its average night-time cloud cover stays at
// or below this — a simplified threshold (not an official definition) meant
// to mean "mostly cloud-free", not literally zero cloud.
const CLEAR_NIGHT_CLOUD_COVER_THRESHOLD = 30;

type ArchiveResponse = {
  hourly: { time: string[]; cloud_cover: number[]; is_day: number[] };
};

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const lng = parseFloat(request.nextUrl.searchParams.get("lng") ?? "");
  const monthParam = request.nextUrl.searchParams.get("month");
  const month = monthParam ? parseInt(monthParam, 10) : new Date().getUTCMonth() + 1;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng query params are required" }, { status: 400 });
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "month must be an integer 1-12" }, { status: 400 });
  }

  // Last N *complete* calendar years — keeps the sample size the same
  // regardless of whether the target month has already happened yet this
  // year, instead of sometimes sampling a partial/upcoming year.
  const currentYear = new Date().getUTCFullYear();
  const years = Array.from({ length: YEARS_SAMPLED }, (_, i) => currentYear - 1 - i);
  const monthPadded = String(month).padStart(2, "0");

  try {
    const responses = await Promise.all(
      years.map(async (year) => {
        const lastDay = daysInMonth(year, month);
        const startDate = `${year}-${monthPadded}-01`;
        const endDate = `${year}-${monthPadded}-${String(lastDay).padStart(2, "0")}`;
        const url = new URL(ARCHIVE_URL);
        url.searchParams.set("latitude", String(lat));
        url.searchParams.set("longitude", String(lng));
        url.searchParams.set("start_date", startDate);
        url.searchParams.set("end_date", endDate);
        url.searchParams.set("hourly", "cloud_cover,is_day");
        url.searchParams.set("timezone", "auto");
        // Completed past periods never change — safe to cache for a long time.
        const res = await fetch(url, { next: { revalidate: 2592000 } });
        if (!res.ok) throw new Error(`Open-Meteo archive request failed: ${res.status}`);
        return (await res.json()) as ArchiveResponse;
      }),
    );

    let clearNights = 0;
    let totalNights = 0;
    for (const data of responses) {
      const nightCloudByDate = nightCloudCoverByDate(data.hourly.time, data.hourly.cloud_cover, data.hourly.is_day);
      for (const [date, cloudCover] of Object.entries(nightCloudByDate)) {
        // nightCloudCoverByDate() attributes hours 00-11 of the range's first
        // day to the *previous* day's night, which spills one date into the
        // prior month with only a half-night (morning-only) sample — exclude
        // it rather than let an incomplete outside-range night skew the count.
        if (date.slice(5, 7) !== monthPadded) continue;
        totalNights += 1;
        if (cloudCover <= CLEAR_NIGHT_CLOUD_COVER_THRESHOLD) clearNights += 1;
      }
    }

    const percentClear = totalNights > 0 ? Math.round((clearNights / totalNights) * 100) : null;

    return NextResponse.json({ month, yearsSampled: years.length, percentClear });
  } catch (error) {
    console.error("[clear-nights] Open-Meteo archive fetch error:", error);
    return NextResponse.json({ error: "Failed to load clear-night climate data" }, { status: 502 });
  }
}
