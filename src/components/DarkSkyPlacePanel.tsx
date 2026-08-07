"use client";

import { DarkSkyPlace, DARK_SKY_CATEGORY_META } from "@/lib/darkSkyPlaces";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type DarkSkyPlacePanelProps = {
  place: DarkSkyPlace | null;
  onClose: () => void;
};

export default function DarkSkyPlacePanel({ place, onClose }: DarkSkyPlacePanelProps) {
  const { t } = useLanguage();
  if (!place) return null;

  const meta = DARK_SKY_CATEGORY_META[place.category];

  return (
    <div className="absolute left-4 top-20 z-10 w-full max-w-xs rounded-md border border-white/10 bg-zinc-900/90 p-3 text-sm text-zinc-100 shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-medium">{t.darkSkyPlace.title}</h2>
        <button type="button" onClick={onClose} aria-label={t.darkSkyPlace.closeAria} className="text-zinc-400 hover:text-zinc-100">
          ✕
        </button>
      </div>

      <div className="mb-1 flex items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: meta.color }} />
        <span className="text-xs text-zinc-400">{t.dataLabels.darkSkyCategories[place.category]}</span>
      </div>
      <h3 className="mb-2 text-base font-semibold">{place.name}</h3>

      <div className="space-y-1 text-xs text-zinc-400">
        {place.year && <div>{t.darkSkyPlace.yearLabel(place.year)}</div>}
        {place.area && <div>{t.darkSkyPlace.areaLabel(place.area)}</div>}
      </div>

      <a
        href={place.link}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block rounded border border-white/10 px-2 py-1 text-xs hover:bg-zinc-800"
      >
        {t.darkSkyPlace.linkText}
      </a>
    </div>
  );
}
