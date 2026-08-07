"use client";

import { useMemo, useState } from "react";
import { getMoonPhaseInfo } from "@/lib/moonPhase";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function MoonPhasePanel() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  // Computed once when the panel opens rather than on every render — moon
  // phase only meaningfully changes over hours, not worth recomputing per tick.
  const info = useMemo(() => (open ? getMoonPhaseInfo(new Date()) : null), [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.moonPhase.openAria}
        className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-md border border-white/10 bg-zinc-900/90 p-2 text-zinc-100 shadow-lg backdrop-blur hover:bg-zinc-800"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M17.5 10a7.5 7.5 0 0 1-11.24 6.5A7.5 7.5 0 0 0 6.26 3.5 7.5 7.5 0 0 1 17.5 10Z" />
        </svg>
      </button>
    );
  }

  if (!info) return null;

  return (
    <div className="absolute left-1/2 top-4 z-10 w-64 -translate-x-1/2 rounded-md border border-white/10 bg-zinc-900/90 p-3 text-sm text-zinc-100 shadow-lg backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium">{t.moonPhase.title}</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t.moonPhase.closeAria}
          className="text-zinc-400 hover:text-zinc-100"
        >
          ✕
        </button>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div
          className="h-10 w-10 shrink-0 rounded-full bg-zinc-100"
          style={{
            // A simple two-tone "terminator" disc: illuminated fraction
            // rendered as a light-vs-dark split rather than a full crescent
            // render — approximate but reads clearly at this size.
            background: `linear-gradient(90deg, #f4f4f5 ${info.illuminationPercent}%, #27272a ${info.illuminationPercent}%)`,
          }}
        />
        <div>
          <div className="font-medium">{t.moonPhase.phaseLabels[info.phaseId]}</div>
          <div className="text-xs text-zinc-400">{t.moonPhase.ageDays(info.ageDays.toFixed(1))}</div>
        </div>
      </div>

      <div className="mb-3 text-xs text-zinc-400">{t.moonPhase.illumination(info.illuminationPercent.toFixed(1))}</div>

      <div>
        <div className="mb-1 text-xs text-zinc-400">{t.moonPhase.nextPhases}</div>
        <div className="space-y-1">
          {info.nextPhases.map((p) => (
            <div key={p.phaseId} className="flex items-center justify-between text-xs">
              <span>{t.moonPhase.phaseLabels[p.phaseId]}</span>
              <span className="text-zinc-400">{formatDate(p.date)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
