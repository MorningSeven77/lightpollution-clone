import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumb, localizedUrl, webPage } from "@/lib/structuredData";

const PAGE_COPY = {
  en: {
    title: "Global Light Pollution Rankings by Country | Light Pollution Map",
    description:
      "Compare countries with a simplified conversion of satellite night lights: area-weighted sky brightness, how much brighter the sky is than the darkest row, and the share of land at the darker Bortle classes. These are model figures, not meter readings.",
  },
  zh: {
    title: "全球国家/地区光污染排行榜 | 光污染地图",
    description: "用卫星夜间灯光的简化换算比较各个国家：按面积加权的天空亮度、比最暗一行亮多少，以及较暗波特尔等级所占的陆地比例。这些是模型数字，不是实测读数。",
  },
} as const;

const PATH = "/rankings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  return pageMetadata(locale, PATH, copy);
}

export default async function RankingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  const t = await getTranslations({ locale, namespace: "rankings" });
  const tHeader = await getTranslations({ locale, namespace: "siteHeader" });
  const url = localizedUrl(locale, PATH);

  return (
    <>
      <JsonLd
        data={webPage({
          locale,
          url,
          name: t("pageTitle"),
          description: copy.description,
          type: "CollectionPage",
        })}
      />
      <JsonLd
        data={breadcrumb({ locale, url, homeName: tHeader("title"), pageName: t("navLabel") })}
      />
      {children}
    </>
  );
}
