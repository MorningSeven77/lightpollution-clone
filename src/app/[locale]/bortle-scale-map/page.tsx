"use client";

import { useTranslations } from "next-intl";
import HomeMapExperience from "@/components/HomeMapExperience";

export default function BortleScaleMapPage() {
  const t = useTranslations("bortleScaleMap");
  return (
    <HomeMapExperience
      heroTitle={t("title")}
      heroSubtitle={t("subtitle")}
      legendNamespace="bortleScaleMap.legend"
      infoPanelNamespace="bortleScaleMap.infoPanel"
      infoPanelGrouped
    />
  );
}
