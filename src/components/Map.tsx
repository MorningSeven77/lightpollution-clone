"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Map as MaplibreMap, NavigationControl, Popup, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapView, readViewFromUrl, writeViewToUrl } from "@/lib/urlState";

// maplibre-gl v6 is ESM-only and can't reliably resolve its own worker URL
// inside a bundler's module graph, so every bundler-based app has to point
// it at the worker file explicitly (otherwise vector tiles never render —
// they sit in a "loading" state forever with no error). The worker file
// does a relative `import "./maplibre-gl-shared.mjs"`, so it can't be
// served from a content-hashed bundler asset path (that would put it next
// to a differently-named sibling); scripts/copy-maplibre-worker.js copies
// both files into public/maplibre/ under their original names instead.
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

// CARTO's free, key-less basemap styles: https://docs.carto.com/carto-for-developers/carto-for-react/guides/basemaps
const BASEMAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const VIIRS_SOURCE_ID = "viirs";
const VIIRS_LAYER_ID = "viirs-layer";

export type MapHandle = {
  flyTo: (view: MapView) => void;
};

const BORTLE_DESCRIPTIONS: Record<number, string> = {
  1: "极暗夜空",
  2: "典型暗夜空",
  3: "乡村夜空",
  4: "乡村/郊区过渡",
  5: "郊区夜空",
  6: "较亮郊区夜空",
  7: "郊区/城市过渡",
  8: "城市夜空",
  9: "市中心夜空",
};

type PopupState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "done"; bortleClass: number; sqm: number };

function formatPopupHtml(state: PopupState): string {
  if (state.status === "loading") {
    return `<div style="font-size:13px;">查询中…</div>`;
  }
  if (state.status === "error") {
    return `<div style="font-size:13px;color:#f87171;">查询失败，请重试</div>`;
  }
  const desc = BORTLE_DESCRIPTIONS[state.bortleClass] ?? "";
  return `
    <div style="font-size:13px; line-height:1.6;">
      <div><strong>Bortle ${state.bortleClass}</strong>（${desc}，近似值）</div>
      <div>SQM ≈ ${state.sqm.toFixed(2)} mag/arcsec²</div>
    </div>
  `;
}

const Map = forwardRef<MapHandle>(function Map(_props, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const [layerVisible, setLayerVisible] = useState(true);
  const layerVisibleRef = useRef(layerVisible);
  layerVisibleRef.current = layerVisible;

  useImperativeHandle(ref, () => ({
    flyTo: (view: MapView) => {
      mapRef.current?.flyTo({ center: [view.lng, view.lat], zoom: view.zoom });
    },
  }));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialView = readViewFromUrl();

    const map = new MaplibreMap({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: [initialView.lng, initialView.lat],
      zoom: initialView.zoom,
      attributionControl: { compact: true },
    });

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    map.on("moveend", () => {
      const center = map.getCenter();
      writeViewToUrl({ lat: center.lat, lng: center.lng, zoom: map.getZoom() });
    });

    map.on("load", () => {
      fetch("/api/tile-layer")
        .then(async (res) => {
          if (!res.ok) throw new Error("tile-layer request failed");
          const { urlFormat } = (await res.json()) as { urlFormat: string };

          map.addSource(VIIRS_SOURCE_ID, {
            type: "raster",
            tiles: [urlFormat],
            tileSize: 256,
          });
          map.addLayer({
            id: VIIRS_LAYER_ID,
            type: "raster",
            source: VIIRS_SOURCE_ID,
            paint: { "raster-opacity": 0.75 },
            layout: { visibility: layerVisibleRef.current ? "visible" : "none" },
          });
        })
        .catch((err) => {
          console.error("Failed to load light-pollution layer:", err);
        });
    });

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      const popup = new Popup({ closeButton: true, closeOnClick: true })
        .setLngLat(e.lngLat)
        .setHTML(formatPopupHtml({ status: "loading" }))
        .addTo(map);

      fetch(`/api/point-value?lat=${lat}&lng=${lng}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("point-value request failed");
          const data = (await res.json()) as { bortleClass: number; sqm: number };
          popup.setHTML(formatPopupHtml({ status: "done", bortleClass: data.bortleClass, sqm: data.sqm }));
        })
        .catch(() => {
          popup.setHTML(formatPopupHtml({ status: "error" }));
        });
    });

    mapRef.current = map;

    // Container size can settle after CSS/layout finishes applying, so keep
    // the map's canvas in sync instead of relying only on the initial measurement.
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const toggleLayer = () => {
    const next = !layerVisibleRef.current;
    setLayerVisible(next);

    const map = mapRef.current;
    if (map?.getLayer(VIIRS_LAYER_ID)) {
      map.setLayoutProperty(VIIRS_LAYER_ID, "visibility", next ? "visible" : "none");
    }
  };

  return (
    <div className="fixed inset-0">
      <div ref={containerRef} className="h-full w-full" />
      <button
        type="button"
        onClick={toggleLayer}
        className="fixed bottom-16 right-4 z-10 rounded-md border border-white/10 bg-zinc-900/90 px-3 py-2 text-xs text-zinc-100 shadow-lg backdrop-blur hover:bg-zinc-800"
      >
        {layerVisible ? "隐藏光污染图层" : "显示光污染图层"}
      </button>
    </div>
  );
});

export default Map;
