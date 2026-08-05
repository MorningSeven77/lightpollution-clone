import { TrendPoint } from "@/app/api/trend/route";

export type TrendChartProps = {
  points: TrendPoint[];
};

const CHART_WIDTH = 260;
const CHART_HEIGHT = 60;
const BAR_GAP = 2;

export default function TrendChart({ points }: TrendChartProps) {
  if (points.length === 0) return null;

  const sqmValues = points.map((p) => p.sqm);
  const minSqm = Math.min(...sqmValues);
  const maxSqm = Math.max(...sqmValues);
  // Guard against a flat line (all years identical) collapsing every bar to
  // the same height — give it some visible height instead of nothing.
  const range = maxSqm - minSqm || 1;

  const barWidth = (CHART_WIDTH - BAR_GAP * (points.length - 1)) / points.length;

  return (
    <div>
      <div className="mb-1 text-xs text-zinc-400">
        光害趋势（{points[0].year}-{points[points.length - 1].year}，SQM 越高越暗）
      </div>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full" role="img" aria-label="历年 SQM 趋势柱状图">
        {points.map((point, i) => {
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
              className="fill-emerald-400/70"
            >
              <title>
                {point.year} 年：SQM ≈ {point.sqm.toFixed(2)}，Bortle {point.bortleClass}
              </title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-zinc-400">
        <span>{points[0].year}</span>
        <span>{points[points.length - 1].year}</span>
      </div>
    </div>
  );
}
