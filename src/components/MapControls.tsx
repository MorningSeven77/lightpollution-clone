"use client";

import { useState } from "react";
import { BasemapId, BASEMAP_STYLES } from "@/lib/basemapStyles";
import { ColorStyleId, COLOR_STYLES, paletteToCssGradient } from "@/lib/colorStyles";

export type MapControlsProps = {
  basemap: BasemapId;
  onBasemapChange: (id: BasemapId) => void;
  colorStyle: ColorStyleId;
  onColorStyleChange: (id: ColorStyleId) => void;
  opacity: number;
  onOpacityChange: (value: number) => void;
  visible: boolean;
  onVisibleChange: (value: boolean) => void;
};

export default function MapControls({
  basemap,
  onBasemapChange,
  colorStyle,
  onColorStyleChange,
  opacity,
  onOpacityChange,
  visible,
  onVisibleChange,
}: MapControlsProps) {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打开地图控制"
        className="fixed right-4 top-20 z-10 rounded-md border border-white/10 bg-zinc-900/90 p-2 text-zinc-100 shadow-lg backdrop-blur hover:bg-zinc-800"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M10 2a1 1 0 0 1 1 1v1.09a6.51 6.51 0 0 1 2.4 1L14.3 4.3a1 1 0 0 1 1.41 1.41l-.8.8a6.51 6.51 0 0 1 1 2.4H17a1 1 0 1 1 0 2h-1.09a6.51 6.51 0 0 1-1 2.4l.8.8a1 1 0 0 1-1.41 1.41l-.8-.8a6.51 6.51 0 0 1-2.4 1V17a1 1 0 1 1-2 0v-1.09a6.51 6.51 0 0 1-2.4-1l-.8.8a1 1 0 0 1-1.41-1.41l.8-.8a6.51 6.51 0 0 1-1-2.4H3a1 1 0 1 1 0-2h1.09a6.51 6.51 0 0 1 1-2.4l-.8-.8A1 1 0 0 1 5.7 4.3l.8.8a6.51 6.51 0 0 1 2.4-1V3a1 1 0 0 1 1-1Zm0 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed right-4 top-20 z-10 w-64 rounded-md border border-white/10 bg-zinc-900/90 p-3 text-sm text-zinc-100 shadow-lg backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium">地图控制</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="关闭地图控制"
          className="text-zinc-400 hover:text-zinc-100"
        >
          ✕
        </button>
      </div>

      <label className="mb-3 block">
        <span className="mb-1 block text-xs text-zinc-400">底图</span>
        <select
          value={basemap}
          onChange={(e) => onBasemapChange(e.target.value as BasemapId)}
          className="w-full rounded border border-white/10 bg-zinc-800 px-2 py-1.5 text-sm"
        >
          {Object.values(BASEMAP_STYLES).map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-zinc-400">光污染图层（VIIRS 2024）</span>
        <button
          type="button"
          role="switch"
          aria-checked={visible}
          onClick={() => onVisibleChange(!visible)}
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
            visible ? "bg-emerald-500" : "bg-zinc-600"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
              visible ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div className="mb-3">
        <span className="mb-1 block text-xs text-zinc-400">配色风格</span>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(COLOR_STYLES).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onColorStyleChange(s.id)}
              className={`rounded border px-2 py-1.5 text-left ${
                colorStyle === s.id ? "border-emerald-400 ring-1 ring-emerald-400" : "border-white/10"
              }`}
            >
              <div className="h-2 w-full rounded-full" style={{ background: paletteToCssGradient(s.palette) }} />
              <div className="mt-1 text-xs">{s.label}</div>
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1 flex items-center justify-between text-xs text-zinc-400">
          <span>透明度</span>
          <span>{opacity}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          className="w-full"
        />
      </label>
    </div>
  );
}
