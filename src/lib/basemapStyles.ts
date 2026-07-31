export type BasemapId = "dark" | "light" | "voyager";

export type BasemapDef = {
  id: BasemapId;
  label: string;
  styleUrl: string;
};

// CARTO's free, key-less basemap family: https://docs.carto.com/carto-for-developers/carto-for-react/guides/basemaps
export const BASEMAP_STYLES: Record<BasemapId, BasemapDef> = {
  dark: {
    id: "dark",
    label: "暗色",
    styleUrl: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  light: {
    id: "light",
    label: "浅色",
    styleUrl: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
  voyager: {
    id: "voyager",
    label: "彩色",
    styleUrl: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  },
};

export const DEFAULT_BASEMAP: BasemapId = "dark";

export function isBasemapId(value: string | null): value is BasemapId {
  return !!value && value in BASEMAP_STYLES;
}
