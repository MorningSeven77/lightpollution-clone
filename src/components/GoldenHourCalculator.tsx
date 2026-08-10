"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import GoldenHourCompass from "@/components/GoldenHourCompass";
import { computeSunEvents, SunEvent, SunTimeWindow } from "@/lib/sunPosition";
import type { GeocodeResult } from "@/components/SearchBar";

const COMPASS_POINTS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

function azimuthToCompassPoint(azimuthDeg: number): string {
  const index = Math.round(azimuthDeg / 22.5) % 16;
  return COMPASS_POINTS[index];
}

function todayIsoDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Fixed-offset formatting (for the "approximate from longitude" case) reads
// UTC fields off a manually time-shifted Date — Intl's timeZone option only
// accepts real IANA zone names, not arbitrary "UTC+N" offsets.
function formatWithOffset(date: Date, offsetHours: number): string {
  const shifted = new Date(date.getTime() + offsetHours * 3600000);
  const hh = String(shifted.getUTCHours()).padStart(2, "0");
  const mm = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
}

type LocationState = { lat: number; lng: number; placeName: string; source: "geolocation" | "search" } | null;

// Shared calculator body used both by the standalone /golden-hour page (for
// SEO — an independently indexable URL) and the toolbar's inline popup. Kept
// free of any page chrome (no <h1>, no SiteHeader, no "back to map" link) so
// each call site can wrap it however fits.
export default function GoldenHourCalculator() {
  const t = useTranslations("goldenHour");
  const [location, setLocation] = useState<LocationState>(null);
  const [date, setDate] = useState(todayIsoDate());
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
        const data: GeocodeResult[] = await res.json();
        setResults(data);
        setSearchOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleUseMyLocation = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoError(true);
      return;
    }
    setLocating(true);
    setGeoError(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          placeName: "",
          source: "geolocation",
        });
        setLocating(false);
      },
      () => {
        setGeoError(true);
        setLocating(false);
      },
      { timeout: 8000 },
    );
  };

  const events = useMemo(() => {
    if (!location) return null;
    return computeSunEvents(new Date(`${date}T00:00:00Z`), location.lat, location.lng);
  }, [location, date]);

  // Only meaningful for a searched (non-geolocation) point — "my location"
  // formats in the browser's own real timezone instead.
  const approxUtcOffset = location ? Math.round(location.lng / 15) : 0;

  const formatTime = (event: SunEvent): string =>
    location?.source === "geolocation" ? formatLocalTime(event.time) : formatWithOffset(event.time, approxUtcOffset);

  const renderWindow = (label: string, window: SunTimeWindow | null) => (
    <div className="rounded border border-white/10 bg-zinc-800/50 p-3">
      <div className="text-xs text-zinc-400">{label}</div>
      {window ? (
        <>
          <div className="mt-1 text-lg font-medium">
            {formatTime(window.start)}–{formatTime(window.end)}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            {t("azimuthRange", { start: Math.round(window.start.azimuthDeg), end: Math.round(window.end.azimuthDeg) })} ·{" "}
            {azimuthToCompassPoint(window.start.azimuthDeg)} → {azimuthToCompassPoint(window.end.azimuthDeg)}
          </div>
        </>
      ) : (
        <div className="mt-1 text-xs text-zinc-500">{t("notApplicable")}</div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="rounded-md border border-white/10 bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
        >
          {locating ? t("locatingLabel") : t("useMyLocation")}
        </button>

        <div className="relative w-full max-w-xs sm:w-auto">
          <input
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              if (value.trim().length < 2) {
                setResults([]);
                setSearchOpen(false);
              }
            }}
            onFocus={() => results.length > 0 && setSearchOpen(true)}
            placeholder={t("locationPlaceholder")}
            className="w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 sm:w-56"
          />
          {searchOpen && (
            <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-white/10 bg-zinc-900 text-sm shadow-lg">
              {searching && <li className="px-3 py-2 text-zinc-400">{t("searching")}</li>}
              {!searching && results.length === 0 && <li className="px-3 py-2 text-zinc-400">{t("noResults")}</li>}
              {!searching &&
                results.map((r, i) => (
                  <li key={`${r.lat}-${r.lng}-${i}`}>
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left hover:bg-zinc-800"
                      onClick={() => {
                        setLocation({ lat: r.lat, lng: r.lng, placeName: r.displayName, source: "search" });
                        setQuery(r.displayName);
                        setSearchOpen(false);
                      }}
                    >
                      {r.displayName}
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-zinc-400">{t("dateLabel")}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-white/10 bg-zinc-800 px-2 py-2 text-sm"
          />
        </label>
      </div>

      {geoError && <div className="mt-2 text-xs text-red-400">{t("geolocationError")}</div>}

      {location && (
        <div className="mt-2 text-xs text-zinc-400">
          {location.placeName && <span>{location.placeName} · </span>}
          {location.source === "geolocation"
            ? t("coordsLocal", { lat: location.lat.toFixed(2), lng: location.lng.toFixed(2) })
            : t("coordsApprox", {
                lat: location.lat.toFixed(2),
                lng: location.lng.toFixed(2),
                offset: approxUtcOffset >= 0 ? `+${approxUtcOffset}` : approxUtcOffset,
              })}
        </div>
      )}

      {events && (
        <>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <GoldenHourCompass
              morningBlueHour={
                events.morningBlueHour && {
                  startAzimuthDeg: events.morningBlueHour.start.azimuthDeg,
                  endAzimuthDeg: events.morningBlueHour.end.azimuthDeg,
                }
              }
              morningGoldenHour={
                events.morningGoldenHour && {
                  startAzimuthDeg: events.morningGoldenHour.start.azimuthDeg,
                  endAzimuthDeg: events.morningGoldenHour.end.azimuthDeg,
                }
              }
              eveningGoldenHour={
                events.eveningGoldenHour && {
                  startAzimuthDeg: events.eveningGoldenHour.start.azimuthDeg,
                  endAzimuthDeg: events.eveningGoldenHour.end.azimuthDeg,
                }
              }
              eveningBlueHour={
                events.eveningBlueHour && {
                  startAzimuthDeg: events.eveningBlueHour.start.azimuthDeg,
                  endAzimuthDeg: events.eveningBlueHour.end.azimuthDeg,
                }
              }
              labels={{
                north: t("compassNorth"),
                east: t("compassEast"),
                south: t("compassSouth"),
                west: t("compassWest"),
              }}
            />

            <div className="grid flex-1 grid-cols-2 gap-2 text-sm">
              <div className="rounded border border-white/10 bg-zinc-800/50 p-3">
                <div className="text-xs text-zinc-400">{t("sunrise")}</div>
                <div className="mt-1 text-lg font-medium">{events.sunrise ? formatTime(events.sunrise) : "—"}</div>
                {events.sunrise && (
                  <div className="mt-1 text-xs text-zinc-400">
                    {Math.round(events.sunrise.azimuthDeg)}° {azimuthToCompassPoint(events.sunrise.azimuthDeg)}
                  </div>
                )}
              </div>
              <div className="rounded border border-white/10 bg-zinc-800/50 p-3">
                <div className="text-xs text-zinc-400">{t("sunset")}</div>
                <div className="mt-1 text-lg font-medium">{events.sunset ? formatTime(events.sunset) : "—"}</div>
                {events.sunset && (
                  <div className="mt-1 text-xs text-zinc-400">
                    {Math.round(events.sunset.azimuthDeg)}° {azimuthToCompassPoint(events.sunset.azimuthDeg)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {renderWindow(t("morningBlueHour"), events.morningBlueHour)}
            {renderWindow(t("morningGoldenHour"), events.morningGoldenHour)}
            {renderWindow(t("eveningGoldenHour"), events.eveningGoldenHour)}
            {renderWindow(t("eveningBlueHour"), events.eveningBlueHour)}
          </div>

          <div className="mt-4 text-xs text-zinc-500">{t("timezoneNote")}</div>
        </>
      )}

      <div className="mt-8 border-t border-white/10 pt-4">
        <h2 className="text-sm font-medium">{t("definitionTitle")}</h2>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">{t("definitionBody")}</p>
      </div>
    </div>
  );
}
