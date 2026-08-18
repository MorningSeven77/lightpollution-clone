"use client";

import { useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { BufferGeometry, CanvasTexture, Float32BufferAttribute } from "three";
import { buildConstellationRenderData } from "@/lib/starmap/constellationLoader";

const LINE_COLOR = "#5b7ba8";
const LINE_OPACITY = 0.55;
const LABEL_COLOR = "#8fa8cc";
const LABEL_HEIGHT = 0.024; // world-space sprite height, unit-sphere scene
const LABEL_FONT_PX = 48; // resolution of the offscreen canvas text is drawn at, not world size
const LABEL_PADDING_PX = 10;

// Renders one constellation name as a small textured sprite instead of
// troika-three-text's real-time SDF glyphs. This is a deliberate swap, not
// the original design: troika-three-text (drei's <Text>) creates its OWN
// separate WebGL context internally to GPU-bake glyph SDF textures (see
// node_modules/troika-three-text -- confirmed by reading its source, not
// guessed), and that turned out to be exactly what was crashing a real
// user's Intel integrated GPU with "Context Lost" shortly after mount --
// confirmed by disabling this component alone and seeing the crash
// disappear. Baking text onto a plain 2D canvas and uploading it as one
// texture per label stays entirely within the browser's native (non-WebGL)
// 2D canvas text rasterizer and this scene's single existing WebGL
// context -- no second context, and no external CDN font-fallback fetch
// for CJK glyphs either (2D canvas text uses whatever font the browser
// already has for normal page text, same as any other Chinese text on
// this site).
function buildLabelTexture(text: string): { texture: CanvasTexture; aspect: number } {
  const font = `${LABEL_FONT_PX}px sans-serif`;
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = font;
  const textWidth = measure.measureText(text).width;

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(textWidth) + LABEL_PADDING_PX * 2;
  canvas.height = LABEL_FONT_PX + LABEL_PADDING_PX * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.font = font;
  ctx.fillStyle = LABEL_COLOR;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return { texture, aspect: canvas.width / canvas.height };
}

// Static line figures + name labels for the 88 IAU constellations. Line
// data is built once (useMemo) from constellationLines.json via
// constellationLoader.ts -- same "convert once, never per-frame" approach
// as StarField.tsx. Renders as a child of the same rotating sky group as
// the stars, so the lines stay visually attached to their star patterns as
// the sky turns.
export default function ConstellationLines() {
  const locale = useLocale();
  const constellations = useMemo(() => buildConstellationRenderData(), []);

  // All 88 constellations' line segments merged into ONE THREE.LineSegments
  // geometry (GL_LINES: every consecutive vertex PAIR is one independent
  // segment) rendered with a single plain LineBasicMaterial in one draw
  // call -- not 150 separate drei <Line> instances (three-stdlib's
  // Line2/"fat line" technique, each carrying its own resolution uniform
  // and expanded quad geometry). That many separate fat-line draw calls
  // at once on mount is real GPU/driver load for a purely cosmetic thin
  // line effect this feature doesn't need.
  const linesGeometry = useMemo(() => {
    const vertices: number[] = [];
    for (const c of constellations) {
      for (const segment of c.segments) {
        for (let i = 0; i < segment.length - 1; i++) {
          vertices.push(...segment[i], ...segment[i + 1]);
        }
      }
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    return geo;
  }, [constellations]);

  const labels = useMemo(
    () =>
      constellations.map((c) => {
        const text = locale === "zh" ? c.nameZh : c.nameEn;
        const { texture, aspect } = buildLabelTexture(text);
        return { id: c.id, position: c.labelPosition, texture, aspect };
      }),
    [constellations, locale],
  );

  // CanvasTexture instances are a real GPU resource (once uploaded) --
  // dispose the old batch whenever `labels` is rebuilt (e.g. on locale
  // switch) or this component unmounts, same as any other imperative
  // Three.js resource cleanup.
  useEffect(() => {
    return () => {
      for (const l of labels) l.texture.dispose();
    };
  }, [labels]);

  return (
    <>
      <lineSegments geometry={linesGeometry}>
        <lineBasicMaterial color={LINE_COLOR} transparent opacity={LINE_OPACITY} />
      </lineSegments>
      {labels.map((l) => (
        <sprite key={l.id} position={l.position} scale={[LABEL_HEIGHT * l.aspect, LABEL_HEIGHT, 1]}>
          <spriteMaterial map={l.texture} transparent depthWrite={false} />
        </sprite>
      ))}
    </>
  );
}
