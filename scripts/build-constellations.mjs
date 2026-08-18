// One-off, developer-run data prep — NOT wired into postinstall/build.
// Downloads the 88 IAU constellations' line figures + name labels from
// d3-celestial and writes a compact JSON that ConstellationLines.tsx loads
// at build time.
//
// Source: d3-celestial (Olaf Frohn), BSD-3-Clause,
// https://github.com/ofrohn/d3-celestial — a single root LICENSE file covers
// the whole repo including /data (verified 2026-08-17, no separate
// data-only license file found).
//
// Fetched 2026-08-17.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as OpenCC from "opencc-js";

// d3-celestial's "zh" property is Traditional Chinese (e.g. 獵戶座, 天蠍座),
// but this project's zh locale is Simplified throughout — converting here
// keeps the constellation labels consistent with the rest of the UI.
// opencc-js is a devDependency used only by this offline build script, never
// shipped to the browser bundle.
const toSimplified = OpenCC.Converter({ from: "tw", to: "cn" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "constellationLines.json");
const LINES_URL = "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.lines.json";
const NAMES_URL = "https://raw.githubusercontent.com/ofrohn/d3-celestial/master/data/constellations.json";

// d3-celestial stores RA in DEGREES, range -180..180 (its own README
// documents the conversion it applied: `ra > 12 ? (ra-24)*15 : ra*15`).
// We need standard 0..24h RA for coordinates.ts's RA/Dec -> Cartesian
// conversion, so this inverts that transform. Getting the sign backwards
// here would silently mirror every constellation east-west.
function degToRaHours(raDeg) {
  return raDeg < 0 ? raDeg / 15 + 24 : raDeg / 15;
}

async function fetchJson(url) {
  console.log(`Fetching ${url} ...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed for ${url}: ${res.status} ${res.statusText}`);
  return res.json();
}

async function main() {
  const [linesGeoJson, namesGeoJson] = await Promise.all([fetchJson(LINES_URL), fetchJson(NAMES_URL)]);

  const namesById = new Map();
  for (const feature of namesGeoJson.features) {
    namesById.set(feature.id, feature);
  }

  // Serpens is the one IAU constellation split into two disconnected
  // star-figures (Caput/head and Cauda/tail, separated by Ophiuchus) — the
  // source data represents this as two separate GeoJSON line features that
  // both share the single "Ser" id and the single name-file entry. Group by
  // id and merge line segments so Serpens ends up as one constellation
  // object with two disjoint line groups and one label, instead of two
  // duplicate "Serpens" entries stacked on the same label position.
  const byId = new Map();
  let missingName = 0;

  for (const feature of linesGeoJson.features) {
    const id = feature.id;
    const nameFeature = namesById.get(id);
    if (!nameFeature) {
      missingName++;
      console.warn(`No name entry for constellation "${id}" — skipping.`);
      continue;
    }

    const lines = feature.geometry.coordinates.map((segment) => segment.map(([raDeg, dec]) => [degToRaHours(raDeg), dec]));

    const existing = byId.get(id);
    if (existing) {
      existing.lines.push(...lines);
      continue;
    }

    const [labelRaDeg, labelDec] = nameFeature.geometry.coordinates;
    byId.set(id, {
      id,
      nameEn: nameFeature.properties.en,
      nameZh: toSimplified(nameFeature.properties.zh),
      labelRa: degToRaHours(labelRaDeg),
      labelDec,
      lines,
    });
  }

  const constellations = Array.from(byId.values());
  console.log(`Built ${constellations.length} constellations (${missingName} skipped for missing name data).`);
  if (constellations.length !== 88) {
    console.warn(`Expected 88 IAU constellations, got ${constellations.length} — verify source data.`);
  }

  const output = {
    source: "d3-celestial (Olaf Frohn), BSD-3-Clause, https://github.com/ofrohn/d3-celestial",
    fetchedAt: "2026-08-17",
    constellations,
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output));
  const sizeKb = (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1);
  console.log(`Wrote ${OUTPUT_PATH} (${sizeKb} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
