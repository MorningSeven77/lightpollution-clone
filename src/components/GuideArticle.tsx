import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SiteHeader from "@/components/SiteHeader";
import EmbeddedRegionMap from "@/components/EmbeddedRegionMap";
import GuideDiagram from "@/components/GuideDiagrams";
import OpenOnMapSearch from "@/components/OpenOnMapSearch";
import PlaceDirectory, { type DirectoryRow } from "@/components/PlaceDirectory";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumb, faqPage, localizedUrl, webPage } from "@/lib/structuredData";
import { DARK_SKY_PLACES, type DarkSkyPlaceCategory } from "@/lib/darkSkyPlaces";
import { STATE_PLACE_IDS, US_PLACE_IDS, type StateSlug } from "@/content/guides/placeIndex";
import type { GuideCopy } from "@/content/guides/types";
import type { MapView } from "@/lib/urlState";

const VIIRS_URL = "https://developers.google.com/earth-engine/datasets/catalog/NOAA_VIIRS_DNB_ANNUAL_V22";

const STATE_ORDER = Object.keys(STATE_PLACE_IDS) as StateSlug[];

function regionLabelFor(
  id: number,
  stateNames: Record<StateSlug, string>,
  usLabel: string,
): string | null {
  for (const slug of STATE_ORDER) {
    if ((STATE_PLACE_IDS[slug] as readonly number[]).includes(id)) return stateNames[slug];
  }
  if (US_PLACE_IDS.includes(id)) return usLabel;
  return null;
}

export default async function GuideArticle({
  locale,
  path,
  copy,
  map,
  placeIds,
  directory = "listed",
  parent,
  stats,
}: {
  locale: string;
  path: string;
  copy: GuideCopy;
  map?: MapView;
  placeIds?: readonly number[];
  directory?: "listed" | "all" | "none";
  parent?: { name: string; url: string };
  stats?: ReactNode;
}) {
  const [t, tHeader, tCat] = await Promise.all([
    getTranslations({ locale, namespace: "guides" }),
    getTranslations({ locale, namespace: "siteHeader" }),
    getTranslations({ locale, namespace: "dataLabels.darkSkyCategories" }),
  ]);
  const stateNames = t.raw("stateNames") as Record<StateSlug, string>;
  const url = localizedUrl(locale, path);

  const sourcePlaces =
    directory === "all"
      ? DARK_SKY_PLACES
      : directory === "none"
        ? []
        : DARK_SKY_PLACES.filter((place) => placeIds?.includes(place.id));

  const rows: DirectoryRow[] = [...sourcePlaces]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      categoryLabel: tCat(place.category as DarkSkyPlaceCategory),
      yearText: place.year == null ? t("yearMissing") : t("yearLabel", { year: place.year }),
      link: place.link,
      regionLabel: regionLabelFor(place.id, stateNames, t("unitedStates")),
    }));

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <JsonLd data={webPage({ locale, url, name: copy.h1, description: copy.metaDescription })} />
      <JsonLd data={breadcrumb({ locale, url, homeName: tHeader("title"), pageName: copy.h1, parent })} />
      <JsonLd data={faqPage({ locale, url, qa: copy.faq })} />
      {rows.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${url}/#places`,
            numberOfItems: rows.length,
            itemListElement: rows.map((row, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: row.name,
              url: row.link,
            })),
          }}
        />
      )}
      <SiteHeader titleAsHeading={false} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-100">
          {t("backToMap")}
        </Link>
        <p className="mt-4 text-xs font-medium tracking-wide text-blue-400">{copy.eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold">{copy.h1}</h1>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-300">
          {copy.lede.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {copy.toolEntry && (
          <section className="mt-8 rounded-lg border border-white/10 bg-zinc-900/50 p-4">
            <h2 className="text-sm font-medium text-zinc-100">{t("toolEntryTitle")}</h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">{t("toolEntryBody")}</p>
            <div className="mt-3">
              <OpenOnMapSearch />
            </div>
          </section>
        )}

        {map && (
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-medium text-zinc-200">{t("mapHeading")}</h2>
            <EmbeddedRegionMap initialView={map} />
          </section>
        )}

        {stats}

        {copy.diagram && (
          <div className="mt-8">
            <GuideDiagram diagram={copy.diagram} />
          </div>
        )}

        {copy.sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-8">
            <h2 className="mb-2 text-base font-medium text-zinc-100">{section.heading}</h2>
            <div className="space-y-3 text-sm leading-relaxed text-zinc-300">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        {directory !== "none" && (
          <section className="mt-8" id="places">
            <h2 className="mb-2 text-base font-medium text-zinc-100">{t("placesTitle")}</h2>
            <p className="mb-3 text-xs leading-relaxed text-zinc-400">{t("placesBody")}</p>
            {rows.length === 0 ? <p className="text-sm text-zinc-300">{t("noPlaces")}</p> : <PlaceDirectory rows={rows} />}
          </section>
        )}

        <section className="mt-8" id="faq">
          <h2 className="mb-3 text-base font-medium text-zinc-100">{t("faqTitle")}</h2>
          <div className="space-y-4">
            {copy.faq.map((item) => (
              <div key={item.question}>
                <h3 className="text-sm font-medium text-zinc-200">{item.question}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-2 text-base font-medium text-zinc-100">{t("relatedTitle")}</h2>
          <ul className="space-y-1 text-sm">
            {copy.related
              .filter((item) => item.href !== path)
              .map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-blue-400 hover:text-blue-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="mb-2 text-base font-medium text-zinc-100">{t("sourcesTitle")}</h2>
          <ul className="space-y-2 text-xs leading-relaxed text-zinc-400">
            <li>
              <a href={VIIRS_URL} className="text-blue-400 hover:text-blue-300">
                {t("sourceViirs")}
              </a>
            </li>
            <li>
              <Link href="/about-data" className="text-blue-400 hover:text-blue-300">
                {t("sourceAbout")}
              </Link>
            </li>
            <li>{t("sourceDarkSky")}</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
