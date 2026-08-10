"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Map as MaplibreMap, Marker, NavigationControl, RasterTileSource, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapView, readViewFromUrl, writeViewToUrl } from "@/lib/urlState";
import { BasemapId, BASEMAP_STYLES } from "@/lib/basemapStyles";
import { ColorStyleId } from "@/lib/colorStyles";
import { DarkSkyPlace, DARK_SKY_PLACES, DARK_SKY_CATEGORY_META } from "@/lib/darkSkyPlaces";
import type { AuroraFeatureCollection } from "@/app/api/aurora/route";
import { computeTerminatorPolygon } from "@/lib/terminator";
import { WeatherOverlayId, WEATHER_OVERLAYS } from "@/lib/weatherOverlay";
import type { RankedSpot } from "@/lib/bestSpots";
import type { CircleLayerSpecification, FillLayerSpecification, GeoJSONSource, HeatmapLayerSpecification } from "maplibre-gl";

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
const DARK_SKY_SOURCE_ID = "dark-sky-places";
const DARK_SKY_LAYER_ID = "dark-sky-places-layer";
const AURORA_SOURCE_ID = "aurora";
const AURORA_LAYER_ID = "aurora-layer";
const TERMINATOR_SOURCE_ID = "terminator";
const TERMINATOR_LAYER_ID = "terminator-layer";
const WEATHER_TILES_SOURCE_ID = "weather-tiles";
const WEATHER_TILES_LAYER_ID = "weather-tiles-layer";
const BEST_SPOTS_SOURCE_ID = "best-spots";
const BEST_SPOTS_CIRCLE_LAYER_ID = "best-spots-circle-layer";
const BEST_SPOTS_LABEL_LAYER_ID = "best-spots-label-layer";
// How often to recompute the terminator polygon while it's visible — the
// terminator sweeps ~15° of longitude per hour, so a 1-minute refresh keeps
// it visually accurate without redrawing on every render frame.
const TERMINATOR_REFRESH_MS = 60_000;

// Static — DARK_SKY_PLACES never changes at runtime, so this is built once
// at module load rather than re-derived on every ensureDarkSkyPlacesLayer call.
const DARK_SKY_PLACES_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.Point, DarkSkyPlace> = {
  type: "FeatureCollection",
  features: DARK_SKY_PLACES.map((place) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [place.lng, place.lat] },
    properties: place,
  })),
};

const DARK_SKY_CIRCLE_COLOR: CircleLayerSpecification["paint"] = {
  "circle-radius": 7,
  "circle-color": [
    "match",
    ["get", "category"],
    "park",
    DARK_SKY_CATEGORY_META.park.color,
    "community",
    DARK_SKY_CATEGORY_META.community.color,
    "sanctuary",
    DARK_SKY_CATEGORY_META.sanctuary.color,
    "reserve",
    DARK_SKY_CATEGORY_META.reserve.color,
    "urban",
    DARK_SKY_CATEGORY_META.urban.color,
    "#999999",
  ],
  "circle-stroke-width": 1.5,
  "circle-stroke-color": "#ffffff",
};

// Green→yellow→red matches the reference site's own aurora-probability
// legend (10% / 50% / 90%). "probability" is NOAA's 0-100 scale.
const AURORA_HEATMAP_PAINT: HeatmapLayerSpecification["paint"] = {
  "heatmap-weight": ["interpolate", ["linear"], ["get", "probability"], 0, 0, 100, 1],
  "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 8, 2.5],
  "heatmap-color": [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    0,
    "rgba(0,0,0,0)",
    0.2,
    "rgba(34,197,94,0.5)",
    0.5,
    "rgba(234,179,8,0.7)",
    1,
    "rgba(239,68,68,0.85)",
  ],
  "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 12, 8, 35],
  "heatmap-opacity": 0.75,
};

const TERMINATOR_FILL_PAINT: FillLayerSpecification["paint"] = {
  "fill-color": "#000000",
  "fill-opacity": 0.35,
};

