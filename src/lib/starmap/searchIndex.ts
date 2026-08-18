import { Body } from "astronomy-engine";
import { getStarCatalog } from "@/lib/starmap/starCatalogLoader";
import { getDeepSkyObjects } from "@/lib/starmap/deepSkyObjectsLoader";

// Searchable object index combining the three catalogs this feature
// already has loaded. Star proper names (from HYG) and deep-sky common
// names (from OpenNGC) are English/Latin-only in the source data -- no
// Chinese translation table exists for ~450 star names or 108 object
// names, so those stay English-only in both locales (a documented
// simplification, not an oversight: proper star names and Messier
// designations like "M31" are already quasi-universal identifiers used
// in Chinese-language astronomy content too, unlike constellation names
// which have long-standardized Chinese translations this project already
// sourced separately). Planets DO get real localized names, since there
// are only 9 and both languages' names are well-established.
export type SearchResult =
  | { kind: "star"; id: string; label: string; raHours: number; decDeg: number; mag: number }
  | { kind: "dso"; id: string; label: string; raHours: number; decDeg: number; mag: number }
  | { kind: "planet"; id: string; label: string; body: Body };

export const SEARCHABLE_PLANET_BODIES = [
  Body.Sun,
  Body.Moon,
  Body.Mercury,
  Body.Venus,
  Body.Mars,
  Body.Jupiter,
  Body.Saturn,
  Body.Uranus,
  Body.Neptune,
] as const;

// English names always included as searchable text (works for both
// locales, matching the star/DSO name convention above); localized names
// layered in via the translation keys the caller supplies (starMap.planet*
// in messages/*.json) so a zh-locale user can also type "太阳" and find it.
const PLANET_LABELS: Record<(typeof SEARCHABLE_PLANET_BODIES)[number], string> = {
  [Body.Sun]: "Sun",
  [Body.Moon]: "Moon",
  [Body.Mercury]: "Mercury",
  [Body.Venus]: "Venus",
  [Body.Mars]: "Mars",
  [Body.Jupiter]: "Jupiter",
  [Body.Saturn]: "Saturn",
  [Body.Uranus]: "Uranus",
  [Body.Neptune]: "Neptune",
};

function buildStarResults(): SearchResult[] {
  const catalog = getStarCatalog();
  const results: SearchResult[] = [];
  for (let i = 0; i < catalog.count; i++) {
    const name = catalog.name[i];
    if (!name) continue;
    results.push({ kind: "star", id: `star-${i}`, label: name, raHours: catalog.ra[i], decDeg: catalog.dec[i], mag: catalog.mag[i] });
  }
  return results;
}

function buildDsoResults(): SearchResult[] {
  return getDeepSkyObjects().map((o) => ({
    kind: "dso" as const,
    id: o.id,
    label: o.commonName ? `${o.id} (${o.commonName})` : o.id,
    raHours: o.ra,
    decDeg: o.dec,
    mag: o.mag,
  }));
}

function buildPlanetResults(localizedNameByBody: Partial<Record<Body, string>>): SearchResult[] {
  return SEARCHABLE_PLANET_BODIES.map((body) => {
    const localized = localizedNameByBody[body];
    const label = localized && localized !== PLANET_LABELS[body] ? `${PLANET_LABELS[body]} (${localized})` : PLANET_LABELS[body];
    return { kind: "planet" as const, id: `planet-${body}`, label, body };
  });
}

let cachedStarResults: SearchResult[] | null = null;
let cachedDsoResults: SearchResult[] | null = null;

// localizedNameByBody lets the UI pass in the current locale's planet
// names (e.g. { [Body.Sun]: "太阳" }) so search text matches either
// language; stars/DSOs are unaffected by locale (see module comment).
export function searchCelestialObjects(query: string, localizedNameByBody: Partial<Record<Body, string>>, limit = 8): SearchResult[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length < 1) return [];

  if (!cachedStarResults) cachedStarResults = buildStarResults();
  if (!cachedDsoResults) cachedDsoResults = buildDsoResults();
  const planetResults = buildPlanetResults(localizedNameByBody);

  const all = [...planetResults, ...cachedDsoResults, ...cachedStarResults];
  const matches = all.filter((r) => r.label.toLowerCase().includes(trimmed));

  // Exact/starts-with matches first, then everything else, each group
  // otherwise keeping catalog order (planets, then DSOs brightest-ish
  // first since deepSkyObjects.json is already Messier-number-sorted,
  // then stars) -- simple and predictable rather than a full relevance
  // score for a catalog this small.
  matches.sort((a, b) => {
    const aStarts = a.label.toLowerCase().startsWith(trimmed) ? 0 : 1;
    const bStarts = b.label.toLowerCase().startsWith(trimmed) ? 0 : 1;
    return aStarts - bStarts;
  });

  return matches.slice(0, limit);
}
