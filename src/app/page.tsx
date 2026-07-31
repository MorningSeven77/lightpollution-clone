"use client";

import { useEffect, useRef, useState } from "react";
import Map, { MapHandle } from "@/components/Map";
import SearchBar, { GeocodeResult } from "@/components/SearchBar";
import Legend from "@/components/Legend";
import MapControls from "@/components/MapControls";
import { BasemapId, DEFAULT_BASEMAP } from "@/lib/basemapStyles";
import { ColorStyleId, DEFAULT_COLOR_STYLE } from "@/lib/colorStyles";

export default function Home() {
  const mapRef = useRef<MapHandle>(null);
  const [basemap, setBasemap] = useState<BasemapId>(DEFAULT_BASEMAP);
  const [colorStyle, setColorStyle] = useState<ColorStyleId>(DEFAULT_COLOR_STYLE);
  const [opacity, setOpacity] = useState(75);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;

    // If the URL already encodes a view (e.g. a shared link), respect it
    // instead of overriding it with the browser's geolocation guess.
    if (new URLSearchParams(window.location.search).has("lat")) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.flyTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          zoom: 8,
        });
      },
      () => {
        // Permission denied or unavailable: keep the default world view.
      },
      { timeout: 5000 },
    );
  }, []);

  const handleSelect = (result: GeocodeResult) => {
    mapRef.current?.flyTo({ lat: result.lat, lng: result.lng, zoom: 10 });
  };

  return (
    <main className="h-screen w-screen overflow-hidden">
      <Map ref={mapRef} basemap={basemap} colorStyle={colorStyle} opacity={opacity} visible={visible} />
      <SearchBar onSelect={handleSelect} />
      <Legend colorStyle={colorStyle} />
      <MapControls
        basemap={basemap}
        onBasemapChange={setBasemap}
        colorStyle={colorStyle}
        onColorStyleChange={setColorStyle}
        opacity={opacity}
        onOpacityChange={setOpacity}
        visible={visible}
        onVisibleChange={setVisible}
      />
    </main>
  );
}