const BEST_SPOTS_CIRCLE_PAINT: CircleLayerSpecification["paint"] = {
  "circle-radius": 11,
  "circle-color": "#a855f7",
  "circle-stroke-width": 2,
  "circle-stroke-color": "#ffffff",
};

// BasemapDef is either a CARTO style.json URL or (for the raster satellite
// basemap) an inline style object — both are valid values for MapLibre's
// `style` option / setStyle(), so this just picks whichever one is present.
function resolveBasemapStyle(id: BasemapId) {
  const def = BASEMAP_STYLES[id];
  return "styleUrl" in def ? def.styleUrl : def.style;
}

export type MapHandle = {
  flyTo: (view: MapView) => void;
  getCenter: () => { lat: number; lng: number } | null;
};

export type SelectedLocation = { lat: number; lng: number };

export type MapProps = {
  colorStyle: ColorStyleId;
  basemap: BasemapId;
  opacity: number; // 0-100
  visible: boolean;
  selectedLocation: SelectedLocation | null;
  onMapClick: (lat: number, lng: number) => void;
  showDarkSkyPlaces: boolean;
  onDarkSkyPlaceClick: (place: DarkSkyPlace) => void;
  showAurora: boolean;
  showTerminator: boolean;
  weatherOverlay: WeatherOverlayId;
  bestSpots: RankedSpot[] | null;
  onBestSpotClick: (spot: RankedSpot) => void;
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

// Adds the certified dark-sky-places source/layer if it doesn't exist yet
// (e.g. first load, or right after a basemap switch wiped it) — the data is
// static (see darkSkyPlaces.ts) so, unlike the VIIRS layer, there's no tile
// URL to swap on re-entry.
function ensureDarkSkyPlacesLayer(map: MaplibreMap, visible: boolean) {
  if (map.getSource(DARK_SKY_SOURCE_ID)) return;

  map.addSource(DARK_SKY_SOURCE_ID, {
    type: "geojson",
    data: DARK_SKY_PLACES_GEOJSON,
  });
  map.addLayer({
    id: DARK_SKY_LAYER_ID,
    type: "circle",
    source: DARK_SKY_SOURCE_ID,
    paint: DARK_SKY_CIRCLE_COLOR,
    layout: { visibility: visible ? "visible" : "none" },
  });
}

// Adds the aurora-probability source/layer if it doesn't exist yet, fetching
// NOAA's OVATION forecast once and reusing it across re-entries (basemap
// switches wipe the layer but not this cache) — unlike the VIIRS layer, there's
// only ever one aurora dataset, not one per color style.
async function ensureAuroraLayer(map: MaplibreMap, cache: { current: AuroraFeatureCollection | null }, visible: boolean) {
  if (map.getSource(AURORA_SOURCE_ID)) return;
  try {
    let data = cache.current;
    if (!data) {
      const res = await fetch("/api/aurora");
      if (!res.ok) throw new Error("aurora request failed");
      data = (await res.json()) as AuroraFeatureCollection;
      cache.current = data;
    }
    // The fetch above is async — a basemap switch or second mount could have
    // already re-added the source while this call was awaiting the response.
    if (map.getSource(AURORA_SOURCE_ID)) return;

    map.addSource(AURORA_SOURCE_ID, { type: "geojson", data });
    map.addLayer({
      id: AURORA_LAYER_ID,
      type: "heatmap",
      source: AURORA_SOURCE_ID,
      paint: AURORA_HEATMAP_PAINT,
      layout: { visibility: visible ? "visible" : "none" },
    });
  } catch (err) {
    console.error("Failed to load aurora layer:", err);
  }
}

// Adds the day/night terminator source/layer if it doesn't exist yet. Unlike
// the other layers this is pure client-side astronomy (see terminator.ts) —
// no fetch, so it's synchronous and always current as of the moment it's added.
function ensureTerminatorLayer(map: MaplibreMap, visible: boolean) {
  if (map.getSource(TERMINATOR_SOURCE_ID)) return;

  map.addSource(TERMINATOR_SOURCE_ID, {
    type: "geojson",
    data: computeTerminatorPolygon(new Date()),
  });
  map.addLayer({
    id: TERMINATOR_LAYER_ID,
    type: "fill",
    source: TERMINATOR_SOURCE_ID,
    paint: TERMINATOR_FILL_PAINT,
    layout: { visibility: visible ? "visible" : "none" },
  });
}

// Adds/updates the weather-tiles layer (clouds or rain, from
// OpenWeatherMap via our own /api/weather-tiles proxy — see that route for
// why it's proxied rather than hit directly). "none" just hides whatever's
// there instead of removing it, matching the visibility-toggle pattern used
// by the other layers, so switching back to clouds/rain doesn't need a
// fresh addLayer.
function ensureWeatherTilesLayer(map: MaplibreMap, overlay: WeatherOverlayId) {
  const owmLayer = WEATHER_OVERLAYS[overlay].owmLayer;
  const existingSource = map.getSource(WEATHER_TILES_SOURCE_ID) as RasterTileSource | undefined;

  if (!owmLayer) {
    if (map.getLayer(WEATHER_TILES_LAYER_ID)) {
      map.setLayoutProperty(WEATHER_TILES_LAYER_ID, "visibility", "none");
    }
    return;
  }

  const tileUrl = `/api/weather-tiles?layer=${owmLayer}&z={z}&x={x}&y={y}`;

  if (existingSource) {
    existingSource.setTiles([tileUrl]);
    map.setLayoutProperty(WEATHER_TILES_LAYER_ID, "visibility", "visible");
    return;
  }

  map.addSource(WEATHER_TILES_SOURCE_ID, {
    type: "raster",
    tiles: [tileUrl],
    tileSize: 256,
  });
  map.addLayer({
    id: WEATHER_TILES_LAYER_ID,
    type: "raster",
    source: WEATHER_TILES_SOURCE_ID,
    paint: { "raster-opacity": 0.7 },
  });
}

// Adds the "best stargazing spots" search-result markers if they don't
// exist yet, or swaps the data in place if they do (a new search replaces
// the previous one's results rather than accumulating them). Ranks are
// 1-based, matching how the results list numbers them.
function ensureBestSpotsLayer(map: MaplibreMap, spots: RankedSpot[]) {
  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: spots.map((spot, i) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [spot.lng, spot.lat] },
      properties: { rank: i + 1, lat: spot.lat, lng: spot.lng, sqm: spot.sqm, bortleClass: spot.bortleClass, score: spot.score },
    })),
  };

  const existingSource = map.getSource(BEST_SPOTS_SOURCE_ID) as GeoJSONSource | undefined;
  if (existingSource) {
    existingSource.setData(geojson);
    return;
  }

  map.addSource(BEST_SPOTS_SOURCE_ID, { type: "geojson", data: geojson });
  map.addLayer({
    id: BEST_SPOTS_CIRCLE_LAYER_ID,
    type: "circle",
    source: BEST_SPOTS_SOURCE_ID,
    paint: BEST_SPOTS_CIRCLE_PAINT,
  });
  map.addLayer({
    id: BEST_SPOTS_LABEL_LAYER_ID,
    type: "symbol",
    source: BEST_SPOTS_SOURCE_ID,
    layout: {
      "text-field": ["get", "rank"],
      "text-size": 11,
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: { "text-color": "#ffffff" },
  });
}

