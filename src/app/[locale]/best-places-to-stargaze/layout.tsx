import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumb, faqPage, localizedUrl, webPage, type QAItem } from "@/lib/structuredData";

const PAGE_COPY = {
  en: {
    title: "Best Places to Stargaze Near You",
    description:
      "Find places to stargaze near you from modeled night-sky darkness. This is our own spot search, not a separate product. State maps cover Texas, Colorado, and the other listed states.",
  },
  zh: {
    title: "最佳观星地点 – 查找附近观星点",
    description: "按模型化的夜空黑暗程度查找附近观星地点。这是本站自己的地点搜索，不是另一个产品。州地图覆盖得克萨斯、科罗拉多和其他已列出的州。",
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
