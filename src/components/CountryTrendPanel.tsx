"use client";

import { useTranslations } from "next-intl";
import type { CountryTrendResponse } from "@/app/api/country-trend/route";
import { computeSkyBackgroundRatio } from "@/lib/locationHistory";
import { COLOR_STYLES, paletteToBortleSwatches } from "@/lib/colorStyles";

export type CountryTrendPanelProps = {
  data: CountryTrendResponse;
  darkestSqm: number;
};

const CHART_WIDTH = 280;
const CHART_HEIGHT = 70;
// Same SQM 16-22 bounds bortle.ts itself classifies against, so this chart's
// vertical scale reads consistently with every other SQM number in the app.
const SQM_MIN = 16;
const SQM_MAX = 22;

function sqmToY(sqm: number): number {
  const clamped = Math.min(Math.max(sqm, SQM_MIN), SQM_MAX);
  return CHART_HEIGHT * (1 - (clamped - SQM_MIN) / (SQM_MAX - SQM_MIN));
}

// Same swatches the "Classic" map style's Bortle legend already uses, so a
// given Bortle class reads as the same color everywhere in the app.
const BORTLE_SWATCHES = paletteToBortleSwatches(COLOR_STYLES.classic.palette);

export default function CountryTrendPanel({ data, darkestSqm }: CountryTrendPanelProps) {
  const t = useTranslations("countryTrend");
  const { trend, bortleDistribution } = data;
  const latest = trend[trend.length - 1];
  const earliest = trend[0];
  const bortleLe4Percent = bortleDistribution
    .filter((b) => b.bortleClass <= 4)
    .reduce((sum, b) => sum + b.percent, 0);

  const linePoints = trend
    .map((p, i) => `${(i / (trend.length - 1 || 1)) * CHART_WIDTH},${sqmToY(p.avgSqm)}`)
    .join(" ");
  const areaPoints = `0,${CHART_HEIGHT} ${linePoints} ${CHART_WIDTH},${CHART_HEIGHT}`;

  const maxBortlePercent = Math.max(...bortleDistribution.map((b) => b.percent), 1);

  const tiles: Array<{ label: string; value: string }> = [
    { label: t("latestYearLabel"), value: String(latest.year) },
    { label: t("latestSqmLabel"), value: latest.avgSqm.toFixed(2) },
    { label: t("latestRatioLabel"), value: `${computeSkyBackgroundRatio(darkestSqm, latest.avgSqm).toFixed(1)}×` },
    { label: t("bortleLe4Label"), value: `${bortleLe4Percent.toFixed(1)}%` },
    { label: t("yearSpanLabel"), value: t("yearSpanValue", { startYear: earliest.year, endYear: latest.year }) },
    { label: t("latestPixelsLabel"), value: latest.pixelCount.toLocaleString() },
  ];

  return (
    <div className="rounded-md border border-white/10 bg-zinc-950/40 p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-md border border-white/5 bg-white/5 px-2 py-1.5">
            <div className="text-[10px] text-zinc-500">{tile.label}</div>
            <div className="text-sm tabular-nums text-zinc-100">{tile.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <div className="mb-1 text-xs text-zinc-400">{t("chartTitle", { startYear: earliest.year, endYear: latest.year })}</div>
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full" role="img" aria-label={t("chartAriaLabel")}>
          <defs>
            <linearGradient id="country-sqm-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#country-sqm-gradient)" />
          <polyline points={linePoints} fill="none" stroke="#34d399" strokeWidth={1.5} />
          {trend.map((p, i) => (
            <circle key={p.year} cx={(i / (trend.length - 1 || 1)) * CHART_WIDTH} cy={sqmToY(p.avgSqm)} r={1.5} className="fill-emerald-300">
              <title>{`${p.year}: ${p.avgSqm.toFixed(2)}`}</title>
            </circle>
          ))}
        </svg>
        <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
          <span>{earliest.year}</span>
          <span>{latest.year}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 text-xs text-zinc-400">{t("distributionTitle", { year: latest.year })}</div>
        <div className="space-y-1">
          {bortleDistribution.map((b) => (
            <div key={b.bortleClass} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-[10px] tabular-nums text-zinc-500">{t("bortleClassAbbrev", { bortleClass: b.bortleClass })}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-sm bg-white/5">
                <div
                  className="h-full rounded-sm"
                  style={{ width: `${(b.percent / maxBortlePercent) * 100}%`, backgroundColor: `#${BORTLE_SWATCHES[b.bortleClass - 1]}` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-zinc-400">{b.percent.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-zinc-500">{t("methodologyNote")}</p>
    </div>
  );
}
