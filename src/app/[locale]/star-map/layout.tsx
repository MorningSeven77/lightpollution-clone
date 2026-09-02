import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumb, localizedUrl, webPage } from "@/lib/structuredData";

const PAGE_COPY = {
  en: {
    title: "Star Map — Real-Time Night Sky Viewer | Light Pollution Map",
    description:
      "A real-time 3D star map: drag to look around the sky, see the Sun, Moon and planets in their true positions, and the 88 constellations, for any date, time and location.",
  },
  zh: {
    title: "星空图 — 实时夜空查看器 | 光污染地图",
    description: "实时 3D 星空图：拖拽转向查看星空，展示任意日期、时间、地点下太阳/月亮/行星的真实位置和 88 个星座连线。",
  },
} as const;

const PATH = "/star-map";

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

export default async function StarMapLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  const t = await getTranslations({ locale, namespace: "starMap" });
  const tHeader = await getTranslations({ locale, namespace: "siteHeader" });
  const url = localizedUrl(locale, PATH);

  return (
    <>
      <JsonLd data={webPage({ locale, url, name: t("pageTitle"), description: copy.description })} />
      <JsonLd
        data={breadcrumb({ locale, url, homeName: tHeader("title"), pageName: t("navLabel") })}
      />
      {children}
    </>
  );
}
