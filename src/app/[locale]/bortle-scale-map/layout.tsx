import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumb, faqPage, localizedUrl, webPage, type QAItem } from "@/lib/structuredData";

const PAGE_COPY = {
  en: {
    title: "Bortle Scale Map – Find Your Bortle Class | LightPollutionMap.io",
    description:
      "See how dark the night sky is anywhere on Earth with our interactive Bortle scale map — built for stargazers, photographers, and dark-sky seekers.",
  },
  zh: {
    title: "波特尔等级地图 – 查询你所在地的波特尔等级 | LightPollutionMap.io",
    description: "用交互式波特尔等级地图查看地球上任意地点的夜空黑暗程度——专为观星爱好者、摄影师和暗夜寻访者打造。",
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
  return {
    title: copy.title,
    description: copy.description,
  };
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
