/**
 * JSON-LD structured-data builders.
 *
 * Pure functions — each returns a plain object carrying its own "@context",
 * meant to be rendered as a single <script type="application/ld+json"> via
 * the <JsonLd> component. The site-wide WebSite/Organization pair is the one
 * exception: it comes back as an @graph so the two nodes can cross-reference
 * each other by @id.
 *
 * URL shape follows the "as-needed" localePrefix routing in
 * src/i18n/routing.ts: English lives at the bare path, every other locale is
 * served under /<locale>. Keep SITE_URL in sync with the copies in
 * src/app/[locale]/layout.tsx and src/app/sitemap.ts.
 */

export const SITE_URL = "https://www.lightpollutionmap.io";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Canonical absolute URL for a page path in a given locale. */
export function localizedUrl(locale: string, path = ""): string {
  const prefix = locale === "en" ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}${path}`;
}

export interface QAItem {
  question: string;
  answer: string;
}

/**
 * WebSite + Organization — identical on every page, rendered once from the
 * root [locale] layout.
 */
export function siteGraph(opts: { locale: string; name: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: opts.name,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.svg`,
        },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: opts.name,
        description: opts.description,
        inLanguage: opts.locale,
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

/** The interactive map itself — rendered on the home page. */
export function webApplication(opts: { locale: string; name: string; description: string }) {
  const url = localizedUrl(opts.locale, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${url}/#webapp`,
    name: opts.name,
    url,
    description: opts.description,
    inLanguage: opts.locale,
    isPartOf: { "@id": WEBSITE_ID },
    applicationCategory: "ReferenceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript and WebGL",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

export function faqPage(opts: { locale: string; url: string; qa: QAItem[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${opts.url}/#faq`,
    inLanguage: opts.locale,
    mainEntity: opts.qa.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

export function breadcrumb(opts: { locale: string; url: string; homeName: string; pageName: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${opts.url}/#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: opts.homeName,
        item: localizedUrl(opts.locale, ""),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: opts.pageName,
        item: opts.url,
      },
    ],
  };
}

export function webPage(opts: {
  locale: string;
  url: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "CollectionPage";
}) {
  return {
    "@context": "https://schema.org",
    "@type": opts.type ?? "WebPage",
    "@id": `${opts.url}/#webpage`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: opts.locale,
    isPartOf: { "@id": WEBSITE_ID },
    breadcrumb: { "@id": `${opts.url}/#breadcrumb` },
  };
}
