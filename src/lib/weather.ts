// WMO weather interpretation codes -> emoji. Only covers the codes
// Open-Meteo's forecast actually returns, not the full WMO table. Text
// labels live in messages/{locale}.json (dataLabels.weatherCodes) so this
// module stays language-agnostic.
export const WMO_WEATHER_EMOJI: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌦️",
  56: "🌧️",
  57: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  66: "🌧️",
  67: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "🌨️",
  77: "🌨️",
  80: "🌦️",
  81: "🌧️",
  82: "🌧️",
  85: "🌨️",
  86: "🌨️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

export function getWeatherEmoji(code: number): string {
  return WMO_WEATHER_EMOJI[code] ?? "❓";
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
