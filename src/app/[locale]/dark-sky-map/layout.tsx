import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumb, faqPage, localizedUrl, webPage, type QAItem } from "@/lib/structuredData";

const PAGE_COPY = {
  en: {
    title: "Dark Sky Map – Worldwide Night-Sky Darkness",
    description:
      "A worldwide dark sky map of night-sky darkness from satellite night lights. Compare places on one global map. Bortle class definitions stay on the Bortle scale map, and the United States has its own map.",
  },
  zh: {
    title: "暗夜地图 – 全球夜空黑暗程度",
    description: "全球暗夜地图，用卫星夜间灯光比较各地夜空有多暗。波特尔等级说明在波特尔等级地图上，美国有单独的地图。",
  },
} as const;

const PATH = "/dark-sky-map";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  return pageMetadata(locale, PATH, copy);
}

export default async function DarkSkyMapLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  const t = await getTranslations({ locale, namespace: "darkSkyMap" });
  const tHeader = await getTranslations({ locale, namespace: "siteHeader" });
  const url = localizedUrl(locale, PATH);
  const qa = t.raw("infoPanel.qa") as QAItem[];

  return (
    <>
      <JsonLd data={webPage({ locale, url, name: t("title"), description: copy.description })} />
      <JsonLd
        data={breadcrumb({ locale, url, homeName: tHeader("title"), pageName: t("navLabel") })}
      />
      <JsonLd data={faqPage({ locale, url, qa })} />
      {children}
    </>
  );
}
