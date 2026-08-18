"use client";

import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, ShaderMaterial } from "three";
import { buildStarFieldGeometry } from "@/lib/starmap/starCatalogLoader";

// PointsMaterial has no per-vertex size support (only a single uniform
// `size`), so a small custom shader is the only way to make brighter stars
// render bigger than dimmer ones -- not a "quality upgrade" over the
// built-in material, a hard capability gap it doesn't have.
const VERTEX_SHADER = /* glsl */ `
  attribute float size;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Soft circular point (discard outside a circle, fade at the edge) instead
// of GL's default square point sprite. smoothstep(edge0, edge1, x) is
// undefined behavior per the GLSL ES 1.00 spec when edge0 >= edge1 (the
// version Three.js compiles ShaderMaterial to unless glslVersion:GLSL3 is
// set) -- ascending-order smoothstep(0.0, 0.5, dist) then inverted (1.0 -
// ...) gives the same "1 at center, 0 at edge" falloff without relying on
// that undefined case, which some GPU drivers resolve differently than
// others (plausibly rendering every point fully transparent).
const FRAGMENT_SHADER = /* glsl */ `
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    gl_FragColor = vec4(vec3(1.0), alpha);
  }
`;

// Renders the static (never-rotated-itself) naked-eye star field. This is a
// child of StarMapCanvas's rotating sky group -- the group's rotation
// (driven by local sidereal time + observer latitude, see coordinates.ts)
// is what makes the sky appear to turn, not anything in this component.
export default function StarField() {
  const geometry = useMemo(() => {
    const { positions, sizes, count } = buildStarFieldGeometry();
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.setAttribute("size", new Float32BufferAttribute(sizes, 1));
    geo.computeBoundingSphere();
    void count;
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  return <points geometry={geometry} material={material} />;
}
