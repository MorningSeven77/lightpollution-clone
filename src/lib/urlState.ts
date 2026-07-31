export type MapView = {
  lat: number;
  lng: number;
  zoom: number;
};

export const DEFAULT_VIEW: MapView = { lat: 20, lng: 10, zoom: 2 };

export function readViewFromUrl(): MapView {
  if (typeof window === "undefined") return DEFAULT_VIEW;

  const params = new URLSearchParams(window.location.search);
  const lat = parseFloat(params.get("lat") ?? "");
  const lng = parseFloat(params.get("lng") ?? "");
  const zoom = parseFloat(params.get("zoom") ?? "");

  return {
    lat: Number.isFinite(lat) ? lat : DEFAULT_VIEW.lat,
    lng: Number.isFinite(lng) ? lng : DEFAULT_VIEW.lng,
    zoom: Number.isFinite(zoom) ? zoom : DEFAULT_VIEW.zoom,
  };
}

export function writeViewToUrl(view: MapView) {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  params.set("lat", view.lat.toFixed(4));
  params.set("lng", view.lng.toFixed(4));
  params.set("zoom", view.zoom.toFixed(2));

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, "", newUrl);
}
