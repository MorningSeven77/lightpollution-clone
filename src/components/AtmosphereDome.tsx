"use client";

import { useMemo } from "react";
import { BackSide, BufferAttribute, Color, SphereGeometry } from "three";

// Comfortably inside the Canvas's far=10 clip plane (see StarMapCanvas.tsx)
// and well beyond the celestial content, which sits on/near the unit
// sphere (radius 1 -- see coordinates.ts). Unlike the ground silhouette
// this project briefly had (which had to be CLOSER than the celestial
// content to occlude it, a hard-won depth-order lesson from that
// component's history), this dome is meant to sit BEHIND everything as a
// pure backdrop -- it must be the FARTHER of the two surfaces, so normal
// depth testing lets every star/planet/DSO render in front of it, exactly
// like the flat `<color attach="background">` clear color this replaces
// always did.
const DOME_RADIUS = 8;

type AtmosphereDomeProps = { skyColor: string };

// A gradient upgrade of the flat single-color background this feature
// started with: adds a VIEW-DIRECTION dimension (darker near zenith/nadir,
// lighter/hazier near the horizon) on top of the existing TIME-OF-DAY
// dimension (`skyColor`, driven by the sun's real elevation -- see
// skyColor.ts) that was already there. Reuses the same per-vertex-color
// gradient technique the (now-removed) ground silhouette validated working
// well in a real browser, just applied to a full sphere instead of a
// hemisphere.
//
// Deliberately a FULL sphere, not just the upper (sky) hemisphere: there's
// no ground silhouette anymore to visually conflict with the lower half,
// and having "looking down" also fade toward the same darker tone as
// "looking up" is a reasonable, simple symmetric approximation rather than
// inventing a third color stop for a ground plane this component has
// nothing to do with.
//
// Known simplification: zenith/horizon colors are both derived from the
// SAME base `skyColor` via a pure lightness/saturation offset (no
// independent hue shift) -- a real sunset sky is warm near the horizon AND
// distinctly blue at zenith at the same moment, which this can't reproduce
// (its "zenith" during a sunset just comes out as a darker version of the
// same orange, not blue). Doing that properly would need a second,
// independently-tracked "zenith color" stops table alongside skyColor.ts's
// existing one, roughly doubling this feature's color-model surface for a
// refinement that's cosmetic, not something asked for -- skipped in favor
// of staying close to skyColor.ts's existing single-source-of-truth design.
export default function AtmosphereDome({ skyColor }: AtmosphereDomeProps) {
  const geometry = useMemo(() => {
    const geo = new SphereGeometry(DOME_RADIUS, 48, 32);
    const position = geo.attributes.position;
    const colors = new Float32Array(position.count * 3);

    const base = new Color(skyColor);
    const zenithColor = base.clone().offsetHSL(0, 0.05, -0.18);
    const horizonColor = base.clone().offsetHSL(0, -0.08, 0.14);

    const vertexColor = new Color();
    for (let i = 0; i < position.count; i++) {
      // y ranges from -DOME_RADIUS (nadir) to +DOME_RADIUS (zenith) --
      // taking its absolute value normalized to 0..1 makes the gradient
      // symmetric above and below the horizon (t=0 exactly at the
      // horizon, t=1 at both poles).
      const t = Math.min(Math.abs(position.getY(i)) / DOME_RADIUS, 1);
      vertexColor.copy(horizonColor).lerp(zenithColor, t);
      colors[i * 3] = vertexColor.r;
      colors[i * 3 + 1] = vertexColor.g;
      colors[i * 3 + 2] = vertexColor.b;
    }
    geo.setAttribute("color", new BufferAttribute(colors, 3));
    return geo;
  }, [skyColor]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors side={BackSide} />
    </mesh>
  );
}
