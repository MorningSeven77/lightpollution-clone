"use client";

import { useEffect, useRef, useState } from "react";
import Map, { MapHandle, SelectedLocation } from "@/components/Map";
import SearchBar, { GeocodeResult } from "@/components/SearchBar";
import Legend from "@/components/Legend";
import MapControls from "@/components/MapControls";
import LocationDetailPanel from "@/components/LocationDetailPanel";
import DarkSkyPlacePanel from "@/components/DarkSkyPlacePanel";
import MoonPhasePanel from "@/components/MoonPhasePanel";
import LocationHistoryPanel from "@/components/LocationHistoryPanel";
import SiteHeader from "@/components/SiteHeader";
import { BasemapId, DEFAULT_BASEMAP } from "@/lib/basemapStyles";
import { ColorStyleId, DEFAULT_COLOR_STYLE } from "@/lib/colorStyles";
import { DarkSkyPlace } from "@/lib/darkSkyPlaces";
import { WeatherOverlayId, DEFAULT_WEATHER_OVERLAY } from "@/lib/weatherOverlay";

export default function Home() {
  const mapRef = useRef<MapHandle>(null);
  const [basemap, setBasemap] = useState<BasemapId>(DEFAULT_BASEMAP);
  const [colorStyle, setColorStyle] = useState<ColorStyleId>(DEFAULT_COLOR_STYLE);
  const [opacity, setOpacity] = useState(75);
  const [visible, setVisible] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [showDarkSkyPlaces, setShowDarkSkyPlaces] = useState(false);
  const [selectedDarkSkyPlace, setSelectedDarkSkyPlace] = useState<DarkSkyPlace | null>(null);
  const [showAurora, setShowAurora] = useState(false);
  const [showTerminator, setShowTerminator] = useState(false);
  const [weatherOverlay, setWeatherOverlay] = useState<WeatherOverlayId>(DEFAULT_WEATHER_OVERLAY);

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
    <main className="flex h-screen w-screen flex-col overflow-hidden">
      <SiteHeader />
      <div className="relative flex-1">
      <Map
        ref={mapRef}
        basemap={basemap}
        colorStyle={colorStyle}
        opacity={opacity}
        visible={visible}
        selectedLocation={selectedLocation}
        onMapClick={(lat, lng) => {
          setSelectedDarkSkyPlace(null);
          setSelectedLocation({ lat, lng });
        }}
        showDarkSkyPlaces={showDarkSkyPlaces}
        onDarkSkyPlaceClick={(place) => {
          setSelectedLocation(null);
          setSelectedDarkSkyPlace(place);
        }}
        showAurora={showAurora}
        showTerminator={showTerminator}
        weatherOverlay={weatherOverlay}
      />
      <SearchBar onSelect={handleSelect} />
      <Legend colorStyle={colorStyle} />
      <MoonPhasePanel />
      <LocationHistoryPanel
        onSelectLocation={(lat, lng) => {
          setSelectedDarkSkyPlace(null);
          setSelectedLocation({ lat, lng });
          mapRef.current?.flyTo({ lat, lng, zoom: 10 });
        }}
      />
      <MapControls
        basemap={basemap}
        onBasemapChange={setBasemap}
        colorStyle={colorStyle}
        onColorStyleChange={setColorStyle}
        opacity={opacity}
        onOpacityChange={setOpacity}
        visible={visible}
        onVisibleChange={setVisible}
        showDarkSkyPlaces={showDarkSkyPlaces}
        onShowDarkSkyPlacesChange={setShowDarkSkyPlaces}
        showAurora={showAurora}
        onShowAuroraChange={setShowAurora}
        showTerminator={showTerminator}
        onShowTerminatorChange={setShowTerminator}
        weatherOverlay={weatherOverlay}
        onWeatherOverlayChange={setWeatherOverlay}
      />
      {selectedDarkSkyPlace ? (
        <DarkSkyPlacePanel place={selectedDarkSkyPlace} onClose={() => setSelectedDarkSkyPlace(null)} />
      ) : (
        <LocationDetailPanel location={selectedLocation} onClose={() => setSelectedLocation(null)} />
      )}
      </div>
    </main>
  );
}
