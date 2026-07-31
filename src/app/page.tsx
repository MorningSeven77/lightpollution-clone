"use client";

import { useEffect, useRef } from "react";
import Map, { MapHandle } from "@/components/Map";
import SearchBar, { GeocodeResult } from "@/components/SearchBar";

export default function Home() {
  const mapRef = useRef<MapHandle>(null);

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
      <Map ref={mapRef} />
      <SearchBar onSelect={handleSelect} />
    </main>
  );
}
