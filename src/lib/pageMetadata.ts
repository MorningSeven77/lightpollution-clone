import type { Metadata } from "next";
import { localizedUrl } from "@/lib/structuredData";

/** Per-page title, description, canonical, hreflang, and Open Graph URL.
 * The locale layout must not set canonical or og:url, or inner pages inherit
 * the homepage address. */
export function pageMetadata(
  locale: string,
  path: string,
  copy: { title: string; description: string },
): Metadata {
  const url = localizedUrl(locale, path);
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: url,
      languages: {
        en: localizedUrl("en", path),
        zh: localizedUrl("zh", path),
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url,
      type: "website",
      siteName: "Light Pollution Map",
    },
  };
}
