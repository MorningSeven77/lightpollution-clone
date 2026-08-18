// One-off, developer-run data prep — NOT wired into postinstall/build.
// Downloads the HYG v4.4 star database, filters to naked-eye-visible stars
// (mag <= 6.5), and writes a compact struct-of-arrays JSON that StarField.tsx
// loads at build time.
//
// Source: HYG database v4.4 (Hipparcos + Yale Bright Star + Gliese-Jahreiss),
// https://codeberg.org/astronexus/hyg — the canonical repo lives on Codeberg,
// not the old astronexus/HYG-Database GitHub mirror (which is now just an
// archive pointer). License: CC BY-SA 4.0 — this script's output is a
// filtered/reshaped derivative and must keep the same attribution+license
// requirement; see the credit added to /about-data.
//
// Fetched 2026-08-17. Re-run this script (and re-check the source README for
// license changes) if the catalog is ever refreshed.
//
// IMPORTANT: use the Codeberg *media* endpoint, not *raw* — this repo tracks
// the CSV via Git LFS, and Codeberg's /raw/ path serves the raw LFS pointer
// file (a ~130-byte text stub), not the actual ~13MB gzipped catalog. Only
// /media/ resolves the LFS object itself.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "starCatalog.json");
const SOURCE_URL = "https://codeberg.org/astronexus/hyg/media/branch/main/data/hyg/CURRENT/hyg_v44.csv.gz";
const MAGNITUDE_LIMIT = 6.5; // naked-eye visibility cutoff

// Column indices in the HYG v4.4 CSV header (verified against a live fetch,
// not assumed from memory — the column set has changed across HYG versions).
const COLUMNS = {
  id: 0,
  proper: 6,
  ra: 7, // hours, 0..24
  dec: 8, // degrees, -90..90
  mag: 13, // apparent visual magnitude
  ci: 16, // B-V color index
};

// Minimal RFC4180-ish CSV line splitter: handles quoted fields (which may
// contain commas) without pulling in a dependency for a one-off script.
function splitCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

async function main() {
  console.log(`Fetching ${SOURCE_URL} ...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  const gzipped = Buffer.from(await res.arrayBuffer());
  const csv = zlib.gunzipSync(gzipped).toString("utf-8");
  const lines = csv.split("\n").filter((l) => l.trim().length > 0);

  const header = splitCsvLine(lines[0]);
  console.log(`CSV has ${lines.length - 1} data rows, ${header.length} columns.`);
  // Sanity-check the header matches the hardcoded column indices above —
  // fail loudly rather than silently mis-mapping columns if HYG ever
  // reorders its CSV.
  for (const [key, idx] of Object.entries(COLUMNS)) {
    if (header[idx] !== key) {
      throw new Error(`Column mismatch: expected "${key}" at index ${idx}, found "${header[idx]}". HYG CSV layout may have changed — update COLUMNS.`);
    }
  }

  const ra = [];
  const dec = [];
  const mag = [];
  const bv = [];
  const name = [];
  let skippedSol = 0;
  let skippedDim = 0;
  let skippedInvalid = 0;

  for (let i = 1; i < lines.length; i++) {
    const fields = splitCsvLine(lines[i]);
    const id = Number(fields[COLUMNS.id]);
    // id 0 is Sol itself (ra=0, dec=0, mag=-26.7) — the Sun is rendered
    // separately as a solar-system body via astronomy-engine, not as a
    // fixed-position "star".
    if (id === 0) {
      skippedSol++;
      continue;
    }
    const magValue = Number(fields[COLUMNS.mag]);
    if (!Number.isFinite(magValue) || magValue > MAGNITUDE_LIMIT) {
      skippedDim++;
      continue;
    }
    const raValue = Number(fields[COLUMNS.ra]);
    const decValue = Number(fields[COLUMNS.dec]);
    if (!Number.isFinite(raValue) || !Number.isFinite(decValue)) {
      skippedInvalid++;
      continue;
    }
    const ciValue = Number(fields[COLUMNS.ci]);
    ra.push(raValue);
    dec.push(decValue);
    mag.push(magValue);
    bv.push(Number.isFinite(ciValue) ? ciValue : 0);
    const properName = fields[COLUMNS.proper].trim();
    name.push(properName.length > 0 ? properName : null);
  }

  console.log(
    `Kept ${ra.length} stars (mag <= ${MAGNITUDE_LIMIT}). Skipped: ${skippedSol} Sol, ${skippedDim} too dim, ${skippedInvalid} invalid coords.`,
  );

  const output = {
    source: "HYG Database v4.4 (Hipparcos/Yale/Gliese-Jahreiss), CC BY-SA 4.0, https://codeberg.org/astronexus/hyg",
    fetchedAt: "2026-08-17",
    magnitudeLimit: MAGNITUDE_LIMIT,
    epoch: "J2000",
    count: ra.length,
    ra,
    dec,
    mag,
    bv,
    name,
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
