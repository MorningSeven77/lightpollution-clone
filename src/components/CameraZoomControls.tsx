"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export const MIN_FOV_DEG = 10;
export const MAX_FOV_DEG = 120;
const WHEEL_SENSITIVITY = 0.05; // degrees of FOV change per pixel of wheel delta

export type CameraZoomControlsProps = {
  fov: number;
  onFovChange: (fov: number) => void;
};

// Renders nothing -- a controlled-component pattern for camera zoom (like
// <input value onChange>), symmetric with SkyLookControls' lookAtRequest:
// `fov` lives in page.tsx (so +/- buttons outside the canvas can drive it
// too), this component just keeps the live THREE.PerspectiveCamera in
// sync with that prop, AND drives the same prop via mouse wheel from
// inside the canvas.
//
// Changing camera.fov alone has no visual effect in three.js until
// updateProjectionMatrix() is called -- easy to forget since nothing
// errors if you skip it, the camera just silently doesn't zoom.
//
// Wheel direction follows the near-universal "scroll up = zoom in" map/
// photo-viewer convention: deltaY is negative when scrolling up, and
// smaller FOV = more magnified/zoomed in, so `fov + deltaY * sensitivity`
// naturally decreases FOV on scroll-up without an extra sign flip.
export default function CameraZoomControls({ fov, onFovChange }: CameraZoomControlsProps) {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (!("fov" in camera)) return; // guards the (here, never-taken) OrthographicCamera branch of R3F's camera union type
    // The lint rule's general "don't mutate a hook's return value" heuristic
    // doesn't apply to useThree()'s camera: it's a live THREE.PerspectiveCamera
    // instance, an inherently mutable, imperative Three.js object (not React
    // state), and direct property mutation + updateProjectionMatrix() is the
    // documented, standard way to change it in react-three-fiber -- the exact
    // same pattern StarMapCanvas.tsx's SkyGroup already uses via
    // groupRef.current.quaternion, just reached through useThree() here
    // instead of a local useRef.
    // eslint-disable-next-line react-hooks/immutability
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [camera, fov]);

  useEffect(() => {
    const el = gl.domElement;
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      const next = Math.min(Math.max(fov + e.deltaY * WHEEL_SENSITIVITY, MIN_FOV_DEG), MAX_FOV_DEG);
      onFovChange(next);
    }
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [gl, fov, onFovChange]);

  return null;
}
