import { getTranslations, setRequestLocale } from "next-intl/server";
import HomeMapExperience from "@/components/HomeMapExperience";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/pageMetadata";
import { faqPage, localizedUrl, webApplication, type QAItem } from "@/lib/structuredData";

const HOME_COPY = {
  en: {
    title: "Light Pollution Map – World Night Lights, Bortle and SQM",
    description:
      "World light pollution map of artificial night lights. Click any place for an approximate Bortle class and SQM-style value from VIIRS. The United States has a separate map.",
  },
  zh: {
    title: "光污染地图 – 世界夜间灯光、波特尔等级与 SQM",
    description: "世界光污染地图，展示人工夜间灯光。点击任意地点，查看由 VIIRS 换算的近似波特尔等级和 SQM 风格数值。美国有单独的地图。",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const copy = locale === "zh" ? HOME_COPY.zh : HOME_COPY.en;
  return pageMetadata(locale, "", copy);
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tHeader = await getTranslations({ locale, namespace: "siteHeader" });
  const tFaq = await getTranslations({ locale, namespace: "infoPanel" });
  // The FAQ panel copy (src/components/InfoPanel.tsx) doubles as the source
  // for FAQPage structured data — same questions/answers, no second copy to
  // keep in sync.
  const qa = tFaq.raw("qa") as QAItem[];
  const homeUrl = localizedUrl(locale, "");

  return (
    <>
      <JsonLd
        data={webApplication({
          locale,
          name: tHeader("title"),
          description: tHeader("subtitle"),
        })}
      />
      <JsonLd data={faqPage({ locale, url: homeUrl, qa })} />
      <HomeMapExperience />
    </>
  );
}
