export type WmoWeatherInfo = { emoji: string; label: string };

// WMO weather interpretation codes -> {emoji, 中文简述}. Only covers the
// codes Open-Meteo's forecast actually returns, not the full WMO table.
export const WMO_WEATHER_CODES: Record<number, WmoWeatherInfo> = {
  0: { emoji: "☀️", label: "晴朗" },
  1: { emoji: "🌤️", label: "大部晴朗" },
  2: { emoji: "⛅", label: "局部多云" },
  3: { emoji: "☁️", label: "阴天" },
  45: { emoji: "🌫️", label: "有雾" },
  48: { emoji: "🌫️", label: "有雾" },
  51: { emoji: "🌦️", label: "毛毛雨" },
  53: { emoji: "🌦️", label: "毛毛雨" },
  55: { emoji: "🌦️", label: "毛毛雨" },
  56: { emoji: "🌧️", label: "冻雨" },
  57: { emoji: "🌧️", label: "冻雨" },
  61: { emoji: "🌧️", label: "降雨" },
  63: { emoji: "🌧️", label: "降雨" },
  65: { emoji: "🌧️", label: "强降雨" },
  66: { emoji: "🌧️", label: "冻雨" },
  67: { emoji: "🌧️", label: "冻雨" },
  71: { emoji: "🌨️", label: "降雪" },
  73: { emoji: "🌨️", label: "降雪" },
  75: { emoji: "🌨️", label: "强降雪" },
  77: { emoji: "🌨️", label: "米雪" },
  80: { emoji: "🌦️", label: "阵雨" },
  81: { emoji: "🌧️", label: "阵雨" },
  82: { emoji: "🌧️", label: "强阵雨" },
  85: { emoji: "🌨️", label: "阵雪" },
  86: { emoji: "🌨️", label: "强阵雪" },
  95: { emoji: "⛈️", label: "雷暴" },
  96: { emoji: "⛈️", label: "雷暴伴冰雹" },
  99: { emoji: "⛈️", label: "雷暴伴冰雹" },
};

export function describeWeatherCode(code: number): WmoWeatherInfo {
  return WMO_WEATHER_CODES[code] ?? { emoji: "❓", label: "未知天气" };
}

// Open-Meteo's `moon_phase` is a 0-1 position in the synodic cycle (0/1 = new
// moon, 0.5 = full moon), not illumination directly — illuminated fraction
// follows the standard cosine relationship to phase angle.
export function moonPhaseToIlluminationPercent(phaseFraction: number): number {
  return Math.round(((1 - Math.cos(2 * Math.PI * phaseFraction)) / 2) * 100);
}

function addCalendarDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d) + days * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}

// "The night of date D" spans from D's evening through D+1's early morning.
// Open-Meteo's hourly `is_day` flag is 0 for both halves, so this buckets
// each is_day=0 hour into whichever night it astronomically belongs to:
// hours 00-11 of a date belong to the *previous* date's night (its second
// half), hours 12-23 belong to that date's own night (its first half).
// The very last date in the requested hourly range will be missing its
// second half (the data simply doesn't extend that far) — a known, accepted
// simplification rather than a bug.
export function nightCloudCoverByDate(
  hourlyTime: string[],
  hourlyCloudCover: number[],
  hourlyIsDay: number[],
): Record<string, number> {
  const buckets: Record<string, number[]> = {};

  for (let i = 0; i < hourlyTime.length; i++) {
    if (hourlyIsDay[i] !== 0) continue;
    const [datePart, timePart] = hourlyTime[i].split("T");
    const hour = Number(timePart.split(":")[0]);
    const nightDate = hour <= 11 ? addCalendarDays(datePart, -1) : datePart;
    (buckets[nightDate] ??= []).push(hourlyCloudCover[i]);
  }

  const averages: Record<string, number> = {};
  for (const [date, values] of Object.entries(buckets)) {
    averages[date] = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
  }
  return averages;
}
