"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { RankedSpot } from "@/lib/bestSpots";
import BestSpotsSearchModal from "@/components/BestSpotsSearchModal";

export type BestSpotsPanelProps = {
  lat: number;
  lng: number;
  onResults: (spots: RankedSpot[]) => void;
};

export default function BestSpotsPanel({ lat, lng, onResults }: BestSpotsPanelProps) {
  const t = useTranslations("bestSpots");
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded border border-white/10 bg-zinc-800/50 px-2 py-1.5 text-xs hover:bg-zinc-800"
      >
        🔭 {t("triggerLabel")}
      </button>

      {open && <BestSpotsSearchModal lat={lat} lng={lng} onResults={onResults} onClose={() => setOpen(false)} />}
    </div>
  );
}
