import rawPlaces from "@/data/darkSkyPlaces.json";

export type DarkSkyPlaceCategory = "park" | "community" | "sanctuary" | "reserve" | "urban";

export type DarkSkyPlace = {
  id: number;
  name: string;
  category: DarkSkyPlaceCategory;
  lat: number;
  lng: number;
  year: number | null;
  area: string | null;
  link: string;
};

// Crawled once from DarkSky International's own WordPress REST API
// (wp-json/wp/v2/darksky_place + idsp_type taxonomy) and its public place
// pages (for the "Designated" year / "Land Area" fields, which aren't
// exposed via REST) — see the project's data-collection notes in CLAUDE.md.
// Static/offline rather than fetched at runtime: this is a slow-changing
// curated dataset, not something worth re-scraping darksky.org on every
// visitor's page load.
export const DARK_SKY_PLACES = rawPlaces as DarkSkyPlace[];

// Colors match the reference site's own marker colors for park / community /
// sanctuary / reserve, confirmed by clicking markers directly on
// lightpollutionmap.app. "urban" (Urban Night Sky Place) wasn't confirmed
// there, so it just gets a color visually distinct from the other four.
// Text labels live in src/lib/i18n/translations.ts (dataLabels.darkSkyCategories).
export const DARK_SKY_CATEGORY_META: Record<DarkSkyPlaceCategory, { color: string }> = {
  park: { color: "#22c55e" },
  community: { color: "#f97316" },
  sanctuary: { color: "#a855f7" },
  reserve: { color: "#3b82f6" },
  urban: { color: "#eab308" },
};
