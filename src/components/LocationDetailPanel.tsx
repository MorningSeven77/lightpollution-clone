"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { STAR_COUNT_ESTIMATES } from "@/lib/bortle";
import { SelectedLocation } from "@/components/Map";
import TrendChart from "@/components/TrendChart";
import { TrendPoint } from "@/app/api/trend/route";
import { WeatherDay } from "@/app/api/weather/route";
import WeatherSection, { ScoredWeatherDay } from "@/components/WeatherSection";
import { computeStargazingScore } from "@/lib/stargazing";
import DirectionalSkyBrightnessChart from "@/components/DirectionalSkyBrightnessChart";
import type { DirectionalBrightnessPoint } from "@/app/api/directional-sky-brightness/route";
import ExposureCalculator from "@/components/ExposureCalculator";
import BestSpotsPanel from "@/components/BestSpotsPanel";
import { addLocationHistoryEntry } from "@/lib/locationHistory";
import type { RankedSpot } from "@/lib/bestSpots";

export type LocationDetailPanelProps = {
  location: SelectedLocation | null;
  onClose: () => void;
  onBestSpotsFound: (spots: RankedSpot[]) => void;
};

type PointValueState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; bortleClass: number; sqm: number };

type PlaceNameState = { status: "loading" } | { status: "error" } | { status: "done"; name: string | null };

type TrendState = { status: "loading" } | { status: "error" } | { status: "done"; points: TrendPoint[] };

type WeatherState = { status: "loading" } | { status: "error" } | { status: "done"; days: WeatherDay[] };

type ClearNightsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; month: number; yearsSampled: number; percentClear: number | null };

type DirectionalBrightnessState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; directions: DirectionalBrightnessPoint[]; darkest: DirectionalBrightnessPoint; brightest: DirectionalBrightnessPoint };

export default function LocationDetailPanel({ location, onClose, onBestSpotsFound }: LocationDetailPanelProps) {
  if (!location) return null;

  // Remounts the panel (resetting state to its initial "loading" values)
  // whenever a genuinely different point is selected, instead of an effect
  // reaching back to reset state on every location change.
  return (
    <LocationDetailPanelContent
      key={`${location.lat},${location.lng}`}
      location={location}
      onClose={onClose}
      onBestSpotsFound={onBestSpotsFound}
    />
  );
}

