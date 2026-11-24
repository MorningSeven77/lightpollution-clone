import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumb, faqPage, localizedUrl, webPage, type QAItem } from "@/lib/structuredData";

const PAGE_COPY = {
  en: {
    title: "Bortle Scale Map – Classes 1–9 for Any Location",
    description:
      "Find the Bortle class for a place and read what classes 1 through 9 mean. The class on the map is estimated from satellite night lights.",
  },
  zh: {
    title: "波特尔等级地图 – 1 到 9 级与所在位置",
    description: "查找一个地点的波特尔等级，并阅读 1 到 9 级分别是什么意思。地图上的等级由卫星夜间灯光估计。",
  },
} as const;

const PATH = "/bortle-scale-map";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  return pageMetadata(locale, PATH, copy);
}

export default async function BortleScaleMapLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  const t = await getTranslations({ locale, namespace: "bortleScaleMap" });
  const tHeader = await getTranslations({ locale, namespace: "siteHeader" });
  const url = localizedUrl(locale, PATH);

  // This page's FAQ copy is grouped into modules — flatten every module's
  // Q&A into one list for the FAQPage node.
  const modules = t.raw("infoPanel.modules") as { qa: QAItem[] }[];
  const qa = modules.flatMap((m) => m.qa);

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
