"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import SiteHeader from "@/components/SiteHeader";
import StarMapControls from "@/components/StarMapControls";
import CelestialSearchField from "@/components/CelestialSearchField";
import { MIN_FOV_DEG, MAX_FOV_DEG } from "@/components/CameraZoomControls";
import { useStarMapClock } from "@/lib/starmap/useStarMapClock";
import { buildObserver } from "@/lib/starmap/observer";
import { computeLookAtTarget } from "@/lib/starmap/lookAtTarget";
import type { SearchResult } from "@/lib/starmap/searchIndex";
import type { LookAtRequest } from "@/components/SkyLookControls";
import type { PickedLocation } from "@/components/LocationSearchField";

// Default location (New York City) shown before the user searches, shares
// their own location, or arrives via a ?lat=&lng= link -- see
// StarMapPageContent's initial state below.
const DEFAULT_LOCATION: PickedLocation = { lat: 40.7128, lng: -74.006, placeName: "", source: "search" };
const DEFAULT_FOV_DEG = 70;
const ZOOM_BUTTON_STEP_DEG = 10;

function clampFov(fov: number): number {
  return Math.min(Math.max(fov, MIN_FOV_DEG), MAX_FOV_DEG);
}

// Safari (pre-16.4) only exposes the Fullscreen API under a webkit- prefix --
// these narrow, locally-scoped types let the fallback calls type-check
// without reaching for `any` or a third-party polyfill for two optional
// methods.
type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: () => void;
};
type FullscreenCapableDocument = Document & {
  webkitExitFullscreen?: () => void;
  webkitFullscreenElement?: Element | null;
};

// Classic astronomy-app "red-light" night-vision mode (Stellarium, SkySafari,
// etc. all have one): grayscale first strips every existing hue, sepia+
// hue-rotate then re-tints the resulting neutral tones toward red, saturate
// brings the red back up to a readable intensity, and brightness pulls the
// result down slightly so it doesn't glare. Applied via the CSS `filter`
// property (not a color/theme swap of each component) specifically because
// `filter` tints whatever is PAINTED inside the element, including the
// WebGL <canvas>'s own rendered pixels -- so the white stars/planets/text
// the canvas draws come out red too, not just the surrounding UI chrome,
// which is the actual point of a night-vision mode (nothing on screen
// should emit non-red light).
const NIGHT_MODE_FILTER = "grayscale(1) sepia(1) hue-rotate(320deg) saturate(6) brightness(0.85)";

// @react-three/fiber's <Canvas> creates a real WebGL context and uses
// browser-only APIs (ResizeObserver, requestAnimationFrame) during mount --
// it cannot run during Next.js server rendering, hence ssr:false here.
const StarMapCanvas = dynamic(() => import("@/components/StarMapCanvas"), {
  ssr: false,
  loading: () => <StarMapLoadingPlaceholder />,
});

function StarMapLoadingPlaceholder() {
  const t = useTranslations("starMap");
  return <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">{t("loadingCanvas")}</div>;
}

function parseLocationFromQuery(searchParams: URLSearchParams): PickedLocation | null {
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  // Number(null) is 0, not NaN -- checking the raw params for null FIRST is
  // required, otherwise a URL with no ?lat=&lng= at all (the normal case)
  // silently parses as valid (0, 0) coordinates instead of correctly
  // falling through to DEFAULT_LOCATION below. A real bug, caught while
  // debugging the sky-color feature: every star-map screenshot this
  // session's "0.00, 0.00" location readout was actually this bug, not a
  // camera-look-direction display as it was mistaken for at the time.
  if (latParam === null || lngParam === null) return null;
  const lat = Number(latParam);
  const lng = Number(lngParam);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng, placeName: "", source: "search" };
}

