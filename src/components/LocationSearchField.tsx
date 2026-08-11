"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { GeocodeResult } from "@/components/SearchBar";

export type PickedLocation = { lat: number; lng: number; placeName: string; source: "geolocation" | "search" };

export type LocationSearchFieldProps = {
  onSelect: (location: PickedLocation) => void;
};

// Shared "use my location" + debounced place search — reuses the main map's
// own /api/geocode endpoint. Renders as plain siblings (no wrapping element)
// so callers can drop it straight into their own flex row alongside other
// controls (a date picker, etc.), same layout Golden Hour originally had
// this UI grouped with.
export default function LocationSearchField({ onSelect }: LocationSearchFieldProps) {
  const t = useTranslations("locationSearch");
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
        onSelect({ lat: position.coords.latitude, lng: position.coords.longitude, placeName: "", source: "geolocation" });
        setLocating(false);
      },
      () => {
        setGeoError(true);
        setLocating(false);
      },
      { timeout: 8000 },
    );
  };

  return (
    <>
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
                      onSelect({ lat: r.lat, lng: r.lng, placeName: r.displayName, source: "search" });
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

      {geoError && <div className="w-full text-xs text-red-400">{t("geolocationError")}</div>}
    </>
  );
}
