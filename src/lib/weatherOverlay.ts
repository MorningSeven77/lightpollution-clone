export type WeatherOverlayId = "none" | "clouds" | "rain";

export type WeatherOverlayDef = {
  id: WeatherOverlayId;
  label: string;
  // OpenWeatherMap's own tile layer name, proxied via /api/weather-tiles.
  // null for "none", which just hides the layer instead of fetching anything.
  owmLayer: string | null;
};

export const WEATHER_OVERLAYS: Record<WeatherOverlayId, WeatherOverlayDef> = {
  none: { id: "none", label: "无/隐藏", owmLayer: null },
  clouds: { id: "clouds", label: "云层", owmLayer: "clouds_new" },
  rain: { id: "rain", label: "降水", owmLayer: "precipitation_new" },
};

export const DEFAULT_WEATHER_OVERLAY: WeatherOverlayId = "none";

export function isWeatherOverlayId(value: string | null): value is WeatherOverlayId {
  return !!value && value in WEATHER_OVERLAYS;
}