// Full-bleed layout, matching HomeMapExperience's own structure exactly
// (same `flex h-screen w-screen flex-col overflow-hidden` shell, header,
// then a `relative flex-1` content area with the canvas filling it via
// `absolute inset-0` and every control floating on top) -- this was
// previously a narrow centered column with a small boxed-in canvas below
// it; the reference site's own star map fills the whole viewport the same
// way its main map does, so this page's layout should match that, not
// read as a smaller, separate kind of page.
//
// Split into a Suspense-wrapped inner component because useSearchParams()
// requires it (same reason SiteHeader's own LanguageSwitcher is wrapped) --
// reads an optional ?lat=&lng= carried over from the main map's
// LocationDetailPanel "view in star map" link, falling back to
// DEFAULT_LOCATION when absent or out of range.
function StarMapPageContent() {
  const t = useTranslations("starMap");
  const clock = useStarMapClock();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState<PickedLocation>(() => parseLocationFromQuery(searchParams) ?? DEFAULT_LOCATION);
  const [lookAtRequest, setLookAtRequest] = useState<LookAtRequest | null>(null);
  const [fov, setFov] = useState(DEFAULT_FOV_DEG);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [showAtmosphere, setShowAtmosphere] = useState(false);
  const [showAzimuthalGrid, setShowAzimuthalGrid] = useState(false);
  const [showEquatorialGrid, setShowEquatorialGrid] = useState(false);

  // Fullscreens the content area (canvas + all its floating controls), not
  // the whole <main> -- SiteHeader falls outside the fullscreened element
  // and so is naturally hidden along with the browser chrome, while the
  // search/date/zoom panels stay visible and usable, matching what
  // stellarium-web.org's own fullscreen button does.
  useEffect(() => {
    const doc = document as FullscreenCapableDocument;
    function handleFullscreenChange() {
      const current = document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
      setIsFullscreen(current !== null && current === contentRef.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const doc = document as FullscreenCapableDocument;
    const current = document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
    if (current) {
      if (document.exitFullscreen) void document.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      return;
    }
    const el = contentRef.current as FullscreenCapableElement | null;
    if (!el) return;
    if (el.requestFullscreen) void el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  // Computes where the picked object is RIGHT NOW (given the current
  // clock/location) and hands that one-shot target down to
  // SkyLookControls -- doesn't continuously track the object afterward,
  // same "snap once" behavior a search "go to" feature typically has.
  // `nonce: Date.now()` guarantees picking the same object twice in a row
  // still re-triggers the snap (see LookAtRequest's own doc comment).
  const handleSearchSelect = (result: SearchResult) => {
    const observer = buildObserver(location.lat, location.lng);
    const target = computeLookAtTarget(result, clock.date, observer);
    setLookAtRequest({ ...target, nonce: Date.now() });
  };

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      {/* The filter is applied separately here and on the content div below
          (not once on <main>) because a CSS filter set on an ancestor does
          NOT carry over onto a descendant once that descendant becomes the
          Fullscreen element -- the fullscreened element paints in its own
          top-layer, detached from its ancestors' filter/transform/opacity
          effects. Setting it directly on both elements keeps night mode
          working whether or not the canvas area is currently fullscreened. */}
      <div style={nightMode ? { filter: NIGHT_MODE_FILTER } : undefined}>
        <SiteHeader title={t("pageTitle")} subtitle={t("pageSubtitle")} showOtherMapsMenu currentMapPage="star-map" />
      </div>
      <div
        ref={contentRef}
        className="relative flex-1 bg-zinc-950"
        style={nightMode ? { filter: NIGHT_MODE_FILTER } : undefined}
      >
        <div className="group absolute right-4 top-16 z-10">
          <button
            type="button"
            onClick={() => setNightMode((v) => !v)}
            aria-label={t("nightModeLabel")}
            aria-pressed={nightMode}
            className={`rounded-md border border-white/10 px-3 py-2 text-sm shadow-lg backdrop-blur hover:bg-zinc-800 ${
              nightMode ? "bg-red-900/70 text-red-200" : "bg-zinc-900/90 text-zinc-300"
            }`}
          >
            👁️
          </button>
          {/* Tooltip anchors to the button's LEFT edge (not below it) --
              this whole cluster is a vertical stack of buttons spaced only
              48px apart (top-4/top-16/top-28/...), too tight for a
              below-anchored tooltip to fit without overlapping the next
              button down (a real bug the user caught: the night-mode
              tooltip was rendering on top of the azimuthal-grid button
              directly beneath it). Opening sideways into the open space to
              the left avoids colliding with any neighboring button
              regardless of how many buttons end up in this stack. */}
          <span className="pointer-events-none absolute right-full top-1/2 z-20 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {t("nightModeLabel")}
          </span>
        </div>

        <div className="group absolute right-4 top-28 z-10">
          <button
            type="button"
            onClick={() => setShowAtmosphere((v) => !v)}
            aria-label={t("atmosphereLabel")}
            aria-pressed={showAtmosphere}
            className={`rounded-md border border-white/10 px-3 py-2 text-sm shadow-lg backdrop-blur hover:bg-zinc-800 ${
              showAtmosphere ? "bg-sky-900/70 text-sky-200" : "bg-zinc-900/90 text-zinc-300"
            }`}
          >
            🌅
          </button>
          <span className="pointer-events-none absolute right-full top-1/2 z-20 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {t("atmosphereLabel")}
          </span>
        </div>

        <div className="group absolute right-4 top-40 z-10">
          <button
            type="button"
            onClick={() => setShowAzimuthalGrid((v) => !v)}
            aria-label={t("azimuthalGridLabel")}
            aria-pressed={showAzimuthalGrid}
            className={`rounded-md border border-white/10 px-3 py-2 text-sm shadow-lg backdrop-blur hover:bg-zinc-800 ${
              showAzimuthalGrid ? "bg-emerald-900/70 text-emerald-200" : "bg-zinc-900/90 text-zinc-300"
            }`}
          >
            🧭
          </button>
          <span className="pointer-events-none absolute right-full top-1/2 z-20 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {t("azimuthalGridLabel")}
          </span>
        </div>

        <div className="group absolute right-4 top-52 z-10">
          <button
            type="button"
            onClick={() => setShowEquatorialGrid((v) => !v)}
            aria-label={t("equatorialGridLabel")}
            aria-pressed={showEquatorialGrid}
            className={`rounded-md border border-white/10 px-3 py-2 text-sm shadow-lg backdrop-blur hover:bg-zinc-800 ${
              showEquatorialGrid ? "bg-rose-900/70 text-rose-200" : "bg-zinc-900/90 text-zinc-300"
            }`}
          >
            🌐
          </button>
          <span className="pointer-events-none absolute right-full top-1/2 z-20 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {t("equatorialGridLabel")}
          </span>
        </div>

        <StarMapCanvas
          date={clock.date}
          latDeg={location.lat}
          lngDeg={location.lng}
          lookAtRequest={lookAtRequest}
          fov={fov}
          onFovChange={setFov}
          showAzimuthalGrid={showAzimuthalGrid}
          showEquatorialGrid={showEquatorialGrid}
          showAtmosphere={showAtmosphere}
        />

        <div className="group absolute right-4 top-4 z-10">
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? t("fullscreenExitAria") : t("fullscreenEnterAria")}
            className="rounded-md border border-white/10 bg-zinc-900/90 px-3 py-2 text-sm text-zinc-300 shadow-lg backdrop-blur hover:bg-zinc-800"
          >
            ⛶
          </button>
          <span className="pointer-events-none absolute right-full top-1/2 z-20 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {t("fullscreenLabel")}
          </span>
        </div>

        <div className="absolute left-4 top-16 z-10 w-full max-w-xs rounded-md border border-white/10 bg-zinc-900/90 p-3 shadow-lg backdrop-blur sm:max-w-sm">
          <div className="mb-2">
            <CelestialSearchField onSelect={handleSearchSelect} />
          </div>
          <StarMapControls clock={clock} location={location} onLocationChange={setLocation} />
        </div>

        <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-xs text-zinc-400">{t("dragHint")}</p>

        {/* Mouse-wheel zoom (see CameraZoomControls) covers desktop; these
            buttons are the touch/click-accessible equivalent, positioned
            like a typical map's zoom control (bottom-right, matching
            Map.tsx's own MapLibre zoom buttons on the main page). */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col items-center gap-1">
          <span className="rounded-md border border-white/10 bg-zinc-900/90 px-2 py-1 text-[10px] text-zinc-400 shadow-lg backdrop-blur">
            {t("fovLabel", { fov: Math.round(fov) })}
          </span>
          <div className="flex flex-col overflow-hidden rounded-md border border-white/10 bg-zinc-900/90 shadow-lg backdrop-blur">
            <button
              type="button"
              onClick={() => setFov((f) => clampFov(f - ZOOM_BUTTON_STEP_DEG))}
              aria-label={t("zoomInAria")}
              className="px-3 py-2 text-sm hover:bg-zinc-800"
            >
              +
            </button>
            <div className="border-t border-white/10" />
            <button
              type="button"
              onClick={() => setFov((f) => clampFov(f + ZOOM_BUTTON_STEP_DEG))}
              aria-label={t("zoomOutAria")}
              className="px-3 py-2 text-sm hover:bg-zinc-800"
            >
              −
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function StarMapPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-zinc-950" />}>
      <StarMapPageContent />
    </Suspense>
  );
}
