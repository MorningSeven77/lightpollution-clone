"use client";

import { useTranslations } from "next-intl";
import { TrendPoint } from "@/app/api/trend/route";

export type TrendChartProps = {
  points: TrendPoint[];
  // A trend-extrapolated point for a year the real satellite composite isn't
  // published for yet (see src/lib/trendEstimate.ts). Rendered as a visually
  // distinct bar so it never reads as an additional real data point.
  estimatedPoint?: TrendPoint | null;
};

const CHART_WIDTH = 260;
const CHART_HEIGHT = 60;
const BAR_GAP = 2;

export default function TrendChart({ points, estimatedPoint }: TrendChartProps) {
  const t = useTranslations("trendChart");
  if (points.length === 0) return null;

  const allPoints = estimatedPoint ? [...points, estimatedPoint] : points;
  const sqmValues = allPoints.map((p) => p.sqm);
  const minSqm = Math.min(...sqmValues);
  const maxSqm = Math.max(...sqmValues);
  // Guard against a flat line (all years identical) collapsing every bar to
  // the same height — give it some visible height instead of nothing.
  const range = maxSqm - minSqm || 1;

  const barWidth = (CHART_WIDTH - BAR_GAP * (allPoints.length - 1)) / allPoints.length;

  return (
    <div>
      <div className="mb-1 text-xs text-zinc-400">
        {t("title", { startYear: points[0].year, endYear: points[points.length - 1].year })}
      </div>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full" role="img" aria-label={t("ariaLabel")}>
        {allPoints.map((point, i) => {
          const isEstimated = estimatedPoint != null && i === allPoints.length - 1;
          // Higher SQM (darker sky) reads as a taller bar.
          const heightRatio = 0.15 + 0.85 * ((point.sqm - minSqm) / range);
          const barHeight = CHART_HEIGHT * heightRatio;
          const x = i * (barWidth + BAR_GAP);
          const y = CHART_HEIGHT - barHeight;
          return (
            <rect
              key={point.year}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              className={isEstimated ? "fill-amber-400/50 stroke-amber-300 stroke-[0.5] [stroke-dasharray:2,1.5]" : "fill-emerald-400/70"}
            >
              <title>
                {isEstimated
                  ? t("estimatedTooltip", { year: point.year, sqm: point.sqm.toFixed(2), bortleClass: point.bortleClass })
                  : t("tooltip", { year: point.year, sqm: point.sqm.toFixed(2), bortleClass: point.bortleClass })}
              </title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-zinc-400">
        <span>{allPoints[0].year}</span>
        <span>{estimatedPoint ? t("estimatedYearLabel", { year: estimatedPoint.year }) : allPoints[allPoints.length - 1].year}</span>
      </div>
      {estimatedPoint && <div className="mt-1 text-[10px] leading-relaxed text-zinc-500">{t("estimatedCaption", { year: estimatedPoint.year })}</div>}
    </div>
  );
}
