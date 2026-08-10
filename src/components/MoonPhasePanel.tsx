"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { getMoonPhaseInfo } from "@/lib/moonPhase";

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export type MoonPhasePanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Open state is lifted to the parent toolbar so it can close this panel
// whenever a sibling popup (golden hour, history, map controls...) opens —
// otherwise two of these floating panels can end up stacked on top of
// each other.
export default function MoonPhasePanel({ open, onOpenChange }: MoonPhasePanelProps) {
  const t = useTranslations("moonPhase");
  const tPhaseLabels = useTranslations("moonPhase.phaseLabels");
  // Computed once when the panel opens rather than on every render — moon
  // phase only meaningfully changes over hours, not worth recomputing per tick.
  const info = useMemo(() => (open ? getMoonPhaseInfo(new Date()) : null), [open]);

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label={t("openAria")}
        className={`rounded-md border border-white/10 p-2 text-zinc-100 shadow-lg backdrop-blur hover:bg-zinc-800 ${
          open ? "bg-zinc-800" : "bg-zinc-900/90"
        }`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M17.5 10a7.5 7.5 0 0 1-11.24 6.5A7.5 7.5 0 0 0 6.26 3.5 7.5 7.5 0 0 1 17.5 10Z" />
        </svg>
      </button>

      {!open && (
        <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {t("title")}
        </span>
      )}

      {open && info && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-md border border-white/10 bg-zinc-900/90 p-3 text-sm text-zinc-100 shadow-lg backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">{t("title")}</h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={t("closeAria")}
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
              <div className="font-medium">{tPhaseLabels(info.phaseId)}</div>
              <div className="text-xs text-zinc-400">{t("ageDays", { n: info.ageDays.toFixed(1) })}</div>
            </div>
          </div>

          <div className="mb-3 text-xs text-zinc-400">{t("illumination", { n: info.illuminationPercent.toFixed(1) })}</div>

          <div>
            <div className="mb-1 text-xs text-zinc-400">{t("nextPhases")}</div>
            <div className="space-y-1">
              {info.nextPhases.map((p) => (
                <div key={p.phaseId} className="flex items-center justify-between text-xs">
                  <span>{tPhaseLabels(p.phaseId)}</span>
                  <span className="text-zinc-400">{formatDate(p.date)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
