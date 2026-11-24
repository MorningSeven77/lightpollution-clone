import type { MetadataRoute } from "next";

const SITE_URL = "https://www.lightpollutionmap.io";

// One entry per page *concept*, not per locale — each entry's `alternates`
// tells Google the en/zh versions are translations of each other rather than
// duplicate content, matching the hreflang pairing already set up in
// src/app/[locale]/layout.tsx's generateMetadata.
const PAGES = [
  "",
  "/golden-hour",
  "/clear-sky-map",
  "/rankings",
  "/about-data",
  "/bortle-scale-map",
  "/dark-sky-map",
  "/best-places-to-stargaze",
  "/star-map",
  "/us-light-pollution-map",
  "/light-pollution-map/texas",
  "/light-pollution-map/california",
  "/light-pollution-map/colorado",
  "/light-pollution-map/florida",
  "/light-pollution-map/utah",
  "/light-pollution-map/oregon",
  "/light-pollution-map/michigan",
  "/light-pollution-map/arizona",
  "/light-pollution-map/minnesota",
  "/light-pollution-map/wisconsin",
  "/light-pollution-map/ohio",
  "/light-pollution-map/washington",
  "/dark-sky-parks",
  "/where-to-see-the-milky-way",
  "/night-sky-without-light-pollution",
  "/what-is-light-pollution",
];

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
