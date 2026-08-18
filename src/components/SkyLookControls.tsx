"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { altAzToWorld } from "@/lib/starmap/coordinates";

const MIN_ALTITUDE_DEG = -5;
const MAX_ALTITUDE_DEG = 90;

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startAzimuth: number;
  startAltitude: number;
};

export type LookAtRequest = { azimuthDeg: number; altitudeDeg: number; nonce: number };

type SkyLookControlsProps = {
  // Set by the search feature (see StarMapCanvas.tsx) to snap the camera
  // to a specific object. `nonce` exists because selecting the SAME
  // object twice in a row (e.g. re-picking it from search after dragging
  // away) should still snap the view again even though azimuthDeg/
  // altitudeDeg would be identical to last time -- an object identity
  // (nonce) change is what the effect below actually watches for, not the
  // az/alt values themselves.
  lookAtRequest?: LookAtRequest | null;
};

// Renders nothing -- attaches native Pointer Events (unified mouse+touch)
// directly to the R3F canvas DOM element and drives the camera's look
// direction from drag deltas every frame. Not built on R3F's own
// raycasting pointer events (onPointerDown etc. as mesh props) because
// those only fire when the pointer hits a specific mesh's geometry; a
// full-canvas "look around" drag needs every pointer move over the canvas,
// not hit-testing against scene content.
export default function SkyLookControls({ lookAtRequest }: SkyLookControlsProps) {
  const { camera, gl } = useThree();
  const lookRef = useRef({ azimuthDeg: 0, altitudeDeg: 0 });
  const dragRef = useRef<DragState | null>(null);

  // Imperatively updates the shared ref (not React state -- lookRef is
  // read every frame by the useFrame below regardless) whenever a new
  // search selection comes in. Ordinary useEffect is fine here: this is
  // synchronizing with an external/imperative system (the camera-look
  // ref), not calling setState, so it isn't the
  // react-hooks/set-state-in-effect pattern this project has hit before.
  useEffect(() => {
    if (!lookAtRequest) return;
    lookRef.current = {
      azimuthDeg: ((lookAtRequest.azimuthDeg % 360) + 360) % 360,
      altitudeDeg: Math.min(Math.max(lookAtRequest.altitudeDeg, MIN_ALTITUDE_DEG), MAX_ALTITUDE_DEG),
    };
    // Drop any in-progress drag so it doesn't immediately fight the new
    // look direction on the next pointermove.
    dragRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only re-runs on nonce, not on azimuthDeg/altitudeDeg (see LookAtRequest's own doc comment on why identity, not value, is what matters here)
  }, [lookAtRequest?.nonce]);

  useEffect(() => {
    const el = gl.domElement;

    function handlePointerDown(e: PointerEvent) {
      el.setPointerCapture(e.pointerId);
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startAzimuth: lookRef.current.azimuthDeg,
        startAltitude: lookRef.current.altitudeDeg,
      };
    }

    function handlePointerMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || e.pointerId !== drag.pointerId) return;
      const deltaX = e.clientX - drag.startX;
      const deltaY = e.clientY - drag.startY;

      // "Look controls" (FPS mouse-look) feel, deliberately NOT a map-pan
      // feel: dragging right turns the view right (azimuth increases,
      // matching astronomy-engine's own clockwise-from-north convention --
      // see coordinates.ts), dragging up looks up (altitude increases).
      // Sensitivity is scaled so a drag across the full canvas width pans
      // ~180deg of azimuth, a reasonable starting feel.
      //
      // COULD NOT VISUALLY VERIFY the drag direction feels correct in this
      // build session -- this environment's browser pane never composites
      // frames (document.hidden stays true, the same known limitation
      // recorded in this project's CLAUDE.md for MapLibre), so R3F's
      // <Canvas> never even finishes mounting here. If dragging feels
      // inverted when actually tested, flip the sign of deltaX and/or
      // deltaY below.
      const degPerPixel = 180 / el.clientWidth;
      const nextAzimuth = drag.startAzimuth + deltaX * degPerPixel;
      lookRef.current.azimuthDeg = ((nextAzimuth % 360) + 360) % 360;
      lookRef.current.altitudeDeg = Math.min(
        Math.max(drag.startAltitude - deltaY * degPerPixel, MIN_ALTITUDE_DEG),
        MAX_ALTITUDE_DEG,
      );
    }

    function handlePointerUp(e: PointerEvent) {
      if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    }

    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerup", handlePointerUp);
    el.addEventListener("pointercancel", handlePointerUp);
    return () => {
      el.removeEventListener("pointerdown", handlePointerDown);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerup", handlePointerUp);
      el.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [gl]);

  // Cheap regardless of scene complexity -- one trig conversion + lookAt --
  // so it's fine to run unconditionally every frame, unlike the sky
  // group's coarse-interval LST rotation (see StarMapCanvas.tsx).
  useFrame(() => {
    const { azimuthDeg, altitudeDeg } = lookRef.current;
    camera.lookAt(altAzToWorld(altitudeDeg, azimuthDeg));
  });

  return null;
}
