import { useTranslations } from "next-intl";
import type { DirectionalBrightnessPoint } from "@/app/api/directional-sky-brightness/route";

const COMPASS_POINTS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

function azimuthToCompassPoint(azimuthDeg: number): string {
  const index = Math.round(azimuthDeg / 22.5) % 16;
  return COMPASS_POINTS[index];
}

const WIDTH = 280;
const HEIGHT = 70;
// Same SQM 16-22 bounds bortle.ts itself classifies against, so this chart's
// vertical scale reads consistently with every other SQM number in the app.
const SQM_MIN = 16;
const SQM_MAX = 22;

function sqmToY(sqm: number): number {
  const clamped = Math.min(Math.max(sqm, SQM_MIN), SQM_MAX);
  // Brighter (lower SQM) sits higher on the chart, like a glow rising from
  // the horizon — darker (higher SQM) sits low, near the baseline.
  return HEIGHT * (1 - (SQM_MAX - clamped) / (SQM_MAX - SQM_MIN));
}

export type DirectionalSkyBrightnessChartProps = {
  directions: DirectionalBrightnessPoint[];
  darkest: DirectionalBrightnessPoint;
  brightest: DirectionalBrightnessPoint;
};

export default function DirectionalSkyBrightnessChart({ directions, darkest, brightest }: DirectionalSkyBrightnessChartProps) {
  const t = useTranslations("directionalSkyBrightness");

  const linePoints = directions
    .map((d) => `${(d.azimuthDeg / 360) * WIDTH},${sqmToY(d.sqm)}`)
    // Wraps back to azimuth 0's value at x=WIDTH so the curve closes cleanly
    // at the 360°/0° seam instead of visibly dropping to zero.
    .concat(`${WIDTH},${sqmToY(directions[0].sqm)}`)
    .join(" ");
  const areaPoints = `0,${HEIGHT} ${linePoints} ${WIDTH},${HEIGHT}`;

  const cardinals = [0, 90, 180, 270];

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT + 16}`} className="w-full">
        <defs>
          <linearGradient id="sky-glow-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {cardinals.map((deg) => (
          <line
            key={deg}
            x1={(deg / 360) * WIDTH}
            y1={0}
            x2={(deg / 360) * WIDTH}
            y2={HEIGHT}
            stroke="currentColor"
            className="text-white/10"
            strokeWidth={1}
          />
        ))}

        <polygon points={areaPoints} fill="url(#sky-glow-gradient)" />
        <polyline points={linePoints} fill="none" stroke="#f59e0b" strokeWidth={1.5} />

        {cardinals.map((deg) => (
          <text
            key={deg}
            x={(deg / 360) * WIDTH}
            y={HEIGHT + 12}
            textAnchor="middle"
            className="fill-zinc-500 text-[8px]"
          >
            {azimuthToCompassPoint(deg)}
          </text>
        ))}
      </svg>

      <div className="mt-1 space-y-0.5 text-[10px] text-zinc-400">
        <div>
          {t("darkestLabel")}:{" "}
          {t("directionStat", { compass: azimuthToCompassPoint(darkest.azimuthDeg), azimuth: darkest.azimuthDeg, sqm: darkest.sqm.toFixed(2) })}
        </div>
        <div>
          {t("brightestLabel")}:{" "}
          {t("directionStat", { compass: azimuthToCompassPoint(brightest.azimuthDeg), azimuth: brightest.azimuthDeg, sqm: brightest.sqm.toFixed(2) })}
        </div>
      </div>
      <div className="mt-1 text-[10px] leading-relaxed text-zinc-500">{t("caption")}</div>
    </div>
  );
}
