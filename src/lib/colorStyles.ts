export type ColorStyleId = "classic" | "soft" | "vivid" | "amber";

export type ColorStyleDef = {
  id: ColorStyleId;
  label: string;
  palette: string[];
  min: number;
  max: number;
};

export const COLOR_STYLES: Record<ColorStyleId, ColorStyleDef> = {
  classic: {
    id: "classic",
    label: "经典",
    palette: [
      "000000",
      "040d21",
      "0b1d42",
      "123e6b",
      "1c6e8c",
      "1aa398",
      "3cba6c",
      "8ccf4d",
      "e3d24c",
      "f2a33d",
      "ee6c3a",
      "e63950",
      "ff5f96",
    ],
    min: 0,
    max: 60,
  },
  soft: {
    id: "soft",
    label: "柔光",
    palette: [
      "050512",
      "1a2340",
      "2f3d63",
      "44577f",
      "5c7391",
      "7a94a0",
      "9db4a0",
      "c3cf9c",
      "e6d9a0",
      "eab98f",
      "dba0a0",
      "e9b6cd",
    ],
    min: 0,
    max: 45,
  },
  vivid: {
    id: "vivid",
    label: "科幻",
    palette: [
      "000000",
      "0a0033",
      "1b0057",
      "3d0a91",
      "6a0dad",
      "0d47c9",
      "0891b2",
      "06d6a0",
      "ccff33",
      "ffdd00",
      "ff8800",
      "ff0066",
      "ff2ec4",
    ],
    min: 0,
    max: 70,
  },
  amber: {
    id: "amber",
    label: "群光",
    palette: [
      "000000",
      "1a0f02",
      "33210a",
      "4d3311",
      "805c1a",
      "b3821f",
      "e0a627",
      "f2c94c",
      "f2994a",
      "eb5757",
      "d6336c",
    ],
    min: 0,
    max: 55,
  },
};

export const DEFAULT_COLOR_STYLE: ColorStyleId = "classic";

export function isColorStyleId(value: string | null): value is ColorStyleId {
  return !!value && value in COLOR_STYLES;
}

export function paletteToCssGradient(palette: string[]): string {
  return `linear-gradient(to right, ${palette.map((hex) => `#${hex}`).join(", ")})`;
}
