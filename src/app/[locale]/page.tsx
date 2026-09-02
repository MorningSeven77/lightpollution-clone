import { getTranslations, setRequestLocale } from "next-intl/server";
import HomeMapExperience from "@/components/HomeMapExperience";
import { JsonLd } from "@/components/JsonLd";
import { faqPage, localizedUrl, webApplication, type QAItem } from "@/lib/structuredData";

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
