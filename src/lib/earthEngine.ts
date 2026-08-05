import "server-only";
// Must be imported before "@google/earthengine" — it patches the transport
// the SDK uses for every network call. See earthEngineTransport.ts for why.
import { getUndiciClient } from "./earthEngineTransport";
import ee from "@google/earthengine";
import { createSign } from "crypto";

const EE_AUTH_SCOPES = [
  "https://www.googleapis.com/auth/earthengine",
  "https://www.googleapis.com/auth/cloud-platform",
  "https://www.googleapis.com/auth/drive",
];

type ServiceAccountKey = { client_email: string; private_key: string };
type GoogleAccessToken = { access_token: string; token_type: string; expires_in: number };

// @google/earthengine normally authenticates via googleapis's
// `google.auth.JWT`, which sends its token request through gaxios. gaxios
// only knows how to attach a proxy as a Node `https.Agent` — when it ends up
// calling Node's native fetch (as this SDK version does), fetch has no
// `agent` option, silently drops it, and the token request goes out
// unproxied. That's unreachable on a network that needs a proxy to reach
// googleapis.com at all, so instead of going through google.auth.JWT this
// does the same RFC 7523 JWT-bearer token exchange by hand with undici's own
// fetch + ProxyAgent via getUndiciClient() (see earthEngineTransport.ts for
// why it has to be undici's fetch specifically, not Node's native one), and
// hands the resulting token to EE directly via ee.data.setAuthToken.
async function getGoogleAccessToken(key: ServiceAccountKey): Promise<GoogleAccessToken> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: key.client_email,
    scope: EE_AUTH_SCOPES.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  };
  const base64url = (obj: object) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsignedToken = `${base64url(header)}.${base64url(claimSet)}`;
  const signature = createSign("RSA-SHA256").update(unsignedToken).sign(key.private_key).toString("base64url");
  const jwt = `${unsignedToken}.${signature}`;

  const { fetch: undiciFetch, dispatcher } = await getUndiciClient();
  const res = await undiciFetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
    ...(dispatcher ? { dispatcher } : {}),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as GoogleAccessToken;
}

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

      let key: ServiceAccountKey;
      try {
        key = JSON.parse(Buffer.from(encodedKey, "base64").toString("utf8"));
      } catch {
        reject(new Error("EARTH_ENGINE_SERVICE_ACCOUNT_KEY_B64 did not decode to valid JSON"));
        return;
      }

      getGoogleAccessToken(key).then(
        (token) => {
          ee.data.setAuthToken(
            key.client_email,
            token.token_type,
            token.access_token,
            token.expires_in,
            [],
            () => {
              ee.initialize(
                null,
                null,
                () => resolve(ee),
                (err: unknown) => reject(err instanceof Error ? err : new Error(String(err))),
              );
            },
            false,
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

// The "V22" annual composite (getViirsImage's source) only covers 2022+ —
// NOAA reprocessed it separately from the earlier years, which still live in
// "V21" (2013-2021). Merging both is what makes a multi-year trend possible.
export function getViirsTrendCollection() {
  const v21 = ee.ImageCollection("NOAA/VIIRS/DNB/ANNUAL_V21").select(VIIRS_BAND);
  const v22 = ee.ImageCollection(VIIRS_COLLECTION).select(VIIRS_BAND);
  return v21.merge(v22);
}
