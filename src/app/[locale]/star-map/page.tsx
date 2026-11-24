import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SiteHeader from "@/components/SiteHeader";
import StarMapExperience from "@/components/StarMapExperience";

export default async function StarMapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "starMap" });

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <SiteHeader title={t("pageTitle")} subtitle={t("pageSubtitle")} showOtherMapsMenu currentMapPage="star-map" />
      <Suspense fallback={<div className="relative flex-1 bg-zinc-950" />}>
        <StarMapExperience />
      </Suspense>
    </main>
  );
}
