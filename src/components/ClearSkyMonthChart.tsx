import { useLocale, useTranslations } from "next-intl";

export type MonthlyClearNights = { month: number; percentClear: number | null };

const WIDTH = 320;
const HEIGHT = 90;
const BAR_GAP = 3;

export type ClearSkyMonthChartProps = {
  monthly: MonthlyClearNights[];
};

export default function ClearSkyMonthChart({ monthly }: ClearSkyMonthChartProps) {
  const t = useTranslations("clearSkyMap");
  const locale = useLocale();

  const sorted = [...monthly].sort((a, b) => a.month - b.month);
  const barWidth = WIDTH / sorted.length - BAR_GAP;

  const known = sorted.filter((m): m is { month: number; percentClear: number } => m.percentClear !== null);
  const best = known.length > 0 ? known.reduce((max, m) => (m.percentClear > max.percentClear ? m : max)) : null;
  const worst = known.length > 0 ? known.reduce((min, m) => (m.percentClear < min.percentClear ? m : min)) : null;

  const monthLabel = (month: number) =>
    new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(2000, month - 1, 1));

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT + 16}`} className="w-full">
        {sorted.map((m, i) => {
          const x = i * (barWidth + BAR_GAP);
          const percent = m.percentClear ?? 0;
          const barHeight = (percent / 100) * HEIGHT;
          return (
            <g key={m.month}>
              <rect
                x={x}
                y={HEIGHT - barHeight}
                width={barWidth}
                height={barHeight}
                fill={m.percentClear === null ? "#3f3f46" : "#38bdf8"}
                fillOpacity={m.percentClear === null ? 0.3 : 0.75}
                rx={1.5}
              />
              <text x={x + barWidth / 2} y={HEIGHT + 12} textAnchor="middle" className="fill-zinc-500 text-[8px]">
                {monthLabel(m.month)}
              </text>
            </g>
          );
        })}
      </svg>

      {best && worst && (
        <div className="mt-1 space-y-0.5 text-[10px] text-zinc-400">
          <div>
            {t("bestMonthLabel")}: {t("monthStat", { month: monthLabel(best.month), percent: best.percentClear })}
          </div>
          <div>
            {t("worstMonthLabel")}: {t("monthStat", { month: monthLabel(worst.month), percent: worst.percentClear })}
          </div>
        </div>
      )}
    </div>
  );
}
