export type LocationHistoryEntry = {
  lat: number;
  lng: number;
  placeName: string | null;
  bortleClass: number;
  sqm: number;
  timestamp: number; // ms epoch
};

const STORAGE_KEY = "lightpollution-location-history";
const MAX_ENTRIES = 10;
// Two points within this distance are treated as "the same place" for
// dedup purposes — avoids spamming the history with near-identical clicks
// on the same city block.
const DEDUP_DISTANCE_DEGREES = 0.01;

function readAll(): LocationHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: LocationHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or unavailable (private browsing, etc.) — history is a
    // nicety, not worth surfacing an error over.
  }
}

// Newest first.
export function getLocationHistory(): LocationHistoryEntry[] {
  return readAll().sort((a, b) => b.timestamp - a.timestamp);
}

export function addLocationHistoryEntry(entry: Omit<LocationHistoryEntry, "timestamp">): void {
  const existing = readAll().filter(
    (e) => Math.abs(e.lat - entry.lat) > DEDUP_DISTANCE_DEGREES || Math.abs(e.lng - entry.lng) > DEDUP_DISTANCE_DEGREES,
  );
  const next = [{ ...entry, timestamp: Date.now() }, ...existing].slice(0, MAX_ENTRIES);
  writeAll(next);
}

export function clearLocationHistory(): void {
  writeAll([]);
}

// SQM is a logarithmic (magnitude) scale, so the physical sky-background
// brightness ratio between two points is 10^((darkerSqm - sqm) / 2.5) —
// standard astronomical magnitude math, same relationship bortle.ts's own
// sqmToRadiance() is built on. A ratio of 1.0 means "as dark as the
// reference point"; 10.0 means ten times brighter.
export function computeSkyBackgroundRatio(darkestSqm: number, sqm: number): number {
  return Math.pow(10, (darkestSqm - sqm) / 2.5);
}
