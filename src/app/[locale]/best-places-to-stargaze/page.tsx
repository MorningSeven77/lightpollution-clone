"use client";

import { useTranslations } from "next-intl";
import HomeMapExperience from "@/components/HomeMapExperience";

export default function BestPlacesToStargazePage() {
  const t = useTranslations("bestPlacesToStargaze");
  return (
    <HomeMapExperience
      heroTitle={t("title")}
      heroSubtitle={t("subtitle")}
      legendNamespace="bestPlacesToStargaze.legend"
      infoPanelNamespace="bestPlacesToStargaze.infoPanel"
      currentMapPage="best-places-to-stargaze"
      autoSearchBestSpotsOnLoad
      defaultShowDarkSkyPlaces
    />
  );
}