function removeBestSpotsLayer(map: MaplibreMap) {
  if (map.getLayer(BEST_SPOTS_LABEL_LAYER_ID)) map.removeLayer(BEST_SPOTS_LABEL_LAYER_ID);
  if (map.getLayer(BEST_SPOTS_CIRCLE_LAYER_ID)) map.removeLayer(BEST_SPOTS_CIRCLE_LAYER_ID);
  if (map.getSource(BEST_SPOTS_SOURCE_ID)) map.removeSource(BEST_SPOTS_SOURCE_ID);
}

// CARTO's basemaps render CJK place/road names with a "HanWangHeiLight"
// fallback font (their Latin-oriented font stack has no CJK glyphs) — that
// font is visually much heavier than the Latin "Regular" weight the style
// specifies, so Chinese labels read as bold even though nothing is actually
// set to bold. Swapping in a lighter CJK font isn't possible without hosting
// our own glyphs, so this thins the text halo instead, which is the one
// lever that meaningfully reduces how heavy the labels look.
const THINNED_TEXT_HALO_WIDTH = 0.5;

function thinOutLabels(map: MaplibreMap) {
  const layers = map.getStyle()?.layers ?? [];
  for (const layer of layers) {
    if (layer.type === "symbol" && layer.layout && "text-field" in layer.layout && map.getLayer(layer.id)) {
      map.setPaintProperty(layer.id, "text-halo-width", THINNED_TEXT_HALO_WIDTH);
    }
  }
}

