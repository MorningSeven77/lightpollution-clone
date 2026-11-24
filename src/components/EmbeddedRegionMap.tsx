"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Map, { MapHandle, SelectedLocation } from "@/components/Map";
import SearchBar, { GeocodeResult } from "@/components/SearchBar";
import LocationDetailPanel from "@/components/LocationDetailPanel";
import DarkSkyPlacePanel from "@/components/DarkSkyPlacePanel";
import { BasemapId, DEFAULT_BASEMAP } from "@/lib/basemapStyles";
import { ColorStyleId, DEFAULT_COLOR_STYLE } from "@/lib/colorStyles";
import { DarkSkyPlace } from "@/lib/darkSkyPlaces";
import { DEFAULT_WEATHER_OVERLAY } from "@/lib/weatherOverlay";
import type { RankedSpot } from "@/lib/bestSpots";
import type { MapView } from "@/lib/urlState";

export default function EmbeddedRegionMap({ initialView }: { initialView: MapView }) {
  const t = useTranslations("locationSearch");
  const tGuides = useTranslations("guides");
  const mapRef = useRef<MapHandle>(null);
  const [basemap] = useState<BasemapId>(DEFAULT_BASEMAP);
  const [colorStyle] = useState<ColorStyleId>(DEFAULT_COLOR_STYLE);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<DarkSkyPlace | null>(null);
  const [bestSpots, setBestSpots] = useState<RankedSpot[] | null>(null);
  const [view, setView] = useState<MapView>(initialView);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(false);

  const flyTo = (next: MapView) => {
    setView(next);
    mapRef.current?.flyTo(next);
  };

  const handleSelect = (result: GeocodeResult) => {
    setSelectedPlace(null);
    setSelectedLocation({ lat: result.lat, lng: result.lng });
    flyTo({ lat: result.lat, lng: result.lng, zoom: 8 });
  };

  const locate = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoError(true);
      return;
    }
    setLocating(true);
    setGeoError(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude, zoom: 8 };
        setSelectedPlace(null);
        setSelectedLocation({ lat: next.lat, lng: next.lng });
        flyTo(next);
        setLocating(false);
      },
      () => {
        setGeoError(true);
        setLocating(false);
      },
      { timeout: 8000 },
    );
  };

  const fullMapHref = `/?lat=${view.lat.toFixed(4)}&lng=${view.lng.toFixed(4)}&zoom=${view.zoom.toFixed(2)}`;

  return (
    <div>
      <div className="relative h-[55vh] min-h-[320px] overflow-hidden rounded-lg border border-white/10 md:h-[70vh]">
        <Map
          ref={mapRef}
          initialView={initialView}
          basemap={basemap}
          colorStyle={colorStyle}
          opacity={75}
          visible
          selectedLocation={selectedLocation}
          onMapClick={(lat, lng) => {
            setSelectedPlace(null);
            setSelectedLocation({ lat, lng });
          }}
          showDarkSkyPlaces
          onDarkSkyPlaceClick={(place) => {
            setSelectedLocation(null);
            setSelectedPlace(place);
          }}
          showAurora={false}
          showTerminator={false}
          weatherOverlay={DEFAULT_WEATHER_OVERLAY}
          bestSpots={bestSpots}
          onBestSpotClick={(spot) => {
            setSelectedPlace(null);
            setSelectedLocation({ lat: spot.lat, lng: spot.lng });
          }}
        />
        <SearchBar onSelect={handleSelect} />
        <button
          type="button"
          onClick={locate}
          className="absolute bottom-4 left-4 z-10 rounded-md border border-white/10 bg-zinc-900/90 px-3 py-2 text-xs text-zinc-100 shadow-lg backdrop-blur hover:bg-zinc-800"
        >
          {locating ? t("locatingLabel") : t("useMyLocation")}
        </button>
        {geoError && (
          <p className="absolute bottom-14 left-4 z-10 max-w-xs rounded-md bg-zinc-900/90 px-2 py-1 text-xs text-red-300">
            {t("geolocationError")}
          </p>
        )}
        {selectedPlace ? (
          <DarkSkyPlacePanel place={selectedPlace} onClose={() => setSelectedPlace(null)} />
        ) : (
          <LocationDetailPanel
            location={selectedLocation}
            onClose={() => setSelectedLocation(null)}
            onBestSpotsFound={setBestSpots}
            className="max-h-[calc(100%-6.5rem)]"
          />
        )}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">{tGuides("mapCaption")}</p>
      <Link href={fullMapHref} className="mt-2 inline-block text-xs text-blue-400 hover:text-blue-300">
        {tGuides("openFullMap")}
      </Link>
    </div>
  );
}
