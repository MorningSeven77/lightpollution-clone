import "server-only";
// Must be imported before "@google/earthengine" — it patches the transport
// the SDK uses for every network call. See earthEngineTransport.ts for why.
import "./earthEngineTransport";
import ee from "@google/earthengine";

// NOAA/VIIRS/DNB/ANNUAL_V22: annual VIIRS nighttime-lights composite.
// "average" is the average radiance band, in nW/sr/cm^2.
const VIIRS_COLLECTION = "NOAA/VIIRS/DNB/ANNUAL_V22";
const VIIRS_BAND = "average";
const LATEST_YEAR_START = "2024-01-01";
const LATEST_YEAR_END = "2025-01-01";

let initPromise: Promise<typeof ee> | null = null;

// ee.initialize() is a one-time, process-wide setup (the library keeps its
// state in module-level globals), so every request reuses this same promise
// instead of re-authenticating.
export function getEarthEngine(): Promise<typeof ee> {
  if (!initPromise) {
    initPromise = new Promise((resolve, reject) => {
      // Stored base64-encoded (see .env.local) so the JSON's quotes/newlines
      // never have to survive .env-file parsing or a hosting provider's env
      // var UI intact.
      const encodedKey = process.env.EARTH_ENGINE_SERVICE_ACCOUNT_KEY_B64;
      if (!encodedKey) {
        reject(new Error("EARTH_ENGINE_SERVICE_ACCOUNT_KEY_B64 is not set"));
        return;
      }

      let key: object;
      try {
        key = JSON.parse(Buffer.from(encodedKey, "base64").toString("utf8"));
      } catch {
        reject(new Error("EARTH_ENGINE_SERVICE_ACCOUNT_KEY_B64 did not decode to valid JSON"));
        return;
      }

      ee.data.authenticateViaPrivateKey(
        key,
        () => {
          ee.initialize(
            null,
            null,
            () => resolve(ee),
            (err: unknown) => reject(err instanceof Error ? err : new Error(String(err))),
          );
        },
        (err: unknown) => reject(err instanceof Error ? err : new Error(String(err))),
      );
    });

    // On failure, forget the cached promise so the next request can retry
    // instead of being stuck with a permanently-rejected singleton.
    initPromise.catch(() => {
      initPromise = null;
    });
  }

  return initPromise;
}

export function getViirsImage() {
  return ee
    .ImageCollection(VIIRS_COLLECTION)
    .filter(ee.Filter.date(LATEST_YEAR_START, LATEST_YEAR_END))
    .select(VIIRS_BAND)
    .first();
}
