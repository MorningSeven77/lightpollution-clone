"use client";

import { DarkSkyPlace, DARK_SKY_CATEGORY_META } from "@/lib/darkSkyPlaces";

export type DarkSkyPlacePanelProps = {
  place: DarkSkyPlace | null;
  onClose: () => void;
};

export default function DarkSkyPlacePanel({ place, onClose }: DarkSkyPlacePanelProps) {
  if (!place) return null;

  const meta = DARK_SKY_CATEGORY_META[place.category];

  return (
    <div className="absolute left-4 top-20 z-10 w-full max-w-xs rounded-md border border-white/10 bg-zinc-900/90 p-3 text-sm text-zinc-100 shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">认证暗空地点</span>
        <button type="button" onClick={onClose} aria-label="关闭暗空地点详情" className="text-zinc-400 hover:text-zinc-100">
          ✕
        </button>
      </div>

      <div className="mb-1 flex items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: meta.color }} />
        <span className="text-xs text-zinc-400">{meta.label}</span>
      </div>
      <div className="mb-2 text-base font-semibold">{place.name}</div>

      <div className="space-y-1 text-xs text-zinc-400">
        {place.year && <div>认证年份：{place.year}</div>}
        {place.area && <div>保护面积：{place.area}</div>}
      </div>

      <a
        href={place.link}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block rounded border border-white/10 px-2 py-1 text-xs hover:bg-zinc-800"
      >
        在 DarkSky 官网查看 ↗
      </a>
    </div>
  );
}
