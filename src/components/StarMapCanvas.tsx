"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Canvas } from "@react-three/fiber";
import type { Group } from "three";
import StarField from "@/components/StarField";
import SkyLookControls, { type LookAtRequest } from "@/components/SkyLookControls";
import CameraZoomControls from "@/components/CameraZoomControls";
import SolarSystemBodies from "@/components/SolarSystemBodies";
import ConstellationLines from "@/components/ConstellationLines";
import DeepSkyObjects from "@/components/DeepSkyObjects";
import AzimuthalGrid from "@/components/AzimuthalGrid";
import EquatorialGrid from "@/components/EquatorialGrid";
import AtmosphereDome from "@/components/AtmosphereDome";
import { buildSkyRotation } from "@/lib/starmap/coordinates";
import { localSiderealTimeHours } from "@/lib/starmap/observer";
import { skyColorForSunAltitude } from "@/lib/starmap/skyColor";
import { computeSolarPosition } from "@/lib/sunPosition";

export type StarMapCanvasProps = {
  date: Date;
  latDeg: number;
  lngDeg: number;
  lookAtRequest?: LookAtRequest | null;
  fov: number;
  onFovChange: (fov: number) => void;
  showAzimuthalGrid: boolean;
  showEquatorialGrid: boolean;
  showAtmosphere: boolean;
};

// This feature's original, always-on background color, before the sky-color/
// atmosphere-dome features existed -- now the OFF state for the atmosphere
// toggle, matching the toggle's own intent: "no atmosphere" means a plain,
// unchanging black night sky, not just the gradient dome with a flat
// (still sun-elevation-dependent) color swapped in for it.
const DEFAULT_NIGHT_COLOR = "#03030a";

// Applies the LST+latitude rotation (coordinates.ts's one hand-rolled bit of
// astronomical math) to everything inside it -- stars, and later
// constellations/planets, all as children of this single group so they
// share one identical transform and can never drift apart (see
// SolarSystemBodies.tsx's own comment on this once it exists).
//
// Recomputes via a plain useEffect keyed on [date, latDeg, lngDeg], not a
// useFrame + elapsed-time throttle: since useStarMapClock only advances
// `date` about once per real second while live (real sidereal drift is
// ~0.004deg/s -- see the star-map plan doc's update-cadence table, far
// slower than that), the prop's own change frequency already IS the
// correct coarse cadence, and any manual date/time/location edit
// re-renders this immediately for free, with no separate "immediate vs.
// coarse" branching needed. The mutated quaternion is picked up on the
// next frame because Canvas's default frameloop="always" renders
// unconditionally every tick, not just in response to R3F-tracked state.
type SkyGroupProps = { date: Date; latDeg: number; lngDeg: number; children: ReactNode };

function SkyGroup({ date, latDeg, lngDeg, children }: SkyGroupProps) {
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    const lst = localSiderealTimeHours(date, lngDeg);
    groupRef.current.quaternion.copy(buildSkyRotation(lst, latDeg));
  }, [date, latDeg, lngDeg]);

  return <group ref={groupRef}>{children}</group>;
}

// The only file that touches @react-three/fiber's <Canvas> -- it creates a
// real WebGL context, so this component is always loaded via
// next/dynamic(..., { ssr: false }) from page.tsx, never rendered on the
// server.
//
// Camera sits at the world origin (the observer) with identity rotation
// initially; SkyLookControls takes over from there. In this feature's
// world-frame convention (+Y=zenith, +Z=south, +X=east -- see
// coordinates.ts), facing -Z (the camera's default) means facing due north
// at the horizon.
export default function StarMapCanvas({
  date,
  latDeg,
  lngDeg,
  lookAtRequest,
  fov,
  onFovChange,
  showAzimuthalGrid,
  showEquatorialGrid,
  showAtmosphere,
}: StarMapCanvasProps) {
  const t = useTranslations("starMap");
  const [contextLost, setContextLost] = useState(false);

  // Recomputed on the same [date, latDeg, lngDeg] cadence as SkyGroup's own
  // sidereal rotation (see that component's comment on why the coarse,
  // ~once-per-second-while-live prop update frequency is already the right
  // cadence for this) -- pure derived render data, so useMemo, not
  // useEffect+setState (this project's own react-hooks/set-state-in-effect
  // history, see CLAUDE.md).
  const skyColor = useMemo(
    () => skyColorForSunAltitude(computeSolarPosition(date, latDeg, lngDeg).elevationDeg),
    [date, latDeg, lngDeg],
  );

  return (
    // absolute inset-0 to fill the page's `relative flex-1` content area
    // edge-to-edge, same convention Map.tsx's own root div uses for the
    // main light-pollution map.
    <div className="absolute inset-0">
      {/* antialias:false + capped dpr trade a bit of edge/point crispness
          for meaningfully less GPU memory/bandwidth per frame -- confirmed
          via chrome://gpu that a real user's WebGL context loss happens on
          an Intel integrated GPU (shared system RAM, much tighter resource
          budget than a discrete GPU), and MSAA plus an uncapped, possibly
          >1 devicePixelRatio framebuffer are two of the more common levers
          for real-world GPU memory pressure on that class of hardware. */}
      <Canvas
        camera={{ position: [0, 0, 0], fov, near: 0.01, far: 10 }}
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        style={{ touchAction: "none" }}
        onCreated={({ gl }) => {
          // The browser reclaims a tab's WebGL context under GPU memory
          // pressure -- most commonly for backgrounded/non-visible tabs,
          // but it's the browser's own resource policy, not something
          // this app controls or can prevent. Three.js's WebGLRenderer
          // already logs this to console on its own (that's the "Context
          // Lost"/"Context Restored" messages); these listeners just
          // surface it as a real UI message instead of leaving a blank
          // canvas with no explanation, and Three.js automatically
          // re-uploads geometry/textures on its own once
          // 'webglcontextrestored' fires, so no manual re-render call is
          // needed here -- only the loading-state UI needs updating.
          const canvas = gl.domElement;
          canvas.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setContextLost(true);
          });
          canvas.addEventListener("webglcontextrestored", () => setContextLost(false));
        }}
      >
        {showAtmosphere ? <AtmosphereDome skyColor={skyColor} /> : <color attach="background" args={[DEFAULT_NIGHT_COLOR]} />}
        <SkyLookControls lookAtRequest={lookAtRequest} />
        <CameraZoomControls fov={fov} onFovChange={onFovChange} />
        {/* Sibling of SkyGroup, not a child -- see AzimuthalGrid.tsx's own
            comment on why it must stay fixed in the observer's local
            alt/az frame instead of rotating along with the sky. */}
        {showAzimuthalGrid && <AzimuthalGrid />}
        <SkyGroup date={date} latDeg={latDeg} lngDeg={lngDeg}>
          <StarField />
          <ConstellationLines />
          <DeepSkyObjects />
          <SolarSystemBodies date={date} latDeg={latDeg} lngDeg={lngDeg} />
          {showEquatorialGrid && <EquatorialGrid />}
        </SkyGroup>
      </Canvas>
      {contextLost && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center text-sm text-zinc-300">
          {t("contextLostMessage")}
        </div>
      )}
    </div>
  );
}
