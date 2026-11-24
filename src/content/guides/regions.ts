import { STATE_PLACE_IDS, type StateSlug } from "@/content/guides/placeIndex";
import type { MapView } from "@/lib/urlState";

export type { StateSlug };

export const STATE_SLUGS = Object.keys(STATE_PLACE_IDS) as StateSlug[];

const VIEWS = {
  us: { lat: 39.8, lng: -98.6, zoom: 3.5 },
  texas: { lat: 31.3, lng: -99.2, zoom: 5.2 },
  california: { lat: 37.2, lng: -119.4, zoom: 5.2 },
  colorado: { lat: 39.0, lng: -105.6, zoom: 6.1 },
  florida: { lat: 28.2, lng: -81.8, zoom: 5.7 },
  utah: { lat: 39.3, lng: -111.6, zoom: 6.1 },
  oregon: { lat: 43.9, lng: -120.5, zoom: 6.0 },
  michigan: { lat: 44.8, lng: -85.6, zoom: 5.7 },
  arizona: { lat: 34.2, lng: -111.7, zoom: 6.0 },
  minnesota: { lat: 46.3, lng: -94.3, zoom: 5.8 },
  wisconsin: { lat: 44.6, lng: -89.7, zoom: 6.1 },
  ohio: { lat: 40.3, lng: -82.7, zoom: 6.3 },
  washington: { lat: 47.4, lng: -120.5, zoom: 6.1 },
  parks: { lat: 22, lng: -20, zoom: 1.5 },
} as const satisfies Record<string, MapView>;

export type RegionKey = keyof typeof VIEWS;

export function regionView(key: RegionKey): MapView {
  return VIEWS[key];
}

export function isStateSlug(value: string): value is StateSlug {
  return Object.prototype.hasOwnProperty.call(STATE_PLACE_IDS, value);
}
