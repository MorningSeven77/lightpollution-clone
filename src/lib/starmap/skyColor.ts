import { Color } from "three";

export type SkyColorStop = { altitudeDeg: number; color: string };

// Ordered from brightest (highest sun altitude) to darkest (lowest).
// Daytime blue at/above +10°, the classic warm horizon glow right at 0°
// (sunrise/sunset), then the three standard twilight bands -- civil,
// nautical, astronomical -- at the same -6°/-12°/-18° breakpoints
// sunPosition.ts's own computeSunEvents already uses for blue/golden hour
// (not a separate set of thresholds invented for this feature). Below -18°
// (astronomical night) it fades into this feature's original fixed
// night-sky color (#03030a, previously the Canvas's only background value
// -- see StarMapCanvas.tsx), so real night-time rendering is bit-for-bit
// unchanged from before this feature existed.
const SKY_COLOR_STOPS: SkyColorStop[] = [
  { altitudeDeg: 10, color: "#7ec8ff" },
  { altitudeDeg: 0, color: "#ff9d5c" },
  { altitudeDeg: -6, color: "#3a3a66" },
  { altitudeDeg: -12, color: "#12162e" },
  { altitudeDeg: -18, color: "#03030a" },
];

// Piecewise-linear interpolation through the stops above, keyed on the
// sun's TRUE current elevation -- not the deliberately J2000-frame-locked
// position the Sun's own rendered dot uses elsewhere in this feature (see
// SolarSystemBodies.tsx's comment on why that one stays frame-locked to
// the stars instead of drifting relative to them). Sky color instead needs
// the physically real elevation, which is exactly what sunPosition.ts's
// already-validated computeSolarPosition provides -- reused here rather
// than duplicating solar-position math a second time.
export function skyColorForSunAltitude(sunAltitudeDeg: number): string {
  const brightest = SKY_COLOR_STOPS[0];
  const darkest = SKY_COLOR_STOPS[SKY_COLOR_STOPS.length - 1];
  if (sunAltitudeDeg >= brightest.altitudeDeg) return brightest.color;
  if (sunAltitudeDeg <= darkest.altitudeDeg) return darkest.color;

  for (let i = 0; i < SKY_COLOR_STOPS.length - 1; i++) {
    const upper = SKY_COLOR_STOPS[i];
    const lower = SKY_COLOR_STOPS[i + 1];
    if (sunAltitudeDeg <= upper.altitudeDeg && sunAltitudeDeg >= lower.altitudeDeg) {
      const t = (upper.altitudeDeg - sunAltitudeDeg) / (upper.altitudeDeg - lower.altitudeDeg);
      const blended = new Color(upper.color).lerp(new Color(lower.color), t);
      return `#${blended.getHexString()}`;
    }
  }
  // Unreachable given the two clamp checks above and SKY_COLOR_STOPS being
  // sorted/contiguous -- satisfies TypeScript's control-flow analysis.
  return darkest.color;
}
