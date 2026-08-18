"use client";

import { useEffect, useRef, useState } from "react";
import Map, { MapHandle, SelectedLocation } from "@/components/Map";
import SearchBar, { GeocodeResult } from "@/components/SearchBar";
import Legend from "@/components/Legend";
import InfoPanel from "@/components/InfoPanel";
import LocationDetailPanel from "@/components/LocationDetailPanel";
import DarkSkyPlacePanel from "@/components/DarkSkyPlacePanel";
import IconToolbar from "@/components/IconToolbar";
import BestSpotsResults from "@/components/BestSpotsResults";
import SiteHeader, { type MapFamilyPageId } from "@/components/SiteHeader";
import { BasemapId, DEFAULT_BASEMAP } from "@/lib/basemapStyles";
import { ColorStyleId, DEFAULT_COLOR_STYLE } from "@/lib/colorStyles";
import { DarkSkyPlace } from "@/lib/darkSkyPlaces";
import { WeatherOverlayId, DEFAULT_WEATHER_OVERLAY } from "@/lib/weatherOverlay";
import type { RankedSpot } from "@/lib/bestSpots";

export type HomeMapExperienceProps = {
  // Lets keyword-landing variants of this same map experience (e.g.
  // /bortle-scale-map) swap in their own H1, hero subheading, legend title,
  // and FAQ content while sharing every bit of interactive map behavior with
  // the home page.
  heroTitle?: string;
  heroSubtitle?: string;
  legendNamespace?: string;
  infoPanelNamespace?: string;
  infoPanelGrouped?: boolean;
  // Which map-family page this render IS -- undefined on the home page
  // itself (SiteHeader then shows all three in "其他地图" with no "back to
  // light pollution map" link, since we're already there), set on the
  // bortle-scale-map/dark-sky-map landing pages that also share this
  // component. Every page rendering HomeMapExperience is part of the map
  // family, so showOtherMapsMenu itself is always on -- no separate prop
  // needed for that.
  currentMapPage?: MapFamilyPageId;
};

export default function HomeMapExperience({
  heroTitle,
  heroSubtitle,
  legendNamespace,
  infoPanelNamespace,
  infoPanelGrouped,
  currentMapPage,
}: HomeMapExperienceProps) {
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
  const [bestSpots, setBestSpots] = useState<RankedSpot[] | null>(null);

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
      <SiteHeader title={heroTitle} subtitle={heroSubtitle} showOtherMapsMenu currentMapPage={currentMapPage} />
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
        bestSpots={bestSpots}
        onBestSpotClick={(spot) => {
          setSelectedDarkSkyPlace(null);
          setSelectedLocation({ lat: spot.lat, lng: spot.lng });
        }}
      />
      <SearchBar onSelect={handleSelect} />
      <Legend colorStyle={colorStyle} namespace={legendNamespace} />
      <InfoPanel namespace={infoPanelNamespace} grouped={infoPanelGrouped} />
      <IconToolbar
        mapRef={mapRef}
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
        onBestSpotsFound={setBestSpots}
        onSelectHistoryLocation={(lat, lng) => {
          setSelectedDarkSkyPlace(null);
          setSelectedLocation({ lat, lng });
          mapRef.current?.flyTo({ lat, lng, zoom: 10 });
        }}
      />
      {selectedDarkSkyPlace ? (
        <DarkSkyPlacePanel place={selectedDarkSkyPlace} onClose={() => setSelectedDarkSkyPlace(null)} />
      ) : (
        <LocationDetailPanel
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onBestSpotsFound={setBestSpots}
        />
      )}
      {bestSpots && bestSpots.length > 0 && (
        <BestSpotsResults
          spots={bestSpots}
          onClose={() => setBestSpots(null)}
          onSelectSpot={(lat, lng) => {
            setSelectedDarkSkyPlace(null);
            setSelectedLocation({ lat, lng });
          }}
        />
      )}
      </div>
    </main>
  );
}
