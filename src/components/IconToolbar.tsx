"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { MapHandle } from "@/components/Map";
import type { RankedSpot } from "@/lib/bestSpots";
import type { BasemapId } from "@/lib/basemapStyles";
import type { ColorStyleId } from "@/lib/colorStyles";
import type { WeatherOverlayId } from "@/lib/weatherOverlay";
import MoonPhasePanel from "@/components/MoonPhasePanel";
import LocationHistoryPanel from "@/components/LocationHistoryPanel";
import BestSpotsSearchModal from "@/components/BestSpotsSearchModal";
import GoldenHourCalculator from "@/components/GoldenHourCalculator";
import MapControls from "@/components/MapControls";

type ActivePopup = "moonPhase" | "goldenHour" | "history" | "mapControls" | "bestSpots" | null;

// Shared row of quick-access icon buttons, docked top-right (same corner as
// the settings panel below it). Each button gets a hover tooltip instead of
// a label, matching the reference site's icon-only toolbar. Dropdowns/popups
// anchor to each button's right edge (not centered) so none of them can spill
// off the right side of the viewport this close to the edge.
function ToolbarIconButton({
  onClick,
  active,
  ariaLabel,
  tooltip,
  children,
}: {
  onClick?: () => void;
  active?: boolean;
  ariaLabel: string;
  tooltip: string;
  children: ReactNode;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={active}
        className={`flex items-center justify-center rounded-md border border-white/10 p-2 text-zinc-100 shadow-lg backdrop-blur hover:bg-zinc-800 ${
          active ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-900/90"
        }`}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {tooltip}
      </span>
    </div>
  );
}

function GoldenHourButton({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("goldenHour");

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label={t("navLabel")}
        className={`flex items-center justify-center rounded-md border border-white/10 p-2 text-zinc-100 shadow-lg backdrop-blur hover:bg-zinc-800 ${
          open ? "bg-zinc-800" : "bg-zinc-900/90"
        }`}
      >
        <span className="text-base leading-none">☀️</span>
      </button>

      {!open && (
        <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {t("navLabel")}
        </span>
      )}

      {open && (
        // Bounded popup, not a full-page takeover — wide enough for the
        // compass + time cards side by side, capped height with its own
        // scroll so it never grows past the viewport.
        <div className="absolute right-0 top-full z-20 mt-2 max-h-[80vh] w-[min(90vw,32rem)] overflow-y-auto rounded-md border border-white/10 bg-zinc-900/95 p-3 text-sm text-zinc-100 shadow-lg backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">{t("navLabel")}</h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={t("closeAria")}
              className="text-zinc-400 hover:text-zinc-100"
            >
              ✕
            </button>
          </div>
          <GoldenHourCalculator />
        </div>
      )}
    </div>
  );
}

export type IconToolbarProps = {
  mapRef: React.RefObject<MapHandle | null>;
  basemap: BasemapId;
  onBasemapChange: (id: BasemapId) => void;
  colorStyle: ColorStyleId;
  onColorStyleChange: (id: ColorStyleId) => void;
  opacity: number;
  onOpacityChange: (value: number) => void;
  visible: boolean;
  onVisibleChange: (value: boolean) => void;
  showDarkSkyPlaces: boolean;
  onShowDarkSkyPlacesChange: (value: boolean) => void;
  showAurora: boolean;
  onShowAuroraChange: (value: boolean) => void;
  showTerminator: boolean;
  onShowTerminatorChange: (value: boolean) => void;
  weatherOverlay: WeatherOverlayId;
  onWeatherOverlayChange: (value: WeatherOverlayId) => void;
  onBestSpotsFound: (spots: RankedSpot[]) => void;
  onSelectHistoryLocation: (lat: number, lng: number) => void;
};

