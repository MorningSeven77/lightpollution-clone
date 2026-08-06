import { WeatherDay } from "@/app/api/weather/route";
import { StargazingScore, StargazingTier } from "@/lib/stargazing";
import { describeWeatherCode } from "@/lib/weather";

export type ScoredWeatherDay = WeatherDay & StargazingScore;

export type WeatherSectionProps = {
  days: ScoredWeatherDay[];
  bortleClass: number;
  sqm: number;
};

const TIER_BADGE_CLASS: Record<StargazingTier, string> = {
  poor: "bg-red-500/20 text-red-400",
  marginal: "bg-amber-500/20 text-amber-400",
  fair: "bg-sky-500/20 text-sky-400",
  good: "bg-emerald-500/20 text-emerald-400",
};

const WEEKDAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

// The API route always requests past_days=1, so index 0 is always
// "yesterday" and index 1 is always "today" — no need to compare against
// today's real date client-side.
function formatDayLabel(dateStr: string, index: number): string {
  if (index === 0) return "昨天";
  if (index === 1) return "今天";
  const date = new Date(`${dateStr}T00:00:00`);
  const [, month, day] = dateStr.split("-");
  return `${WEEKDAY_LABELS[date.getDay()]} ${Number(month)}/${Number(day)}`;
}

export default function WeatherSection({ days, bortleClass, sqm }: WeatherSectionProps) {
  if (days.length === 0) return null;

  // Only present/future nights are candidates for "best observing night" —
  // you can't plan to observe on a night that's already passed.
  const upcoming = days.slice(1);
  const bestNight = upcoming.reduce((best, d) => (d.score > best.score ? d : best), upcoming[0]);
  const bestNightIndex = days.indexOf(bestNight);

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <div className="mb-2 text-xs font-medium text-zinc-300">夜间天气</div>

      <div className="mb-3 rounded border border-white/10 bg-zinc-800/50 p-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">最佳观测夜</div>
            <div className="text-sm font-medium">
              {formatDayLabel(bestNight.date, bestNightIndex)} · {bestNight.tierLabel}
            </div>
          </div>
          <div className={`rounded px-2 py-1 text-center text-xs font-semibold ${TIER_BADGE_CLASS[bestNight.tier]}`}>
            {bestNight.score}
            <div className="text-[10px] font-normal">分</div>
          </div>
        </div>
        <div className="mt-1 text-xs text-zinc-400">{bestNight.constraint}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-300">
            云量 {bestNight.nightCloudCoverPercent}%
          </span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-300">
            月光 {bestNight.moonIlluminationPercent}%
          </span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-300">
            SQM {sqm.toFixed(2)} · B{bortleClass}
          </span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((day, i) => {
          const weather = describeWeatherCode(day.weatherCode);
          const isPast = i === 0;
          return (
            <div key={day.date} className="w-24 shrink-0 rounded border border-white/10 bg-zinc-800/50 p-2 text-xs">
              <div className="text-zinc-400">{formatDayLabel(day.date, i)}</div>
              <div className="mt-1 text-lg">{weather.emoji}</div>
              <div className="text-[10px] text-zinc-300">{weather.label}</div>
              <div className={`mt-1 inline-block rounded px-1 text-[10px] ${TIER_BADGE_CLASS[day.tier]}`}>
                {i === bestNightIndex ? `最佳 ${day.score}` : `${day.score} ${day.tierLabel}`}
              </div>
              <div className="mt-1 font-medium">
                {isPast ? `${Math.round(day.tempMaxC)}°C` : `${Math.round(day.tempMinC)}-${Math.round(day.tempMaxC)}°C`}
              </div>
              <div className="mt-1 text-[10px] text-zinc-400">
                💧 {day.humidityMinPercent}-{day.humidityMaxPercent}%
              </div>
              <div className="text-[10px] text-zinc-400">🌙 {day.moonIlluminationPercent}%</div>
              <div className="text-[10px] text-zinc-400">👁 {day.visibilityKm}km</div>
            </div>
          );
        })}
      </div>

      <div className="mt-1 text-right text-[10px] text-zinc-500">天气数据来自 Open-Meteo</div>
    </div>
  );
}
