"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BORTLE_DESCRIPTIONS, STAR_COUNT_ESTIMATES } from "@/lib/bortle";
import { SelectedLocation } from "@/components/Map";

export type LocationDetailPanelProps = {
  location: SelectedLocation | null;
  onClose: () => void;
};

type PointValueState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; bortleClass: number; sqm: number };

type PlaceNameState = { status: "loading" } | { status: "error" } | { status: "done"; name: string | null };

export default function LocationDetailPanel({ location, onClose }: LocationDetailPanelProps) {
  if (!location) return null;

  // Remounts the panel (resetting state to its initial "loading" values)
  // whenever a genuinely different point is selected, instead of an effect
  // reaching back to reset state on every location change.
  return <LocationDetailPanelContent key={`${location.lat},${location.lng}`} location={location} onClose={onClose} />;
}

function LocationDetailPanelContent({
  location,
  onClose,
}: {
  location: SelectedLocation;
  onClose: () => void;
}) {
  const [pointValue, setPointValue] = useState<PointValueState>({ status: "loading" });
  const [placeName, setPlaceName] = useState<PlaceNameState>({ status: "loading" });
  const pointValueRequestIdRef = useRef(0);
  const placeNameRequestIdRef = useRef(0);

  const fetchPointValue = useCallback((lat: number, lng: number) => {
    const requestId = ++pointValueRequestIdRef.current;
    fetch(`/api/point-value?lat=${lat}&lng=${lng}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("point-value request failed");
        const data = (await res.json()) as { bortleClass: number; sqm: number };
        if (pointValueRequestIdRef.current !== requestId) return;
        setPointValue({ status: "done", bortleClass: data.bortleClass, sqm: data.sqm });
      })
      .catch(() => {
        if (pointValueRequestIdRef.current !== requestId) return;
        setPointValue({ status: "error" });
      });
  }, []);

  const fetchPlaceName = useCallback((lat: number, lng: number) => {
    const requestId = ++placeNameRequestIdRef.current;
    fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("reverse-geocode request failed");
        const data = (await res.json()) as { displayName: string | null };
        if (placeNameRequestIdRef.current !== requestId) return;
        setPlaceName({ status: "done", name: data.displayName });
      })
      .catch(() => {
        if (placeNameRequestIdRef.current !== requestId) return;
        setPlaceName({ status: "error" });
      });
  }, []);

  useEffect(() => {
    fetchPointValue(location.lat, location.lng);
    fetchPlaceName(location.lat, location.lng);
  }, [location, fetchPointValue, fetchPlaceName]);

  const retryPointValue = () => {
    setPointValue({ status: "loading" });
    fetchPointValue(location.lat, location.lng);
  };

  const placeNameText =
    placeName.status === "loading" ? "查询中…" : placeName.status === "done" ? (placeName.name ?? "未知地点") : "未知地点";

  return (
    <div className="fixed left-4 top-20 z-10 w-full max-w-xs rounded-md border border-white/10 bg-zinc-900/90 p-3 text-sm text-zinc-100 shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">位置详情</span>
        <button type="button" onClick={onClose} aria-label="关闭位置详情" className="text-zinc-400 hover:text-zinc-100">
          ✕
        </button>
      </div>

      <div className="mb-2 text-xs text-zinc-400">
        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
      </div>
      <div className="mb-3 text-xs">{placeNameText}</div>

      {pointValue.status === "loading" && <div className="text-zinc-400">查询中…</div>}

      {pointValue.status === "error" && (
        <div>
          <div className="mb-2 text-red-400">查询失败，请重试</div>
          <button
            type="button"
            onClick={retryPointValue}
            className="rounded border border-white/10 px-2 py-1 text-xs hover:bg-zinc-800"
          >
            重试
          </button>
        </div>
      )}

      {pointValue.status === "done" && (
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{pointValue.bortleClass}</span>
            <span className="text-xs text-zinc-400">
              Bortle 等级 · {BORTLE_DESCRIPTIONS[pointValue.bortleClass] ?? ""}（近似值）
            </span>
          </div>
          <div className="mt-1 text-xs text-zinc-400">SQM ≈ {pointValue.sqm.toFixed(2)} mag/arcsec²</div>
          {STAR_COUNT_ESTIMATES[pointValue.bortleClass] && (
            <div className="mt-1 text-xs text-zinc-400">
              预计肉眼可见恒星数：约 {STAR_COUNT_ESTIMATES[pointValue.bortleClass].min}-
              {STAR_COUNT_ESTIMATES[pointValue.bortleClass].max} 颗（粗略估算）
            </div>
          )}
        </div>
      )}
    </div>
  );
}
