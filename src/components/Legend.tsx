"use client";

import { useTranslations } from "next-intl";
import { ColorStyleId, COLOR_STYLES, paletteToCssGradient, paletteToBortleSwatches } from "@/lib/colorStyles";
import { radianceToBortleEstimate } from "@/lib/bortle";

export type LegendProps = {
  colorStyle: ColorStyleId;
  // Lets keyword-landing variants of the home page (e.g. /bortle-scale-map)
  // swap in their own legend title while reusing this same component. Must
  // point at a namespace with the same shape as the default "legend".
  namespace?: string;
};

export default function Legend({ colorStyle, namespace = "legend" }: LegendProps) {
  const style = COLOR_STYLES[colorStyle];
  const t = useTranslations(namespace);
  const tColorStyles = useTranslations("dataLabels.colorStyles");

  return (
    <div className="absolute bottom-4 left-4 z-10 w-56 rounded-md border border-white/10 bg-zinc-900/90 px-3 py-2 text-xs text-zinc-100 shadow-lg backdrop-blur">
      <h2 className="mb-1 font-medium">{t("title", { styleLabel: tColorStyles(`${colorStyle}.label`) })}</h2>
      {style.legendType === "bortle" ? <BortleLegend palette={style.palette} /> : <SqmLegend min={style.min} max={style.max} palette={style.palette} />}
      <div className="mt-2 text-zinc-400">{t("hint")}</div>
    </div>
  );
}

function BortleLegend({ palette }: { palette: string[] }) {
  const swatches = paletteToBortleSwatches(palette);
  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {swatches.map((hex, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: `#${hex}` }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-zinc-400">
        {swatches.map((_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
    </div>
  );
}

function SqmLegend({ min, max, palette }: { min: number; max: number; palette: string[] }) {
  const darkSqm = radianceToBortleEstimate(min).sqm;
  const brightSqm = radianceToBortleEstimate(max).sqm;
  // The midpoint of the *SQM* scale, not of the underlying (log-compressed)
  // radiance range — e.g. dark/bright 22/17 should show a 19.5 tick, matching
  // the reference site, not whatever value radiance's arithmetic mean maps to.
  const midSqm = Math.round(((darkSqm + brightSqm) / 2) * 100) / 100;

  return (
    <div>
      <div className="h-2 w-full rounded-full" style={{ background: paletteToCssGradient(palette) }} />
      <div className="mt-1 flex justify-between text-zinc-400">
        <span>{darkSqm}</span>
        <span>{midSqm}</span>
        <span>{brightSqm}</span>
      </div>
    </div>
  );
}
