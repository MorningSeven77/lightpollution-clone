export type WeatherOverlayId = "none" | "clouds" | "rain";

// Text labels live in src/lib/i18n/translations.ts (dataLabels.weatherOverlays)
// so this module stays language-agnostic.
export type WeatherOverlayDef = {
  id: WeatherOverlayId;
  // OpenWeatherMap's own tile layer name, proxied via /api/weather-tiles.
  // null for "none", which just hides the layer instead of fetching anything.
  owmLayer: string | null;
};

export const WEATHER_OVERLAYS: Record<WeatherOverlayId, WeatherOverlayDef> = {
  none: { id: "none", owmLayer: null },
  clouds: { id: "clouds", owmLayer: "clouds_new" },
  rain: { id: "rain", owmLayer: "precipitation_new" },
};

export const DEFAULT_WEATHER_OVERLAY: WeatherOverlayId = "none";

export function isWeatherOverlayId(value: string | null): value is WeatherOverlayId {
  return !!value && value in WEATHER_OVERLAYS;
}
