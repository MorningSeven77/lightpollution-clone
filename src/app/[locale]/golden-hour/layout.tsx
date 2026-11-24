import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/pageMetadata";
import { breadcrumb, localizedUrl, webPage } from "@/lib/structuredData";

const PAGE_COPY = {
  en: {
    title: "When Are Golden Hours? Sunrise, Sunset and Blue Hour",
    description:
      "See when golden hour and blue hour fall for a date and place, with the sun direction. A searched place uses a longitude time estimate and can be off by about an hour near a time-zone boundary.",
  },
  zh: {
    title: "黄金时刻是什么时候？日出、日落与蓝调时刻",
    description: "查看某个日期和地点的黄金时刻、蓝调时刻以及太阳方向。搜索地点用经度估算时区，在时区边界附近可能差大约一小时。",
  },
} as const;

const PATH = "/golden-hour";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  return pageMetadata(locale, PATH, copy);
}

export default async function GoldenHourLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  const t = await getTranslations({ locale, namespace: "goldenHour" });
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
