"use client";

import { useTranslations } from "next-intl";
import type { RankedSpot } from "@/lib/bestSpots";

export type BestSpotsResultsProps = {
  spots: RankedSpot[];
  onClose: () => void;
  onSelectSpot: (lat: number, lng: number) => void;
};

export default function BestSpotsResults({ spots, onClose, onSelectSpot }: BestSpotsResultsProps) {
  const t = useTranslations("bestSpots");

  return (
    <div className="absolute right-72 top-20 z-10 w-64 rounded-md border border-white/10 bg-zinc-900/90 p-3 text-sm text-zinc-100 shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-medium">{t("resultsTitle", { count: spots.length })}</h2>
        <button type="button" onClick={onClose} aria-label={t("closeResultsAria")} className="text-zinc-400 hover:text-zinc-100">
          ✕
        </button>
      </div>
      <div className="max-h-96 space-y-1 overflow-y-auto">
        {spots.map((spot, i) => (
          <button
            key={`${spot.lat}-${spot.lng}`}
            type="button"
            onClick={() => onSelectSpot(spot.lat, spot.lng)}
            className="flex w-full items-center gap-2 rounded border border-white/10 bg-zinc-800/50 p-2 text-left text-xs hover:bg-zinc-800"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500 text-[10px] font-semibold text-white">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <div>{t("distanceSqm", { distance: spot.distanceKm.toFixed(1), sqm: spot.sqm.toFixed(2) })}</div>
              <div className="text-zinc-400">
                B{spot.bortleClass} · {t("scoreLabel", { score: spot.score })}
              </div>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
