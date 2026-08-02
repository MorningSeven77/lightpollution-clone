"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Map as MaplibreMap, Marker, NavigationControl, RasterTileSource, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapView, readViewFromUrl, writeViewToUrl } from "@/lib/urlState";
import { BasemapId, BASEMAP_STYLES } from "@/lib/basemapStyles";
import { ColorStyleId } from "@/lib/colorStyles";

// maplibre-gl v6 is ESM-only and can't reliably resolve its own worker URL
// inside a bundler's module graph, so every bundler-based app has to point
// it at the worker file explicitly (otherwise vector tiles never render —
// they sit in a "loading" state forever with no error). The worker file
// does a relative `import "./maplibre-gl-shared.mjs"`, so it can't be
// served from a content-hashed bundler asset path (that would put it next
// to a differently-named sibling); scripts/copy-maplibre-worker.js copies
// both files into public/maplibre/ under their original names instead.
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const VIIRS_SOURCE_ID = "viirs";
const VIIRS_LAYER_ID = "viirs-layer";
const MARKER_COLOR = "#34d399";

export type MapHandle = {
  flyTo: (view: MapView) => void;
};

export type SelectedLocation = { lat: number; lng: number };

export type MapProps = {
  colorStyle: ColorStyleId;
  basemap: BasemapId;
  opacity: number; // 0-100
  visible: boolean;
  selectedLocation: SelectedLocation | null;
  onMapClick: (lat: number, lng: number) => void;
};

// Adds the VIIRS layer if it doesn't exist yet (e.g. first load, or right
// after a basemap switch wiped it), or swaps its tile URL in place if it
// does. Tile URLs are cached per color style so switching back to one
// already viewed this session doesn't re-hit Earth Engine.
async function ensureViirsLayer(
  map: MaplibreMap,
  colorStyle: ColorStyleId,
  tileUrlCache: Partial<Record<ColorStyleId, string>>,
  opacity: number,
  visible: boolean,
) {
  try {
    let urlFormat = tileUrlCache[colorStyle];
    if (!urlFormat) {
      const res = await fetch(`/api/tile-layer?style=${colorStyle}`);
      if (!res.ok) throw new Error("tile-layer request failed");
      const data = (await res.json()) as { urlFormat: string };
      urlFormat = data.urlFormat;
      tileUrlCache[colorStyle] = urlFormat;
    }

    const existingSource = map.getSource(VIIRS_SOURCE_ID) as RasterTileSource | undefined;
    if (existingSource) {
      existingSource.setTiles([urlFormat]);
      return;
    }

    map.addSource(VIIRS_SOURCE_ID, {
      type: "raster",
      tiles: [urlFormat],
      tileSize: 256,
    });
    // Insert below the basemap's label layers (addLayer defaults to placing
    // new layers on top of everything, which would bury place names under
    // the color overlay and make them unreadable).
    const firstSymbolLayerId = map.getStyle()?.layers?.find((layer) => layer.type === "symbol")?.id;
    map.addLayer(
      {
        id: VIIRS_LAYER_ID,
        type: "raster",
        source: VIIRS_SOURCE_ID,
        paint: { "raster-opacity": opacity / 100 },
        layout: { visibility: visible ? "visible" : "none" },
      },
      firstSymbolLayerId,
    );
  } catch (err) {
    console.error("Failed to load light-pollution layer:", err);
  }
}

const Map = forwardRef<MapHandle, MapProps>(function Map(
  { colorStyle, basemap, opacity, visible, selectedLocation, onMapClick },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const tileUrlCacheRef = useRef<Partial<Record<ColorStyleId, string>>>({});

  // Latest-value refs so async callbacks (fetch resolution, style.load, the
  // click handler registered once at mount) never close over stale props.
  const colorStyleRef = useRef(colorStyle);
  const opacityRef = useRef(opacity);
  const visibleRef = useRef(visible);
  const onMapClickRef = useRef(onMapClick);
  colorStyleRef.current = colorStyle;
  opacityRef.current = opacity;
  visibleRef.current = visible;
  onMapClickRef.current = onMapClick;

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
      style: BASEMAP_STYLES[basemap].styleUrl,
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
      ensureViirsLayer(map, colorStyleRef.current, tileUrlCacheRef.current, opacityRef.current, visibleRef.current);
    });

    map.on("click", (e) => {
      onMapClickRef.current(e.lngLat.lat, e.lngLat.lng);
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
    // Mount-only: the initial basemap/colorStyle/opacity/visible are read via
    // refs above; later prop changes are each handled by their own effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFirstColorStyleRender = useRef(true);
  useEffect(() => {
    if (isFirstColorStyleRender.current) {
      isFirstColorStyleRender.current = false;
      return;
    }
    const map = mapRef.current;
    if (!map) return;
    ensureViirsLayer(map, colorStyle, tileUrlCacheRef.current, opacityRef.current, visibleRef.current);
  }, [colorStyle]);

  const isFirstOpacityRender = useRef(true);
  useEffect(() => {
    if (isFirstOpacityRender.current) {
      isFirstOpacityRender.current = false;
      return;
    }
    if (mapRef.current?.getLayer(VIIRS_LAYER_ID)) {
      mapRef.current.setPaintProperty(VIIRS_LAYER_ID, "raster-opacity", opacity / 100);
    }
  }, [opacity]);

  const isFirstVisibleRender = useRef(true);
  useEffect(() => {
    if (isFirstVisibleRender.current) {
      isFirstVisibleRender.current = false;
      return;
    }
    if (mapRef.current?.getLayer(VIIRS_LAYER_ID)) {
      mapRef.current.setLayoutProperty(VIIRS_LAYER_ID, "visibility", visible ? "visible" : "none");
    }
  }, [visible]);

  // Switching basemap style wipes every custom source/layer (MapLibre
  // behavior), so the VIIRS layer has to be re-added once the new style
  // finishes loading. NavigationControl and the moveend/click handlers are
  // bound to the Map instance rather than the style, so they survive as-is.
  const isFirstBasemapRender = useRef(true);
  useEffect(() => {
    if (isFirstBasemapRender.current) {
      isFirstBasemapRender.current = false;
      return;
    }
    const map = mapRef.current;
    if (!map) return;
    map.once("style.load", () => {
      ensureViirsLayer(map, colorStyleRef.current, tileUrlCacheRef.current, opacityRef.current, visibleRef.current);
    });
    map.setStyle(BASEMAP_STYLES[basemap].styleUrl);
  }, [basemap]);

  // Keep a marker at the currently selected point (or remove it once
  // deselected), mirroring LocationDetailPanel's open/closed state.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!selectedLocation) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    if (!markerRef.current) {
      // Marker needs a position set *before* addTo() — it reads its lngLat
      // while attaching to compute initial screen placement.
      markerRef.current = new Marker({ color: MARKER_COLOR })
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([selectedLocation.lng, selectedLocation.lat]);
    }
  }, [selectedLocation]);

  return (
    <div className="fixed inset-0">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
});

export default Map;
