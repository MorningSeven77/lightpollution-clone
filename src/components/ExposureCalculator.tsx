"use client";

import { useMemo, useState } from "react";
import { CAMERA_PRESETS, DEFAULT_CAMERA_PRESET_ID, computeExposure } from "@/lib/exposureCalculator";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type ExposureCalculatorProps = { sqm: number };

const DEFAULT_FOCAL_RATIO = 5;
const ALLOWED_READ_NOISE_PERCENT = 5;
const OPTICS_TRANSMISSION_PERCENT = 80;
const MAX_SUB_SECONDS = 300;

function formatDuration(seconds: number): string {
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  if (seconds < 10) return `${seconds.toFixed(1)} s`;
  return `${Math.round(seconds)} s`;
}

export default function ExposureCalculator({ sqm }: ExposureCalculatorProps) {
  const [presetId, setPresetId] = useState(DEFAULT_CAMERA_PRESET_ID);
  const [focalRatio, setFocalRatio] = useState(DEFAULT_FOCAL_RATIO);
  const { t } = useLanguage();

  const preset = CAMERA_PRESETS.find((p) => p.id === presetId) ?? CAMERA_PRESETS[0];

  const result = useMemo(
    () =>
      computeExposure({
        sqm,
        focalRatio,
        pixelSizeUm: preset.pixelSizeUm,
        readNoiseE: preset.readNoiseE,
        sensorQePercent: preset.sensorQePercent,
        darkCurrentEPerPxPerS: preset.darkCurrentEPerPxPerS,
        opticsTransmissionPercent: OPTICS_TRANSMISSION_PERCENT,
        allowedReadNoisePercent: ALLOWED_READ_NOISE_PERCENT,
        maxSubExposureSeconds: MAX_SUB_SECONDS,
      }),
    [sqm, focalRatio, preset],
  );

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <div className="mb-2 text-xs font-medium text-zinc-300">{t.exposureCalculator.title}</div>

      <div className="mb-2 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[10px] text-zinc-400">{t.exposureCalculator.cameraTypeLabel}</span>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            className="w-full rounded border border-white/10 bg-zinc-800 px-2 py-1 text-xs"
          >
            {CAMERA_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {t.exposureCalculator.cameraPresets[p.id]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] text-zinc-400">{t.exposureCalculator.focalRatioLabel}</span>
          <input
            type="number"
            min={0.5}
            step={0.1}
            value={focalRatio}
            onChange={(e) => setFocalRatio(Math.max(0.5, Number(e.target.value) || DEFAULT_FOCAL_RATIO))}
            className="w-full rounded border border-white/10 bg-zinc-800 px-2 py-1 text-xs"
          />
        </label>
      </div>

      <div className="rounded border border-white/10 bg-zinc-800/50 p-2">
        <div className="text-xs text-zinc-400">{t.exposureCalculator.recommendedLabel}</div>
        <div className="text-2xl font-semibold">{formatDuration(result.recommendedSubExposureSeconds)}</div>
        {result.cappedByMax && (
          <div className="mt-1 text-[10px] text-zinc-400">{t.exposureCalculator.cappedNote(MAX_SUB_SECONDS)}</div>
        )}
      </div>

      <div className="mt-2 text-[10px] text-zinc-500">
        {t.exposureCalculator.footnote(sqm.toFixed(2), ALLOWED_READ_NOISE_PERCENT)}
      </div>
    </div>
  );
}
