import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumb, faqPage, localizedUrl, webPage, type QAItem } from "@/lib/structuredData";

const PAGE_COPY = {
  en: {
    title: "Best Places to Stargaze – Find Stargazing Spots Near You",
    description:
      "Find the best places to stargaze near you, ranked by night-sky darkness — locate dark, clear spots to see the Milky Way and stars in full view.",
  },
  zh: {
    title: "最佳观星地点 – 查找附近的观星点",
    description: "在地图上直接找到附近最佳观星地点——按夜空黑暗程度排名，定位适合看银河和满天繁星的黑暗晴朗地点。",
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
  return {
    title: copy.title,
    description: copy.description,
  };
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