export default function IconToolbar({
  mapRef,
  basemap,
  onBasemapChange,
  colorStyle,
  onColorStyleChange,
  opacity,
  onOpacityChange,
  visible,
  onVisibleChange,
  showDarkSkyPlaces,
  onShowDarkSkyPlacesChange,
  showAurora,
  onShowAuroraChange,
  showTerminator,
  onShowTerminatorChange,
  weatherOverlay,
  onWeatherOverlayChange,
  onBestSpotsFound,
  onSelectHistoryLocation,
}: IconToolbarProps) {
  const tMapControls = useTranslations("mapControls");
  const tBestSpots = useTranslations("bestSpots");
  const [bestSpotsOrigin, setBestSpotsOrigin] = useState<{ lat: number; lng: number } | null>(null);
  // Only one of these floating popups/panels can be open at a time — opening
  // one closes whichever was open before, so they never stack on top of each
  // other. Map Controls starts open by default (its original standalone
  // behavior, preserved here).
  const [activePopup, setActivePopup] = useState<ActivePopup>("mapControls");
  const makeOpenChangeHandler = (id: Exclude<ActivePopup, null>) => (open: boolean) => setActivePopup(open ? id : null);

  return (
    <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
      <ToolbarIconButton
        onClick={() => onShowDarkSkyPlacesChange(!showDarkSkyPlaces)}
        active={showDarkSkyPlaces}
        ariaLabel={tMapControls("darkSkyPlacesLabel")}
        tooltip={tMapControls("darkSkyPlacesLabel")}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M10 2.5l2.19 4.44 4.9.71-3.55 3.46.84 4.88L10 13.6l-4.38 2.39.84-4.88L2.91 7.65l4.9-.71L10 2.5Z" />
        </svg>
      </ToolbarIconButton>

      <ToolbarIconButton
        onClick={() => onShowAuroraChange(!showAurora)}
        active={showAurora}
        ariaLabel={tMapControls("auroraLabel")}
        tooltip={tMapControls("auroraLabel")}
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="h-5 w-5">
          <path d="M2 12.5c1.5-2.5 3-2.5 4.5 0s3 2.5 4.5 0 3-2.5 4.5 0" />
          <path d="M2 7.5c1.5-2.5 3-2.5 4.5 0s3 2.5 4.5 0 3-2.5 4.5 0" opacity="0.5" />
        </svg>
      </ToolbarIconButton>

      <ToolbarIconButton
        onClick={() => onShowTerminatorChange(!showTerminator)}
        active={showTerminator}
        ariaLabel={tMapControls("terminatorLabel")}
        tooltip={tMapControls("terminatorLabel")}
      >
        <svg viewBox="0 0 20 20" className="h-5 w-5">
          <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 2.75a7.25 7.25 0 0 1 0 14.5V2.75Z" fill="currentColor" />
        </svg>
      </ToolbarIconButton>

      <ToolbarIconButton
        onClick={() => {
          if (activePopup === "bestSpots") {
            setActivePopup(null);
            return;
          }
          setBestSpotsOrigin(mapRef.current?.getCenter() ?? null);
          setActivePopup("bestSpots");
        }}
        active={activePopup === "bestSpots"}
        ariaLabel={tBestSpots("triggerLabel")}
        tooltip={tBestSpots("triggerLabel")}
      >
        <span className="text-base leading-none">🔭</span>
      </ToolbarIconButton>

      <MoonPhasePanel open={activePopup === "moonPhase"} onOpenChange={makeOpenChangeHandler("moonPhase")} />

      <GoldenHourButton open={activePopup === "goldenHour"} onOpenChange={makeOpenChangeHandler("goldenHour")} />

      <LocationHistoryPanel
        open={activePopup === "history"}
        onOpenChange={makeOpenChangeHandler("history")}
        onSelectLocation={onSelectHistoryLocation}
      />

      <MapControls
        open={activePopup === "mapControls"}
        onOpenChange={makeOpenChangeHandler("mapControls")}
        basemap={basemap}
        onBasemapChange={onBasemapChange}
        colorStyle={colorStyle}
        onColorStyleChange={onColorStyleChange}
        opacity={opacity}
        onOpacityChange={onOpacityChange}
        visible={visible}
        onVisibleChange={onVisibleChange}
        showDarkSkyPlaces={showDarkSkyPlaces}
        onShowDarkSkyPlacesChange={onShowDarkSkyPlacesChange}
        showAurora={showAurora}
        onShowAuroraChange={onShowAuroraChange}
        showTerminator={showTerminator}
        onShowTerminatorChange={onShowTerminatorChange}
        weatherOverlay={weatherOverlay}
        onWeatherOverlayChange={onWeatherOverlayChange}
      />

      {activePopup === "bestSpots" && bestSpotsOrigin && (
        <BestSpotsSearchModal
          lat={bestSpotsOrigin.lat}
          lng={bestSpotsOrigin.lng}
          onResults={onBestSpotsFound}
          onClose={() => setActivePopup(null)}
        />
      )}
    </div>
  );
}
