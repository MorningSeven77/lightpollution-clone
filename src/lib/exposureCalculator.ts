import { sqmToRadiance } from "@/lib/bortle";

export type CameraPreset = {
  id: string;
  label: string;
  pixelSizeUm: number;
  readNoiseE: number;
  sensorQePercent: number;
  darkCurrentEPerPxPerS: number;
};

// Starting values, not device specs — same disclaimer the reference site
// shows next to its own presets. Real cameras vary a lot within each category.
export const CAMERA_PRESETS: CameraPreset[] = [
  { id: "cooled-cmos", label: "制冷 CMOS", pixelSizeUm: 3.76, readNoiseE: 1.5, sensorQePercent: 80, darkCurrentEPerPxPerS: 0.005 },
  { id: "uncooled-cmos", label: "非制冷 CMOS", pixelSizeUm: 3.76, readNoiseE: 1.8, sensorQePercent: 75, darkCurrentEPerPxPerS: 0.05 },
  { id: "dslr", label: "单反/微单", pixelSizeUm: 4.3, readNoiseE: 3.5, sensorQePercent: 50, darkCurrentEPerPxPerS: 0.02 },
];

export const DEFAULT_CAMERA_PRESET_ID = "cooled-cmos";

export type ExposureInput = {
  sqm: number;
  focalRatio: number; // f/N — extended-source (sky glow) signal scales as 1/N², independent of aperture
  pixelSizeUm: number;
  readNoiseE: number;
  sensorQePercent: number;
  darkCurrentEPerPxPerS: number;
  opticsTransmissionPercent: number;
  allowedReadNoisePercent: number; // target: read noise should be no more than this % of total noise
  maxSubExposureSeconds: number; // practical ceiling — under very dark skies the noise-budget math alone recommends unrealistically long subs (guiding drift, satellite trails, etc. make those impractical anyway)
};

export type ExposureResult = {
  recommendedSubExposureSeconds: number;
  skyElectronRatePerSecond: number;
  cappedByMax: boolean;
};

// This is a deliberately simplified, empirically-calibrated approximation of
// a real "sub-exposure calculator" (a known astrophotography tool — the
// reference site has one too) — not a first-principles photometric
// derivation. Two pieces:
//
// 1. Sky signal rate: reuses this project's own sqmToRadiance() (already
//    used elsewhere for the light-pollution color scale) as a proxy for sky
//    brightness, scaled by pixel area, sensor QE, optics transmission, and
//    1/focalRatio² (a real optical relationship — for an extended source
//    like sky glow, collected flux per pixel scales with 1/f-ratio²,
//    independent of aperture, which is why the reference site's own
//    calculator only asks for focal ratio, not full aperture+focal length).
//    CALIBRATION_CONSTANT is chosen so a bright-city SQM (~17) with a
//    typical cooled-CMOS setup lands in the same ballpark (tens of seconds)
//    as real sub-exposure calculators report for that scenario — it is a
//    calibration anchor, not a derived physical constant.
// 2. Noise budget: this part IS standard CCD/CMOS noise theory (real, not
//    approximated) — shot noise from sky+dark current grows with exposure
//    time (variance = rate × t), read noise is fixed per exposure. Solving
//    for the time where read noise equals the target fraction of total
//    noise: readNoise² = targetFraction² × (skyRate + darkRate) × t.
const CALIBRATION_CONSTANT = 0.6;

export function computeSkyElectronRate(input: Pick<ExposureInput, "sqm" | "focalRatio" | "pixelSizeUm" | "sensorQePercent" | "opticsTransmissionPercent">): number {
  const radiance = sqmToRadiance(input.sqm);
  return (
    (CALIBRATION_CONSTANT * radiance * input.pixelSizeUm ** 2 * (input.sensorQePercent / 100) * (input.opticsTransmissionPercent / 100)) /
    input.focalRatio ** 2
  );
}

export function computeExposure(input: ExposureInput): ExposureResult {
  const skyRate = computeSkyElectronRate(input);
  const totalBackgroundRate = skyRate + input.darkCurrentEPerPxPerS;
  const targetFraction = input.allowedReadNoisePercent / 100;

  const uncapped = input.readNoiseE ** 2 / (targetFraction ** 2 * Math.max(totalBackgroundRate, 1e-6));
  const recommendedSubExposureSeconds = Math.min(uncapped, input.maxSubExposureSeconds);

  return {
    recommendedSubExposureSeconds,
    skyElectronRatePerSecond: skyRate,
    cappedByMax: uncapped > input.maxSubExposureSeconds,
  };
}
