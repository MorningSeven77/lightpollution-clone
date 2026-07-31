"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Map as MaplibreMap, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapView, readViewFromUrl, writeViewToUrl } from "@/lib/urlState";

// CARTO's free, key-less basemap styles: https://docs.carto.com/carto-for-developers/carto-for-react/guides/basemaps
const BASEMAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export type MapHandle = {
  flyTo: (view: MapView) => void;
};

const Map = forwardRef<MapHandle>(function Map(_props, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);

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

  return (
    <div className="fixed inset-0">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
});

export default Map;
