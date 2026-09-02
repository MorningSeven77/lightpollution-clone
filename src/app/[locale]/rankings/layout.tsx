import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumb, localizedUrl, webPage } from "@/lib/structuredData";

const PAGE_COPY = {
  en: {
    title: "Global Light Pollution Rankings by Country | Light Pollution Map",
    description:
      "Average SQM, sky-background ratio, and Bortle ≤4 land share for every country, based on VIIRS satellite night-light data — sortable and searchable.",
  },
  zh: {
    title: "全球国家/地区光污染排行榜 | 光污染地图",
    description: "基于 VIIRS 卫星夜间灯光数据的各国平均 SQM、天空背景亮度比值和 Bortle ≤4 面积占比排行——可排序、可搜索。",
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
  return {
    title: copy.title,
    description: copy.description,
  };
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
