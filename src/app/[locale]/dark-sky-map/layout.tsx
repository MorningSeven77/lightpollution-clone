import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumb, faqPage, localizedUrl, webPage, type QAItem } from "@/lib/structuredData";

const PAGE_COPY = {
  en: {
    title: "Dark Sky Map – Check the Dark Sky Scale by Location",
    description:
      "An interactive dark sky map showing night sky darkness worldwide, rated on the dark sky scale used to compare stargazing conditions by location.",
  },
  zh: {
    title: "暗夜地图 – 按地点查询暗夜等级",
    description: "交互式暗夜地图，展示全球任意地点的夜空黑暗程度，评级标准与用于比较各地观星条件的暗夜等级一致。",
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
  return {
    title: copy.title,
    description: copy.description,
  };
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
