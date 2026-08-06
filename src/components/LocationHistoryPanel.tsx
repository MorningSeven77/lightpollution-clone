"use client";

import { useState } from "react";
import {
  LocationHistoryEntry,
  getLocationHistory,
  clearLocationHistory,
  computeSkyBackgroundRatio,
} from "@/lib/locationHistory";

export type LocationHistoryPanelProps = {
  onSelectLocation: (lat: number, lng: number) => void;
};

const MAX_COMPARE = 5;

function formatRelativeTime(timestamp: number): string {
  const diffMin = Math.floor((Date.now() - timestamp) / 60000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} 小时前`;
  return `${Math.floor(diffHour / 24)} 天前`;
}

function entryKey(entry: LocationHistoryEntry): string {
  return `${entry.lat},${entry.lng},${entry.timestamp}`;
}

export default function LocationHistoryPanel({ onSelectLocation }: LocationHistoryPanelProps) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<LocationHistoryEntry[]>([]);
  const [compareKeys, setCompareKeys] = useState<Set<string>>(new Set());

  // Re-read from localStorage right when the panel opens — entries may have
  // been added by point-value queries made while it was closed.
  const handleOpen = () => {
    setHistory(getLocationHistory());
    setOpen(true);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        aria-label="打开位置历史面板"
        className="absolute left-1/2 top-4 z-10 translate-x-6 rounded-md border border-white/10 bg-zinc-900/90 p-2 text-zinc-100 shadow-lg backdrop-blur hover:bg-zinc-800"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .2.08.39.22.53l3 3a.75.75 0 1 0 1.06-1.06l-2.78-2.78V5Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    );
  }

  const toggleCompare = (key: string) => {
    setCompareKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else if (next.size < MAX_COMPARE) {
        next.add(key);
      }
      return next;
    });
  };

  const handleClear = () => {
    clearLocationHistory();
    setHistory([]);
    setCompareKeys(new Set());
  };

  // Darker sky (higher SQM) sorts first, matching the reference site's own
  // "darkest first" comparison ordering.
  const compareEntries = history.filter((e) => compareKeys.has(entryKey(e))).sort((a, b) => b.sqm - a.sqm);
  const darkestSqm = compareEntries[0]?.sqm;

  return (
    // A centered modal rather than a docked panel like the other floating
    // UI: this one's content height varies a lot (empty state vs. a full
    // list vs. list+compare results), and at typical desktop widths that
    // would collide with the settings panel on the right — a modal sidesteps
    // the collision entirely instead of fighting over the same screen edge.
    <div
      className="fixed inset-0 z-20 flex items-start justify-center bg-black/50 p-4 pt-20"
      onClick={() => setOpen(false)}
    >
      <div
        className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-md border border-white/10 bg-zinc-900/95 p-3 text-sm text-zinc-100 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">位置历史</span>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button type="button" onClick={handleClear} className="text-xs text-zinc-400 hover:text-red-400">
              清空
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="关闭位置历史面板"
            className="text-zinc-400 hover:text-zinc-100"
          >
            ✕
          </button>
        </div>
      </div>

      {history.length === 0 && <div className="text-xs text-zinc-400">还没有查询记录，点击地图上的位置看看吧</div>}

      <div className="max-h-64 space-y-1 overflow-y-auto">
        {history.map((entry) => {
          const key = entryKey(entry);
          const checked = compareKeys.has(key);
          return (
            <div key={key} className="flex items-center gap-2 rounded border border-white/10 bg-zinc-800/50 p-2 text-xs">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleCompare(key)}
                disabled={!checked && compareKeys.size >= MAX_COMPARE}
                className="shrink-0"
                aria-label="加入对比"
              />
              <button
                type="button"
                onClick={() => onSelectLocation(entry.lat, entry.lng)}
                className="min-w-0 flex-1 text-left hover:text-emerald-400"
              >
                <div className="truncate font-medium">{entry.placeName ?? `${entry.lat.toFixed(2)}, ${entry.lng.toFixed(2)}`}</div>
                <div className="text-[10px] text-zinc-400">
                  Bortle {entry.bortleClass} · SQM {entry.sqm.toFixed(2)} · {formatRelativeTime(entry.timestamp)}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {compareEntries.length >= 2 && darkestSqm !== undefined && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="mb-1 text-xs font-medium text-zinc-300">位置对比（按暗到亮排序）</div>
          <div className="space-y-1">
            {compareEntries.map((entry, i) => (
              <div key={entryKey(entry)} className="flex items-center justify-between gap-2 text-xs">
                <span className="min-w-0 flex-1 truncate">
                  {i === 0 && (
                    <span className="mr-1 rounded bg-emerald-500/20 px-1 text-[10px] text-emerald-400">最暗</span>
                  )}
                  {entry.placeName ?? `${entry.lat.toFixed(2)}, ${entry.lng.toFixed(2)}`}
                </span>
                <span className="shrink-0 text-zinc-400">
                  SQM {entry.sqm.toFixed(2)} · {computeSkyBackgroundRatio(darkestSqm, entry.sqm).toFixed(1)}x
                </span>
              </div>
            ))}
          </div>
          <div className="mt-1 text-[10px] text-zinc-500">天光背景倍数是物理亮度比例，不是曝光时间或信噪比预测。</div>
        </div>
      )}
      </div>
    </div>
  );
}
