import { enGuides } from "@/content/guides/en";
import { zhGuides } from "@/content/guides/zh";
import { STATE_SLUGS, type StateSlug } from "@/content/guides/regions";
import type { GuideCopy } from "@/content/guides/types";

const PATHS: Record<string, string> = {
  us: "/us-light-pollution-map",
  parks: "/dark-sky-parks",
  "milky-way": "/where-to-see-the-milky-way",
  "night-sky": "/night-sky-without-light-pollution",
  "what-is": "/what-is-light-pollution",
};

for (const slug of STATE_SLUGS) {
  PATHS[slug] = `/light-pollution-map/${slug}`;
}

export function isGuideSlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(enGuides, slug) && Object.prototype.hasOwnProperty.call(zhGuides, slug);
}

export function pathForGuide(slug: string): string {
  const path = PATHS[slug];
  if (!path) throw new Error(`No path for guide ${slug}`);
  return path;
}

export function getGuide(locale: string, slug: string): GuideCopy {
  if (locale !== "en" && locale !== "zh") {
    throw new Error(`Unsupported locale: ${locale}`);
  }
  const table = locale === "zh" ? zhGuides : enGuides;
  const copy = table[slug];
  if (!copy) throw new Error(`Missing ${locale} guide: ${slug}`);
  return copy;
}

export function statePath(slug: StateSlug): string {
  return pathForGuide(slug);
}

export const GUIDE_PATHS = Object.values(PATHS);
