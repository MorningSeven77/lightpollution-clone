"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { estimateFromPhotoBrightness, bortleSeverityTier, type PhotoBrightnessEstimate } from "@/lib/skyPhotoAnalyzer";
import { STAR_COUNT_ESTIMATES } from "@/lib/bortle";

// Downsampling to a small canvas before averaging is both much faster than
// walking every pixel of a full-resolution photo and numerically equivalent
// (the browser's own image scaling already does the averaging for us).
const SAMPLE_SIZE = 64;

async function computeAverageBrightness(file: File): Promise<number> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");
  ctx.drawImage(bitmap, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    // Standard luma weighting (matches how displays/eyes weight R/G/B
    // differently), not a flat average.
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return sum / (SAMPLE_SIZE * SAMPLE_SIZE);
}

type AnalysisState =
  | { status: "idle" }
  | { status: "analyzing" }
  | { status: "error" }
  | { status: "done"; result: PhotoBrightnessEstimate };

const SEVERITY_BADGE_CLASSES: Record<string, string> = {
  excellent: "bg-emerald-500/20 text-emerald-400",
  good: "bg-teal-500/20 text-teal-400",
  moderate: "bg-yellow-500/20 text-yellow-400",
  high: "bg-orange-500/20 text-orange-400",
  veryHigh: "bg-red-500/20 text-red-400",
};

export type SkyPhotoAnalyzerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Open state is lifted to the parent toolbar so it can close this panel
// whenever a sibling popup opens — same controlled pattern the rest of the
// toolbar's popups use. Rendered as a centered modal (like
// LocationHistoryPanel's compare view) rather than a corner-docked dropdown,
// since its content (a full photo preview + result card) is too tall/wide to
// dock cleanly against a toolbar button near the top-right corner.
export default function SkyPhotoAnalyzer({ open, onOpenChange }: SkyPhotoAnalyzerProps) {
  const t = useTranslations("skyPhotoAnalyzer");
  const tSeverity = useTranslations("skyPhotoAnalyzer.severity");
  const tBortleDesc = useTranslations("dataLabels.bortleDescriptions");
  const [state, setState] = useState<AnalysisState>({ status: "idle" });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setState({ status: "analyzing" });
    computeAverageBrightness(file)
      .then((avg) => setState({ status: "done", result: estimateFromPhotoBrightness(avg) }))
      .catch(() => setState({ status: "error" }));
  };

  const reset = () => {
    setState({ status: "idle" });
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label={t("openAria")}
        className={`flex items-center justify-center rounded-md border border-white/10 p-2 text-zinc-100 shadow-lg backdrop-blur hover:bg-zinc-800 ${
          open ? "bg-zinc-800" : "bg-zinc-900/90"
        }`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M4 6.75A1.75 1.75 0 0 1 5.75 5h1.1a1 1 0 0 0 .87-.5l.4-.69A1.5 1.5 0 0 1 9.41 3h1.18a1.5 1.5 0 0 1 1.3.75l.4.7a1 1 0 0 0 .87.5h1.09A1.75 1.75 0 0 1 16 6.75v6.5A1.75 1.75 0 0 1 14.25 15h-8.5A1.75 1.75 0 0 1 4 13.25v-6.5Z" />
          <circle cx="10" cy="10" r="2.6" fill="#18181b" />
        </svg>
      </button>

      {!open && (
        <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {t("title")}
        </span>
      )}

      {open && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4" onClick={() => onOpenChange(false)}>
          <div
            className="w-full max-w-sm overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 text-sm text-zinc-100 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 className="flex items-center gap-2 font-medium">
                <span aria-hidden="true">📷</span> {t("title")}
              </h2>
              <button type="button" onClick={() => onOpenChange(false)} aria-label={t("closeAria")} className="text-zinc-400 hover:text-zinc-100">
                ✕
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-4">
              {state.status === "idle" && (
                <>
                  <ul className="mb-3 list-inside list-disc space-y-0.5 text-xs text-zinc-400">
                    <li>{t("tipZenith")}</li>
                    <li>{t("tipClearSky")}</li>
                    <li>{t("tipAutoMode")}</li>
                  </ul>
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer rounded-md border border-white/10 bg-zinc-800/80 px-3 py-2 text-center text-xs hover:bg-zinc-800">
                      {t("takePhoto")}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                    </label>
                    <label className="flex-1 cursor-pointer rounded-md border border-white/10 bg-zinc-800/80 px-3 py-2 text-center text-xs hover:bg-zinc-800">
                      {t("choosePhoto")}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                    </label>
                  </div>
                </>
              )}

              {state.status !== "idle" && previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- local blob: URL from an on-device file, not a static/remote asset next/image can optimize
                <img src={previewUrl} alt="" className="mb-3 max-h-56 w-full rounded-md object-cover" />
              )}

              {state.status === "analyzing" && <div className="text-center text-xs text-zinc-400">{t("analyzing")}</div>}
              {state.status === "error" && <div className="text-center text-xs text-rose-400">{t("error")}</div>}

              {state.status === "done" &&
                (() => {
                  const { result } = state;
                  const tier = bortleSeverityTier(result.bortleClass);
                  const gradientPosition = ((result.bortleClass - 1) / 8) * 100;
                  return (
                    <div>
                      <div className="rounded-md border border-white/10 bg-zinc-950/40 p-3 text-center">
                        <div className="text-xs text-zinc-400">{t("estimatedBortleLabel")}</div>
                        <div className="mt-1 flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-sky-400">{result.bortleClass}</span>
                          <span className="text-sm text-zinc-500">/9</span>
                        </div>

                        <div
                          className="relative mt-3 h-2 rounded-full"
                          style={{ background: "linear-gradient(90deg, #10b981, #14b8a6, #eab308, #f97316, #ef4444)" }}
                        >
                          <div
                            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-zinc-900"
                            style={{ left: `${gradientPosition}%` }}
                          />
                        </div>

                        <div className="mt-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${SEVERITY_BADGE_CLASSES[tier]}`}>
                            {tSeverity(tier)}
                          </span>
                        </div>

                        <p className="mt-2 text-xs leading-relaxed text-zinc-400">{tBortleDesc(String(result.bortleClass))}</p>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-sm font-semibold">{result.sqm.toFixed(2)}</div>
                          <div className="text-[10px] text-zinc-500">{t("referenceSqmLabel")}</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{Math.round((result.avgBrightness / 255) * 100)}%</div>
                          <div className="text-[10px] text-zinc-500">{t("avgBrightnessLabel")}</div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold">
                            {STAR_COUNT_ESTIMATES[result.bortleClass].min}–{STAR_COUNT_ESTIMATES[result.bortleClass].max}
                          </div>
                          <div className="text-[10px] text-zinc-500">{t("visibleStarsLabel")}</div>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-2 text-[10px] leading-relaxed text-amber-200">
                        <span aria-hidden="true">⚠️</span>
                        <span>{t("disclaimer")}</span>
                      </div>

                      <button
                        type="button"
                        onClick={reset}
                        className="mt-3 w-full rounded-md border border-white/10 bg-zinc-800/80 py-2 text-xs hover:bg-zinc-800"
                      >
                        {t("reanalyze")}
                      </button>
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
