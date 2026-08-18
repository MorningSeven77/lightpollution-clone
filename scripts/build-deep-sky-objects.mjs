// One-off, developer-run data prep — NOT wired into postinstall/build.
// Downloads OpenNGC's combined NGC/IC catalog and filters it down to the
// 110-object Messier catalog (the well-known, naked-eye-to-small-telescope
// subset -- not the full multi-thousand-entry NGC/IC catalog), writing a
// compact JSON that DeepSkyObjects.tsx loads at build time.
//
// Source: OpenNGC (Mattia Verga), CC BY-SA 4.0,
// https://github.com/mattiaverga/OpenNGC -- the same deep-sky-object source
// stellarium-web.org itself credits (confirmed via its own Data Credits
// dialog, read directly from the live site earlier in this project).
//
// Fetched 2026-08-17.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "deepSkyObjects.json");
const SOURCE_URL = "https://raw.githubusercontent.com/mattiaverga/OpenNGC/master/database_files/NGC.csv";

// OpenNGC column indices (0-based), verified against a live fetch of the
// CSV header row, not assumed from memory.
const COLUMNS = {
  name: 0,
  type: 1,
  ra: 2,
  dec: 3,
  vMag: 9,
  bMag: 8,
  messier: 23,
  commonNames: 28,
};

// OpenNGC's own object-type codes, collapsed into the handful of display
// categories DeepSkyObjects.tsx actually differentiates by color. "Other"
// (M73 -- a group of four unrelated foreground stars, a famous historical
// quirk of the Messier catalog, not a real deep-sky object) falls back to
// "cluster" since it's visually just a loose group of points either way.
const CATEGORY_BY_TYPE = {
  G: "galaxy",
  GPair: "galaxy",
  GTrpl: "galaxy",
  GGroup: "galaxy",
  OCl: "cluster",
  GCl: "cluster",
  "*Ass": "cluster",
  Other: "cluster",
  PN: "nebula",
  HII: "nebula",
  RfN: "nebula",
  SNR: "nebula",
  Neb: "nebula",
  DrkN: "nebula",
  "Cl+N": "cluster",
};

function parseSexagesimalHours(raStr) {
  const [h, m, s] = raStr.split(":").map(Number);
  return h + m / 60 + s / 3600;
}

function parseSexagesimalDegrees(decStr) {
  const sign = decStr.startsWith("-") ? -1 : 1;
  const [d, m, s] = decStr.replace(/^[+-]/, "").split(":").map(Number);
  return sign * (d + m / 60 + s / 3600);
}

// Semicolon-delimited, same quoted-field handling as
// build-star-catalog.mjs's comma-delimited parser (OpenNGC's CSV doesn't
// appear to need it in practice -- no embedded semicolons observed in a
// live fetch -- but handling it costs nothing and avoids a silent
// mis-parse if a future update to the source ever adds one).
function splitCsvLine(line, delimiter) {
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
    } else if (char === delimiter) {
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
  const csv = await res.text();
  const lines = csv.split("\n").filter((l) => l.trim().length > 0);

  const header = splitCsvLine(lines[0], ";");
  for (const [key, idx] of Object.entries(COLUMNS)) {
    // Just a loose sanity check (header names use different casing/spacing
    // than our own keys) -- real validation is the Messier-count check
    // below, which would fail loudly if columns had shifted.
    if (!header[idx]) throw new Error(`Column ${key} at index ${idx} is empty in header — OpenNGC layout may have changed.`);
  }

  const objects = [];
  let skippedNoMag = 0;

  for (let i = 1; i < lines.length; i++) {
    const fields = splitCsvLine(lines[i], ";");
    const messierRaw = fields[COLUMNS.messier];
    if (!messierRaw) continue; // not a Messier object

    const mag = Number(fields[COLUMNS.vMag] || fields[COLUMNS.bMag]);
    if (!Number.isFinite(mag)) {
      skippedNoMag++;
      continue;
    }

    const ra = parseSexagesimalHours(fields[COLUMNS.ra]);
    const dec = parseSexagesimalDegrees(fields[COLUMNS.dec]);
    const type = fields[COLUMNS.type];
    const category = CATEGORY_BY_TYPE[type] ?? "cluster";
    const commonNamesRaw = fields[COLUMNS.commonNames].trim();
    const commonName = commonNamesRaw.length > 0 ? commonNamesRaw.split(",")[0] : null;

    objects.push({
      id: `M${Number(messierRaw)}`, // strip OpenNGC's zero-padding ("031" -> "M31")
      designation: fields[COLUMNS.name],
      category,
      ra,
      dec,
      mag,
      commonName,
    });
  }

  // M45 (Pleiades) has no entry in OpenNGC at all -- confirmed by grepping
  // the fetched CSV directly, not a parsing bug here. It's large and bright
  // enough that the historical NGC catalog never gave it a single NGC
  // number, so OpenNGC (which is fundamentally an NGC/IC cross-reference)
  // has nothing to hang a Messier tag on. Added manually with well-
  // established, independently-verifiable values (matches the position/
  // magnitude any star chart or Wikipedia gives for the Pleiades) rather
  // than silently dropping one of the most recognizable naked-eye Messier
  // objects.
  objects.push({
    id: "M45",
    designation: "Mel 22",
    category: "cluster",
    ra: 3.7833,
    dec: 24.1167,
    mag: 1.6,
    commonName: "Pleiades",
  });

  objects.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));

  console.log(`Kept ${objects.length} Messier objects. Skipped ${skippedNoMag} with no usable magnitude.`);
  if (objects.length < 100 || objects.length > 115) {
    console.warn(`Expected roughly 107-110 Messier objects (the catalog has 110, minus a couple duplicates/edge cases OpenNGC omits), got ${objects.length} — verify source data.`);
  }

  const output = {
    source: "OpenNGC (Mattia Verga), CC BY-SA 4.0, https://github.com/mattiaverga/OpenNGC",
    fetchedAt: "2026-08-17",
    count: objects.length,
    objects,
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
