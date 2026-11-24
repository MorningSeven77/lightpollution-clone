import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumb, faqPage, localizedUrl, webPage, type QAItem } from "@/lib/structuredData";

const PAGE_COPY = {
  en: {
    title: "Best Places to Stargaze Near You",
    description:
      "Search darker places to stargaze around a town or a point you choose. State maps cover Texas, Colorado, and the other listed states.",
  },
  zh: {
    title: "最佳观星地点 – 查找附近观星点",
    description: "围绕一个城镇或你选的地点，查找更暗的观星地方。州地图覆盖得克萨斯、科罗拉多和其他已列出的州。",
  },
} as const;

const PATH = "/best-places-to-stargaze";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  return pageMetadata(locale, PATH, copy);
}

export default async function BestPlacesToStargazeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  const t = await getTranslations({ locale, namespace: "bestPlacesToStargaze" });
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
