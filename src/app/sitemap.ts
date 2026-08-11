import type { MetadataRoute } from "next";

const SITE_URL = "https://www.lightpollutionmap.io";

// One entry per page *concept*, not per locale — each entry's `alternates`
// tells Google the en/zh versions are translations of each other rather than
// duplicate content, matching the hreflang pairing already set up in
// src/app/[locale]/layout.tsx's generateMetadata.
const PAGES = ["", "/golden-hour", "/clear-sky-map", "/rankings", "/about-data"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    alternates: {
      languages: {
        en: `${SITE_URL}${path}`,
        zh: `${SITE_URL}/zh${path}`,
      },
    },
  }));
}
