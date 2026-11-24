import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumb, localizedUrl, webPage } from "@/lib/structuredData";

const PAGE_COPY = {
  en: {
    title: "Clear Sky Map – Historical Clear-Night Climate",
    description:
      "Monthly share of historically clear nights from five years of weather archives. This clear sky map is a climate summary, not a forecast for tonight and not an hourly cloud map.",
  },
  zh: {
    title: "晴夜气候地图 – 历史晴夜比例，不是今晚预报",
    description: "用五年天气档案统计每个月历史上的晴夜比例。这张晴夜地图是气候摘要，不是今晚的预报，也不是逐小时云图。",
  },
} as const;

const PATH = "/clear-sky-map";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  return pageMetadata(locale, PATH, copy);
}

export default async function ClearSkyMapLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  const t = await getTranslations({ locale, namespace: "clearSkyMap" });
  const tHeader = await getTranslations({ locale, namespace: "siteHeader" });
  const url = localizedUrl(locale, PATH);

  return (
    <>
      <JsonLd data={webPage({ locale, url, name: t("pageTitle"), description: copy.description })} />
      <JsonLd
        data={breadcrumb({ locale, url, homeName: tHeader("title"), pageName: t("pageTitle") })}
      />
      {children}
    </>
  );
}
