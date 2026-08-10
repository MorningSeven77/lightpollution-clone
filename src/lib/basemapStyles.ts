import type { StyleSpecification } from "maplibre-gl";

export type BasemapId = "street" | "dark" | "satellite";

// Text labels live in messages/{locale}.json (dataLabels.basemaps) so this
// module stays language-agnostic.
export type BasemapDef =
  | { id: BasemapId; styleUrl: string }
  | { id: BasemapId; style: StyleSpecification };

// "street"/"dark" are CARTO's free, key-less vector basemaps
// (https://docs.carto.com/carto-for-developers/carto-for-react/guides/basemaps).
// "satellite" is Esri's free, key-less World Imagery raster service — real
// aerial/satellite photography, not a vector style, so it's defined as an
// inline minimal style (one raster source + layer) instead of a style.json
// URL. Resolution varies a lot by region (great in US/EU cities, noticeably
// soft elsewhere) since it's free; if that ever matters enough to fix, swap
// this for a paid provider like Mapbox Satellite — that's an isolated,
// single-source change, not an architecture change.
export const BASEMAP_STYLES: Record<BasemapId, BasemapDef> = {
  street: {
    id: "street",
    styleUrl: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
  dark: {
    id: "dark",
    styleUrl: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  satellite: {
    id: "satellite",
    style: {
      version: 8,
      sources: {
        satellite: {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri, Maxar, Earthstar Geographics",
        },
      },
      layers: [{ id: "satellite", type: "raster", source: "satellite" }],
    },
  },
};

export const DEFAULT_BASEMAP: BasemapId = "dark";

export function isBasemapId(value: string | null): value is BasemapId {
  return !!value && value in BASEMAP_STYLES;
}
