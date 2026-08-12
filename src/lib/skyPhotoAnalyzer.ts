import { radianceToBortleEstimate, sqmToRadiance, type BortleEstimate } from "./bortle";

// This is a rougher approximation than every other Bortle/SQM number in this
// app — those all trace back to real VIIRS satellite radiance. This one has
// no calibration reference at all: no EXIF (ISO/shutter/aperture), no known
// reference star, no professional photometry — just the average pixel
// brightness of an uploaded photo run through a log-scale curve. Checked
// what lightpollutionmap.app's own equivalent feature does (fetched and
// inspected its client bundle) before building this: it turns out to do the
// same thing — draw the photo to a canvas, read average pixel brightness,
// log-scale it into an SQM/Bortle estimate, entirely client-side, no EXIF or
// server-side vision model involved. Real camera auto-exposure varies a lot
// device to device, so — same as that reference — this is a rough,
// illustrative estimate, not a measurement.
const PHOTO_BRIGHTNESS_MAX = 255;
const SQM_MIN = 16;
const SQM_MAX = 22;
// Endpoints chosen so a near-black photo (empty night sky, tiny average
// pixel value) lands near the darkest end of the app's SQM scale, and a
// fully-bright photo (255 average — daylight, or a light source in frame)
// lands near the brightest end, via the same log10 compression
// radianceToBortleEstimate itself uses for satellite radiance.
const LOG_DIVISOR = Math.log10(PHOTO_BRIGHTNESS_MAX + 1);

export type PhotoBrightnessEstimate = BortleEstimate & { avgBrightness: number };

// avgBrightness: 0-255 average pixel luminance sampled from the uploaded
// photo's canvas pixel data (see SkyPhotoAnalyzer.tsx for how it's computed).
export function estimateFromPhotoBrightness(avgBrightness: number): PhotoBrightnessEstimate {
  const clamped = Math.min(Math.max(avgBrightness, 0), PHOTO_BRIGHTNESS_MAX);
  const sqm = SQM_MAX - (Math.log10(clamped + 1) / LOG_DIVISOR) * (SQM_MAX - SQM_MIN);
  const radiance = sqmToRadiance(sqm);
  return { ...radianceToBortleEstimate(radiance), avgBrightness: clamped };
}

export type PollutionSeverityTier = "excellent" | "good" | "moderate" | "high" | "veryHigh";

// Buckets the 1-9 Bortle scale into 5 coarser bands for a quick-read badge —
// labels/colors live with the caller (translations.ts / the component), this
// just picks which of the 5 bands a given class falls into.
export function bortleSeverityTier(bortleClass: number): PollutionSeverityTier {
  if (bortleClass <= 2) return "excellent";
  if (bortleClass <= 4) return "good";
  if (bortleClass <= 6) return "moderate";
  if (bortleClass <= 8) return "high";
  return "veryHigh";
}
