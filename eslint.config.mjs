import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Copied verbatim from node_modules at install time, see scripts/copy-maplibre-worker.js.
    "public/maplibre/**",
    // Large third-party data files (star catalog, constellation lines, deep-sky
    // object list), not source code -- linting them as JS/TS is both pointless
    // and, for the multi-hundred-KB single-line starCatalog.json, extremely slow.
    "src/data/*.json",
    // .claude/worktrees/** holds full nested git checkouts for other parallel
    // Claude Code sessions working on their own branches -- each with its own
    // node_modules/.next build output. Without this, eslint's default file
    // discovery walks into them and lints their compiled/vendor JS as if it
    // were this project's source, which is both wrong and very slow.
    ".claude/**",
  ]),
]);

export default eslintConfig;
