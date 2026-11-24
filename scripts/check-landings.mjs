import ts from "typescript";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const require = createRequire(import.meta.url);
const cache = new Map();
const failures = [];

function fail(message) {
  failures.push(message);
}

function loadTs(rel) {
  const abs = path.join(root, rel);
  if (cache.has(abs)) return cache.get(abs).exports;
  const source = readFileSync(abs, "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.React,
    },
    fileName: abs,
  }).outputText;
  const mod = { exports: {} };
  cache.set(abs, mod);
  const localRequire = (spec) => {
    if (spec.startsWith("@/")) {
      const base = path.join(root, "src", spec.slice(2));
      for (const ext of [".ts", ".tsx", ".json"]) {
        try {
          readFileSync(base + ext);
          if (ext === ".json") return require(base + ext);
          return loadTs(path.relative(root, base + ext));
        } catch {
          // try the next extension
        }
      }
      throw new Error(`Cannot resolve ${spec} from ${rel}`);
    }
    if (spec.startsWith(".")) {
      const target = path.resolve(path.dirname(abs), spec);
      if (target.endsWith(".json")) return require(target);
      return loadTs(path.relative(root, target.endsWith(".ts") ? target : `${target}.ts`));
    }
    return require(spec);
  };
  const runner = new Function("exports", "require", "module", "__filename", "__dirname", js);
  runner(mod.exports, localRequire, mod, abs, path.dirname(abs));
  return mod.exports;
}

function words(copy, locale) {
  const chunks = [
    copy.h1,
    copy.eyebrow,
    ...copy.lede,
    ...copy.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
    ...copy.faq.flatMap((item) => [item.question, item.answer]),
  ];
  const text = chunks.join(" ");
  if (locale === "zh") {
    const cjk = text.match(/[\u3400-\u9fff]/g);
    return cjk ? cjk.length : 0;
  }
  return text.split(/\s+/).filter(Boolean).length;
}

const en = loadTs("src/content/guides/en.ts").enGuides;
const zh = loadTs("src/content/guides/zh.ts").zhGuides;
const { US_PLACE_IDS, STATE_PLACE_IDS } = loadTs("src/content/guides/placeIndex.ts");
const places = require(path.join(root, "src/data/darkSkyPlaces.json"));
const placeIds = new Set(places.map((place) => place.id));
const sitemap = readFileSync(path.join(root, "src/app/sitemap.ts"), "utf8");
const messages = {
  en: JSON.parse(readFileSync(path.join(root, "messages/en.json"), "utf8")),
  zh: JSON.parse(readFileSync(path.join(root, "messages/zh.json"), "utf8")),
};

const expected = [
  "us",
  "texas",
  "california",
  "colorado",
  "florida",
  "utah",
  "oregon",
  "michigan",
  "arizona",
  "minnesota",
  "wisconsin",
  "ohio",
  "washington",
  "parks",
  "milky-way",
  "night-sky",
  "what-is",
];

if (JSON.stringify(Object.keys(en)) !== JSON.stringify(expected)) {
  fail(`en slugs ${Object.keys(en).join(",")}`);
}
if (JSON.stringify(Object.keys(zh)) !== JSON.stringify(expected)) {
  fail(`zh slugs ${Object.keys(zh).join(",")}`);
}

for (const slug of expected) {
  const a = en[slug];
  const b = zh[slug];
  const aIds = a.sections.map((section) => section.id).join(",");
  const bIds = b.sections.map((section) => section.id).join(",");
  if (aIds !== bIds) fail(`${slug} section ids differ: ${aIds} vs ${bIds}`);
  if (words(a, "en") < 100) fail(`${slug} en words ${words(a, "en")}`);
  if (words(b, "zh") < 100) fail(`${slug} zh chars ${words(b, "zh")}`);
  if (!a.metaTitle || !a.metaDescription || !a.h1) fail(`${slug} en meta incomplete`);
  if (!b.metaTitle || !b.metaDescription || !b.h1) fail(`${slug} zh meta incomplete`);
  if (a.h1 === b.h1) fail(`${slug} Chinese H1 is the English H1`);
  if (slug === "washington" && STATE_PLACE_IDS.washington.length !== 0) {
    fail("washington place list is not empty");
  }
}

for (const id of [...US_PLACE_IDS, ...Object.values(STATE_PLACE_IDS).flat()]) {
  if (!placeIds.has(id)) fail(`unknown place id ${id}`);
}

const stateSet = new Set(Object.values(STATE_PLACE_IDS).flat());
for (const id of stateSet) {
  if (!US_PLACE_IDS.includes(id)) fail(`state id ${id} missing from US list`);
}

const requiredPaths = [
  "/star-map",
  "/us-light-pollution-map",
  "/dark-sky-parks",
  "/where-to-see-the-milky-way",
  "/night-sky-without-light-pollution",
  "/what-is-light-pollution",
  ...Object.keys(STATE_PLACE_IDS).map((slug) => `/light-pollution-map/${slug}`),
];
for (const href of requiredPaths) {
  if (!sitemap.includes(`"${href}"`)) fail(`sitemap missing ${href}`);
}

const forbidden = [
  "light polution",
  "light pollution mao",
  "light polition",
  "dark skys",
  "dark.skies",
  "locati0n",
  "light pollution pollution",
  "light pollution pics",
  "0 light pollution",
];
const corpus = [
  readFileSync(path.join(root, "src/content/guides/en.ts"), "utf8"),
  readFileSync(path.join(root, "src/content/guides/zh.ts"), "utf8"),
  readFileSync(path.join(root, "messages/en.json"), "utf8"),
  readFileSync(path.join(root, "messages/zh.json"), "utf8"),
]
  .join("\n")
  .toLowerCase();
for (const token of forbidden) {
  if (corpus.includes(token)) fail(`forbidden token present: ${token}`);
}

const guideKeys = Object.keys(messages.en.guides);
for (const key of guideKeys) {
  if (!(key in messages.zh.guides)) fail(`zh guides missing ${key}`);
}
if (JSON.stringify(Object.keys(messages.en.guides.stateNames)) !== JSON.stringify(Object.keys(STATE_PLACE_IDS))) {
  fail("stateNames keys do not match state ids");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`landings ok: ${expected.length} guides, US places ${US_PLACE_IDS.length}`);
for (const slug of expected) {
  console.log(`${slug}\ten ${words(en[slug], "en")}\tzh ${words(zh[slug], "zh")}`);
}

void pathToFileURL;
