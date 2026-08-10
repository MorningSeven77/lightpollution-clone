"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { RankedSpot } from "@/lib/bestSpots";

export type BestSpotsSearchModalProps = {
  lat: number;
  lng: number;
  onResults: (spots: RankedSpot[]) => void;
  onClose: () => void;
};

const DEFAULT_RADIUS_KM = 100;
const DEFAULT_MAX_RESULTS = 10;
const DEFAULT_MIN_DISTANCE_KM = 10;

// Shared modal body used by both the Best Spots entry point inside
// LocationDetailPanel (search around the clicked point) and the toolbar
// quick-access button (search around the current map center) — the only
// difference between the two call sites is which lat/lng they pass in.
export default function BestSpotsSearchModal({ lat, lng, onResults, onClose }: BestSpotsSearchModalProps) {
  const t = useTranslations("bestSpots");
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [maxResults, setMaxResults] = useState(DEFAULT_MAX_RESULTS);
  const [minDistanceKm, setMinDistanceKm] = useState(DEFAULT_MIN_DISTANCE_KM);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(false);

  const handleSearch = async () => {
    setSearching(true);
    setError(false);
    try {
      const res = await fetch(
        `/api/best-spots?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}&maxResults=${maxResults}&minDistanceKm=${minDistanceKm}`,
      );
      if (!res.ok) throw new Error("best-spots request failed");
      const data = (await res.json()) as { spots: RankedSpot[] };
      onResults(data.spots);
      onClose();
    } catch {
      setError(true);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center bg-black/50 p-4 pt-20" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-md border border-white/10 bg-zinc-900/95 p-3 text-sm text-zinc-100 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="font-medium">{t("modalTitle")}</span>
          <button type="button" onClick={onClose} aria-label={t("closeAria")} className="text-zinc-400 hover:text-zinc-100">
            ✕
          </button>
        </div>

        <label className="mb-3 block">
          <span className="mb-1 flex items-center justify-between text-xs text-zinc-400">
            <span>{t("radiusLabel")}</span>
            <span>{radiusKm} km</span>
          </span>
          <input
            type="range"
            min={5}
            max={300}
            step={5}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1 flex items-center justify-between text-xs text-zinc-400">
            <span>{t("maxResultsLabel")}</span>
            <span>{maxResults}</span>
          </span>
          <input
            type="range"
            min={1}
            max={25}
            step={1}
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1 flex items-center justify-between text-xs text-zinc-400">
            <span>{t("minDistanceLabel")}</span>
            <span>{minDistanceKm} km</span>
          </span>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={minDistanceKm}
            onChange={(e) => setMinDistanceKm(Number(e.target.value))}
            className="w-full"
          />
        </label>

        {error && <div className="mb-2 text-xs text-red-400">{t("searchError")}</div>}

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded border border-white/10 px-2 py-1.5 text-xs hover:bg-zinc-800">
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="flex-1 rounded bg-emerald-500 px-2 py-1.5 text-xs font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {searching ? t("searching") : t("startSearch")}
          </button>
        </div>
      </div>
    </div>
  );
}
