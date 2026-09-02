import type { ReactElement } from "react";

/**
 * Renders one JSON-LD structured-data block.
 *
 * Not a Client Component — it only ever emits a static <script> tag, so it
 * works inside Server Component layouts/pages. `<` is escaped to its unicode
 * form to defang any HTML/XSS smuggled through `data` (per the Next.js
 * JSON-LD guide, node_modules/next/dist/docs/01-app/02-guides/json-ld.md).
 *
 * Rendering several standalone <JsonLd> blocks on one page is fine and is
 * what Google recommends over cramming every node into a single @graph.
 */
export function JsonLd({ data }: { data: object }): ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