const Map = forwardRef<MapHandle, MapProps>(function Map(
  {
    colorStyle,
    basemap,
    opacity,
    visible,
    selectedLocation,
    onMapClick,
    showDarkSkyPlaces,
    onDarkSkyPlaceClick,
    showAurora,
    showTerminator,
    weatherOverlay,
    bestSpots,
    onBestSpotClick,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const tileUrlCacheRef = useRef<Partial<Record<ColorStyleId, string>>>({});
  const auroraCacheRef = useRef<AuroraFeatureCollection | null>(null);

  // Latest-value refs so async callbacks (fetch resolution, style.load, the
  // click handler registered once at mount) never close over stale props.
  const colorStyleRef = useRef(colorStyle);
  const opacityRef = useRef(opacity);
  const visibleRef = useRef(visible);
  const onMapClickRef = useRef(onMapClick);
  const showDarkSkyPlacesRef = useRef(showDarkSkyPlaces);
  const onDarkSkyPlaceClickRef = useRef(onDarkSkyPlaceClick);
  const showAuroraRef = useRef(showAurora);
  const showTerminatorRef = useRef(showTerminator);
  const weatherOverlayRef = useRef(weatherOverlay);
  const bestSpotsRef = useRef(bestSpots);
  const onBestSpotClickRef = useRef(onBestSpotClick);
  colorStyleRef.current = colorStyle;
  opacityRef.current = opacity;
  visibleRef.current = visible;
  onMapClickRef.current = onMapClick;
  showDarkSkyPlacesRef.current = showDarkSkyPlaces;
  onDarkSkyPlaceClickRef.current = onDarkSkyPlaceClick;
  showAuroraRef.current = showAurora;
  showTerminatorRef.current = showTerminator;
  weatherOverlayRef.current = weatherOverlay;
  bestSpotsRef.current = bestSpots;
  onBestSpotClickRef.current = onBestSpotClick;

  useImperativeHandle(ref, () => ({
    flyTo: (view: MapView) => {
      mapRef.current?.flyTo({ center: [view.lng, view.lat], zoom: view.zoom });
    },
    getCenter: () => {
      if (!mapRef.current) return null;
      const center = mapRef.current.getCenter();
      return { lat: center.lat, lng: center.lng };
    },
  }));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialView = readViewFromUrl();

    const map = new MaplibreMap({
      container: containerRef.current,
      style: resolveBasemapStyle(basemap),
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
      ensureDarkSkyPlacesLayer(map, showDarkSkyPlacesRef.current);
      ensureAuroraLayer(map, auroraCacheRef, showAuroraRef.current);
      ensureTerminatorLayer(map, showTerminatorRef.current);
      ensureWeatherTilesLayer(map, weatherOverlayRef.current);
      if (bestSpotsRef.current) ensureBestSpotsLayer(map, bestSpotsRef.current);
      thinOutLabels(map);
    });

    map.on("click", (e) => {
      // The best-spots markers sit on top of the dark-sky-places layer,
      // which itself sits on top of the basemap — a click that lands on
      // either should open that thing's details instead of falling through
      // to the generic lat/lng point-value lookup.
      const bestSpotHits = map.getLayer(BEST_SPOTS_CIRCLE_LAYER_ID)
        ? map.queryRenderedFeatures(e.point, { layers: [BEST_SPOTS_CIRCLE_LAYER_ID] })
        : [];
      if (bestSpotHits.length > 0) {
        onBestSpotClickRef.current(bestSpotHits[0].properties as unknown as RankedSpot);
        return;
      }

      const darkSkyHits = map.getLayer(DARK_SKY_LAYER_ID)
        ? map.queryRenderedFeatures(e.point, { layers: [DARK_SKY_LAYER_ID] })
        : [];
      if (darkSkyHits.length > 0) {
        onDarkSkyPlaceClickRef.current(darkSkyHits[0].properties as unknown as DarkSkyPlace);
        return;
      }
      onMapClickRef.current(e.lngLat.lat, e.lngLat.lng);
    });

    map.on("mouseenter", DARK_SKY_LAYER_ID, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", DARK_SKY_LAYER_ID, () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("mouseenter", BEST_SPOTS_CIRCLE_LAYER_ID, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", BEST_SPOTS_CIRCLE_LAYER_ID, () => {
      map.getCanvas().style.cursor = "";
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
      ensureDarkSkyPlacesLayer(map, showDarkSkyPlacesRef.current);
      ensureAuroraLayer(map, auroraCacheRef, showAuroraRef.current);
      ensureTerminatorLayer(map, showTerminatorRef.current);
      ensureWeatherTilesLayer(map, weatherOverlayRef.current);
      if (bestSpotsRef.current) ensureBestSpotsLayer(map, bestSpotsRef.current);
      thinOutLabels(map);
    });
    map.setStyle(resolveBasemapStyle(basemap));
  }, [basemap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (bestSpots && bestSpots.length > 0) {
      ensureBestSpotsLayer(map, bestSpots);
    } else if (map.getSource(BEST_SPOTS_SOURCE_ID)) {
      removeBestSpotsLayer(map);
    }
  }, [bestSpots]);

  const isFirstWeatherOverlayRender = useRef(true);
  useEffect(() => {
    if (isFirstWeatherOverlayRender.current) {
      isFirstWeatherOverlayRender.current = false;
      return;
    }
    const map = mapRef.current;
    if (!map) return;
    ensureWeatherTilesLayer(map, weatherOverlay);
  }, [weatherOverlay]);

  const isFirstTerminatorRender = useRef(true);
  useEffect(() => {
    if (isFirstTerminatorRender.current) {
      isFirstTerminatorRender.current = false;
      return;
    }
    if (mapRef.current?.getLayer(TERMINATOR_LAYER_ID)) {
      mapRef.current.setLayoutProperty(TERMINATOR_LAYER_ID, "visibility", showTerminator ? "visible" : "none");
    }
  }, [showTerminator]);

  // Keep the terminator polygon current while it's visible — it sweeps
  // ~15°/hour, so a stale polygon left up for a while would visibly drift.
  useEffect(() => {
    if (!showTerminator) return;
    const intervalId = setInterval(() => {
      const source = mapRef.current?.getSource(TERMINATOR_SOURCE_ID) as GeoJSONSource | undefined;
      source?.setData(computeTerminatorPolygon(new Date()));
    }, TERMINATOR_REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [showTerminator]);

  const isFirstAuroraRender = useRef(true);
  useEffect(() => {
    if (isFirstAuroraRender.current) {
      isFirstAuroraRender.current = false;
      return;
    }
    if (mapRef.current?.getLayer(AURORA_LAYER_ID)) {
      mapRef.current.setLayoutProperty(AURORA_LAYER_ID, "visibility", showAurora ? "visible" : "none");
    }
  }, [showAurora]);

  const isFirstDarkSkyPlacesRender = useRef(true);
  useEffect(() => {
    if (isFirstDarkSkyPlacesRender.current) {
      isFirstDarkSkyPlacesRender.current = false;
      return;
    }
    if (mapRef.current?.getLayer(DARK_SKY_LAYER_ID)) {
      mapRef.current.setLayoutProperty(DARK_SKY_LAYER_ID, "visibility", showDarkSkyPlaces ? "visible" : "none");
    }
  }, [showDarkSkyPlaces]);

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
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
});

export default Map;
