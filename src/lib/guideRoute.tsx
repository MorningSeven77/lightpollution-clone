import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import GuideArticle from "@/components/GuideArticle";
import { getGuide, pathForGuide } from "@/content/guides/catalog";
import { isStateSlug, regionView } from "@/content/guides/regions";
import { STATE_PLACE_IDS, US_PLACE_IDS } from "@/content/guides/placeIndex";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/pageMetadata";
import { localizedUrl } from "@/lib/structuredData";
import countryRows from "@/data/countryLightPollution.json";

type GuideParams = { locale: string; state?: string };

export function guideMetadata(slug: string) {
  return async function generateMetadata({ params }: { params: Promise<GuideParams> }) {
    const { locale, state } = await params;
    const resolved = slug === "state" ? state : slug;
    if (!resolved || !hasLocale(routing.locales, locale)) return {};
    if (slug === "state" && !isStateSlug(resolved)) return {};
    const copy = getGuide(locale, resolved);
    return pageMetadata(locale, pathForGuide(resolved), {
      title: copy.metaTitle,
      description: copy.metaDescription,
    });
  };
}

export async function GuideRoute({
  slug,
  params,
}: {
  slug: string;
  params: Promise<GuideParams>;
}) {
  const { locale, state } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const resolved = slug === "state" ? state : slug;
  if (!resolved || (slug === "state" && !isStateSlug(resolved))) notFound();
  setRequestLocale(locale);

  const copy = getGuide(locale, resolved);
  const t = await getTranslations({ locale, namespace: "guides" });
  const placeIds =
    resolved === "us" ? US_PLACE_IDS : isStateSlug(resolved) ? STATE_PLACE_IDS[resolved] : undefined;

  return (
    <GuideArticle
      locale={locale}
      path={pathForGuide(resolved)}
      copy={copy}
      map={viewFor(resolved)}
      placeIds={placeIds}
      directory={resolved === "parks" ? "all" : placeIds ? "listed" : "none"}
      parent={
        isStateSlug(resolved)
          ? { name: t("navUs"), url: localizedUrl(locale, "/us-light-pollution-map") }
          : undefined
      }
      stats={resolved === "us" ? <UsStats locale={locale} /> : undefined}
    />
  );
}

function viewFor(slug: string) {
  if (slug === "us" || slug === "parks" || isStateSlug(slug)) return regionView(slug);
  return undefined;
}

function UsStats({ locale }: { locale: string }) {
  const rows = countryRows as { name: string; avgSqm: number; bortleLe4Percent: number }[];
  const us = rows.find((row) => row.name === "United States");
  const alaska = rows.find((row) => row.name === "United States (Alaska)");
  if (!us || !alaska) return null;
  return <UsStatsText locale={locale} us={us} alaska={alaska} />;
}

async function UsStatsText({
  locale,
  us,
  alaska,
}: {
  locale: string;
  us: { avgSqm: number; bortleLe4Percent: number };
  alaska: { avgSqm: number; bortleLe4Percent: number };
}) {
  const t = await getTranslations({ locale, namespace: "guides" });
  return (
    <section className="mt-8 rounded-lg border border-white/10 bg-zinc-900/50 p-4" id="national-average">
      <h2 className="text-sm font-medium text-zinc-100">{t("usStatsTitle")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">
        {t("usStatsBody", {
          sqm: us.avgSqm.toFixed(2),
          percent: String(us.bortleLe4Percent),
          alaskaSqm: alaska.avgSqm.toFixed(2),
          alaskaPercent: String(alaska.bortleLe4Percent),
          count: String(US_PLACE_IDS.length),
        })}
      </p>
    </section>
  );
}
