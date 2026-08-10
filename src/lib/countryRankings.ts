import rawCountries from "@/data/countryLightPollution.json";

export type CountryLightPollutionEntry = {
  name: string;
  code: string;
  avgSqm: number;
  bortleLe4Percent: number;
  pixelCount: number;
};

// Static, precomputed data — same "offline one-time collection" pattern as
// darkSkyPlaces.ts, and for the same reason: a live Earth Engine
// reduceRegions() over a country's full land area (Russia, Canada, China...)
// takes tens of seconds each, entirely impractical to run per page request.
export const COUNTRY_LIGHT_POLLUTION: CountryLightPollutionEntry[] = rawCountries as CountryLightPollutionEntry[];
