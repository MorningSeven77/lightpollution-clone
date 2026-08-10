export type ColorStyleId = "classic" | "soft" | "vivid" | "amber";

// "bortle": legend renders 9 discrete Bortle-class swatches (classic only —
// its palette is a hand-picked progression through recognizable zones, not
// a value meant to be read as a continuous number).
// "sqm": legend renders a continuous gradient with real SQM tick labels,
// computed from this style's min/max via radianceToBortleEstimate.
export type LegendType = "bortle" | "sqm";

// Text label/description live in messages/{locale}.json (dataLabels.colorStyles)
// so this module stays language-agnostic.
export type ColorStyleDef = {
  id: ColorStyleId;
  palette: string[];
  min: number;
  max: number;
  legendType: LegendType;
};

// soft/vivid/amber intentionally share one fixed radiance range instead of
// each having its own hand-tuned min/max — confirmed against the reference
// site, switching between its three non-"Classic" styles keeps the exact
// same legend ticks, only the palette changes.
//
// The reference site's ticks read "22 / 19.5 / 17"; matching that literally
// (via sqmToRadiance(17) ≈ 315) looked right on paper but was wrong in
// practice — bortle.ts's radiance→SQM curve is a deliberately simplified
// approximation (see its own comment), and under that curve SQM 17 needs
// radiance ≈315, far past what all but the most extreme city cores ever
// reach (NYC measured ≈211 via /api/point-value). Every typical location
// then landed in the bottom ~20% of the gradient — near-black in all three
// palettes, which is exactly why switching between them looked like nothing
// was happening. 120 keeps real places spread across the visible range
// (still SQM ≈17.8 at the bright end, close enough to the reference) while
// actually using the palettes.
const FIXED_MIN_RADIANCE = 0;
const FIXED_MAX_RADIANCE = 120;

export const COLOR_STYLES: Record<ColorStyleId, ColorStyleDef> = {
  classic: {
    id: "classic",
    // Sampled the same way as the "Scientific" style's palette below — fetched the reference
    // site's own Classic-style tile over Cairo and read real pixel values —
    // rather than eyeballed. Their tile turned out to have literally only
    // ~9-11 unique colors (it's genuinely discrete, not a smoothed gradient
    // sampled to look bandy), confirming the "clear zones" description was
    // about the underlying technique, not just a label. (Their tile also has
    // small pure-gray blobs scattered inside the bright core — those don't
    // fit the sequential dark→bright progression at all and look like a
    // separate "known settlement" marker layer, not part of the color scale,
    // so they're left out here.)
    palette: ["000000", "222222", "142f72", "2154d8", "0f5714", "1fa12a", "6e641e", "b8a625", "bf641e", "fb5a49", "f2f2f2"],
    min: 0,
    max: 150,
    legendType: "bortle",
  },
  soft: {
    id: "soft",
    palette: ["1a1a2e", "4a5568", "f59e0b", "ef4444", "ec4899"],
    min: FIXED_MIN_RADIANCE,
    max: FIXED_MAX_RADIANCE,
    legendType: "sqm",
  },
  vivid: {
    id: "vivid",
    palette: ["000000", "3f3f46", "71717a", "a1a1aa", "e4e4e7", "ffffff"],
    min: FIXED_MIN_RADIANCE,
    max: FIXED_MAX_RADIANCE,
    legendType: "sqm",
  },
  amber: {
    id: "amber",
    // Sampled directly from the reference site's own rendered tiles (fetched
    // their Scientific-style PNGs, read real pixel values dark→bright with
    // a canvas) rather than eyeballed from a screenshot — this is the actual
    // gradient, not an approximation of it.
    palette: ["00224f", "23376d", "4c4f6d", "6f6d72", "a19a65", "e0ce37", "fee838"],
    min: FIXED_MIN_RADIANCE,
    max: FIXED_MAX_RADIANCE,
    legendType: "sqm",
  },
};

export const DEFAULT_COLOR_STYLE: ColorStyleId = "classic";

export function isColorStyleId(value: string | null): value is ColorStyleId {
  return !!value && value in COLOR_STYLES;
}

export function paletteToCssGradient(palette: string[]): string {
  return `linear-gradient(to right, ${palette.map((hex) => `#${hex}`).join(", ")})`;
}

// Samples 9 evenly-spaced colors out of a (usually longer) continuous
// palette array, for the discrete Bortle-class legend swatches.
export function paletteToBortleSwatches(palette: string[]): string[] {
  return Array.from({ length: 9 }, (_, i) => {
    const index = Math.round((i * (palette.length - 1)) / 8);
    return palette[index];
  });
}
