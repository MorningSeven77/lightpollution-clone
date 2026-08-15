"use client";

import { useTranslations } from "next-intl";
import HomeMapExperience from "@/components/HomeMapExperience";

export default function DarkSkyMapPage() {
  const t = useTranslations("darkSkyMap");
  return (
    <HomeMapExperience
      heroTitle={t("title")}
      heroSubtitle={t("subtitle")}
      legendNamespace="darkSkyMap.legend"
      infoPanelNamespace="darkSkyMap.infoPanel"
    />
  );
}
