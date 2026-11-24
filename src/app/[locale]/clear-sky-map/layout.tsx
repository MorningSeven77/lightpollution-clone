import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumb, localizedUrl, webPage } from "@/lib/structuredData";

const PAGE_COPY = {
  en: {
    title: "Clear Sky Map – Historical Clear-Night Climate",
    description:
      "See which months have historically had more clear nights at a place you choose. This is a climate summary from past weather archives.",
  },
  zh: {
    title: "晴夜气候地图 – 历史晴夜比例，不是今晚预报",
    description: "查看你选的地点在哪些月份历史上晴夜更多。这是根据过去天气档案做的气候摘要。",
  },
} as const;

const PATH = "/clear-sky-map";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  return pageMetadata(locale, PATH, copy);
}

export default async function ClearSkyMapLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  const t = await getTranslations({ locale, namespace: "clearSkyMap" });
  const tHeader = await getTranslations({ locale, namespace: "siteHeader" });
  const url = localizedUrl(locale, PATH);

  return (
    <>
      <JsonLd data={webPage({ locale, url, name: t("pageTitle"), description: copy.description })} />
      <JsonLd
        data={breadcrumb({ locale, url, homeName: tHeader("title"), pageName: t("pageTitle") })}
      />
      {children}
    </>
  );
}
