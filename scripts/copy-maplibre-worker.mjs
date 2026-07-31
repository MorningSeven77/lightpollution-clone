// maplibre-gl v6 is ESM-only and loads its worker from a URL we must supply
// ourselves (see src/components/Map.tsx). The worker file does a relative
// `import "./maplibre-gl-shared.mjs"`, so both files have to be served
// side-by-side under their original names — a bundler-hashed asset path
// would break that relative import. Copying them into public/ (verbatim,
// unhashed) at install time keeps that working, including on Vercel.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];
const srcDir = path.join(__dirname, "..", "node_modules", "maplibre-gl", "dist");
const destDir = path.join(__dirname, "..", "public", "maplibre");

fs.mkdirSync(destDir, { recursive: true });
for (const file of files) {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
}
console.log(`Copied ${files.join(", ")} to public/maplibre/`);