function LocationDetailPanelContent({
  location,
  onClose,
  onBestSpotsFound,
}: {
  location: SelectedLocation;
  onClose: () => void;
  onBestSpotsFound: (spots: RankedSpot[]) => void;
}) {
  const [pointValue, setPointValue] = useState<PointValueState>({ status: "loading" });
  const [placeName, setPlaceName] = useState<PlaceNameState>({ status: "loading" });
  const [trend, setTrend] = useState<TrendState>({ status: "loading" });
  const [weather, setWeather] = useState<WeatherState>({ status: "loading" });
  const [clearNights, setClearNights] = useState<ClearNightsState>({ status: "loading" });
  const [directionalBrightness, setDirectionalBrightness] = useState<DirectionalBrightnessState>({ status: "loading" });
  const t = useTranslations("locationDetail");
  const tDirectionalBrightness = useTranslations("directionalSkyBrightness");
  const tBortleDescriptions = useTranslations("dataLabels.bortleDescriptions");
  const locale = useLocale();

  // AbortController-backed so React Strict Mode's dev-only double-invoke of
  // this effect (mount -> cleanup -> mount again) cancels the first fetch
  // instead of leaving two real in-flight requests racing each other — the
  // slower one failing could otherwise clobber a perfectly good result.
  const fetchPointValue = useCallback((lat: number, lng: number, signal: AbortSignal) => {
    fetch(`/api/point-value?lat=${lat}&lng=${lng}`, { signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("point-value request failed");
        const data = (await res.json()) as { bortleClass: number; sqm: number };
        setPointValue({ status: "done", bortleClass: data.bortleClass, sqm: data.sqm });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setPointValue({ status: "error" });
      });
  }, []);

  const fetchPlaceName = useCallback((lat: number, lng: number, signal: AbortSignal) => {
    fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`, { signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("reverse-geocode request failed");
        const data = (await res.json()) as { displayName: string | null };
        setPlaceName({ status: "done", name: data.displayName });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setPlaceName({ status: "error" });
      });
  }, []);

  const fetchTrend = useCallback((lat: number, lng: number, signal: AbortSignal) => {
    fetch(`/api/trend?lat=${lat}&lng=${lng}`, { signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("trend request failed");
        const data = (await res.json()) as { points: TrendPoint[] };
        setTrend({ status: "done", points: data.points });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setTrend({ status: "error" });
      });
  }, []);

  const fetchWeather = useCallback((lat: number, lng: number, signal: AbortSignal) => {
    fetch(`/api/weather?lat=${lat}&lng=${lng}`, { signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("weather request failed");
        const data = (await res.json()) as { days: WeatherDay[] };
        setWeather({ status: "done", days: data.days });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setWeather({ status: "error" });
      });
  }, []);

  const fetchClearNights = useCallback((lat: number, lng: number, signal: AbortSignal) => {
    fetch(`/api/clear-nights?lat=${lat}&lng=${lng}`, { signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("clear-nights request failed");
        const data = (await res.json()) as { month: number; yearsSampled: number; percentClear: number | null };
        setClearNights({ status: "done", ...data });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setClearNights({ status: "error" });
      });
  }, []);

  const fetchDirectionalBrightness = useCallback((lat: number, lng: number, signal: AbortSignal) => {
    fetch(`/api/directional-sky-brightness?lat=${lat}&lng=${lng}`, { signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("directional-sky-brightness request failed");
        const data = (await res.json()) as {
          directions: DirectionalBrightnessPoint[];
          darkest: DirectionalBrightnessPoint;
          brightest: DirectionalBrightnessPoint;
        };
        setDirectionalBrightness({ status: "done", ...data });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setDirectionalBrightness({ status: "error" });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPointValue(location.lat, location.lng, controller.signal);
    fetchPlaceName(location.lat, location.lng, controller.signal);
    fetchTrend(location.lat, location.lng, controller.signal);
    fetchWeather(location.lat, location.lng, controller.signal);
    fetchClearNights(location.lat, location.lng, controller.signal);
    fetchDirectionalBrightness(location.lat, location.lng, controller.signal);
    return () => controller.abort();
  }, [location, fetchPointValue, fetchPlaceName, fetchTrend, fetchWeather, fetchClearNights, fetchDirectionalBrightness]);

  // Records one history entry per selected point, once both the Bortle/SQM
  // value and place name have settled (name may still end up null/unknown —
  // that's fine, still worth recording). The `key`-based remount above means
  // this effect only ever sees one "done" transition per selection, but the
  // ref guards against it firing twice anyway (e.g. if placeName resolves
  // after an unrelated re-render).
  const hasRecordedHistoryRef = useRef(false);
  useEffect(() => {
    if (hasRecordedHistoryRef.current) return;
    if (pointValue.status !== "done" || placeName.status === "loading") return;
    hasRecordedHistoryRef.current = true;
    addLocationHistoryEntry({
      lat: location.lat,
      lng: location.lng,
      placeName: placeName.status === "done" ? placeName.name : null,
      bortleClass: pointValue.bortleClass,
      sqm: pointValue.sqm,
    });
  }, [location, pointValue, placeName]);

  // Combines once both independent fetches land — the weather API returns
  // raw data only (no score) so it never has to wait on pointValue first.
  const scoredWeatherDays: ScoredWeatherDay[] = useMemo(() => {
    if (pointValue.status !== "done" || weather.status !== "done") return [];
    return weather.days.map((day) => ({
      ...day,
      ...computeStargazingScore({
        nightCloudCoverPercent: day.nightCloudCoverPercent,
        moonIlluminationPercent: day.moonIlluminationPercent,
        bortleClass: pointValue.bortleClass,
      }),
    }));
  }, [pointValue, weather]);

  const retryPointValue = () => {
    setPointValue({ status: "loading" });
    fetchPointValue(location.lat, location.lng, new AbortController().signal);
  };

  const clearNightsMonthLabel =
    clearNights.status === "done"
      ? new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(2000, clearNights.month - 1, 1))
      : "";

  const placeNameText =
    placeName.status === "loading"
      ? t("loadingPlaceName")
      : placeName.status === "done"
        ? (placeName.name ?? t("unknownPlace"))
        : t("unknownPlace");

  return (
    <div className="absolute left-4 top-20 z-10 max-h-[80vh] w-full max-w-xs overflow-y-auto rounded-md border border-white/10 bg-zinc-900/90 p-3 text-sm text-zinc-100 shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-medium">{t("title")}</h2>
        <button type="button" onClick={onClose} aria-label={t("closeAria")} className="text-zinc-400 hover:text-zinc-100">
          ✕
        </button>
      </div>

      <div className="mb-2 text-xs text-zinc-400">
        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
      </div>
      <div className="mb-3 text-xs">{placeNameText}</div>

      {pointValue.status === "loading" && <div className="text-zinc-400">{t("loading")}</div>}

      {pointValue.status === "error" && (
        <div>
          <div className="mb-2 text-red-400">{t("errorText")}</div>
          <button
            type="button"
            onClick={retryPointValue}
            className="rounded border border-white/10 px-2 py-1 text-xs hover:bg-zinc-800"
          >
            {t("retry")}
          </button>
        </div>
      )}

      {pointValue.status === "done" && (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{pointValue.bortleClass}</span>
            <span className="text-xs text-zinc-400">
              {t("bortleUnitLabel", { desc: tBortleDescriptions(String(pointValue.bortleClass)) })}
            </span>
          </div>
          <div className="mt-1 text-xs text-zinc-400">{t("sqmLabel", { n: pointValue.sqm.toFixed(2) })}</div>
          {STAR_COUNT_ESTIMATES[pointValue.bortleClass] && (
            <div className="mt-1 text-xs text-zinc-400">
              {t("starEstimate", {
                min: STAR_COUNT_ESTIMATES[pointValue.bortleClass].min,
                max: STAR_COUNT_ESTIMATES[pointValue.bortleClass].max,
              })}
            </div>
          )}

          {directionalBrightness.status === "loading" && (
            <div className="mt-3 text-xs text-zinc-400">{tDirectionalBrightness("loading")}</div>
          )}
          {directionalBrightness.status === "done" && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <h3 className="mb-2 text-xs font-medium text-zinc-300">{tDirectionalBrightness("title")}</h3>
              <DirectionalSkyBrightnessChart
                directions={directionalBrightness.directions}
                darkest={directionalBrightness.darkest}
                brightest={directionalBrightness.brightest}
              />
            </div>
          )}
          {/* Same "stays quiet on failure" treatment as the other optional sections. */}

          {trend.status === "loading" && <div className="mt-3 text-xs text-zinc-400">{t("trendLoading")}</div>}
          {trend.status === "done" && (
            <div className="mt-3">
              <TrendChart points={trend.points} />
            </div>
          )}
          {/* A missing trend chart isn't worth a visible error — the Bortle/SQM
              numbers above are the data that matters, so this just stays quiet. */}

          {weather.status === "loading" && <div className="mt-3 text-xs text-zinc-400">{t("weatherLoading")}</div>}
          {scoredWeatherDays.length > 0 && (
            <WeatherSection days={scoredWeatherDays} bortleClass={pointValue.bortleClass} sqm={pointValue.sqm} />
          )}
          {/* Same "stays quiet on failure" treatment as the trend chart above. */}

          {clearNights.status === "loading" && <div className="mt-3 text-xs text-zinc-400">{t("clearNightsLoading")}</div>}
          {clearNights.status === "done" && clearNights.percentClear !== null && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-zinc-400">{t("clearNightsLabel", { month: clearNightsMonthLabel })}</span>
                <span className="text-lg font-medium">{t("clearNightsValue", { percent: clearNights.percentClear })}</span>
              </div>
              <div className="mt-1 text-[10px] leading-relaxed text-zinc-500">
                {t("clearNightsCaption", { month: clearNightsMonthLabel, years: clearNights.yearsSampled })}
              </div>
            </div>
          )}
          {/* Same "stays quiet on failure" treatment as the other optional sections. */}

          <ExposureCalculator sqm={pointValue.sqm} />

          <BestSpotsPanel lat={location.lat} lng={location.lng} onResults={onBestSpotsFound} />
        </div>
      )}
    </div>
  );
}
