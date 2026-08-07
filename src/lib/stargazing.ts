export type StargazingTier = "poor" | "marginal" | "fair" | "good";

// Which factor dominated the score's penalty, so the UI layer can localize
// a "main limiting factor" message without this module baking in any
// particular language.
export type ConstraintFactor = "cloud" | "moon" | "light-pollution" | "none";

export type StargazingScore = {
  score: number; // 0-100
  tier: StargazingTier;
  constraintFactor: ConstraintFactor;
};

function scoreToTier(score: number): StargazingTier {
  if (score < 40) return "poor";
  if (score < 60) return "marginal";
  if (score < 80) return "fair";
  return "good";
}

// A deliberately simplified approximation of the reference site's (private,
// unknowable) scoring formula — same spirit as bortle.ts's own
// radianceToBortleEstimate() comment. Three penalties subtracted from a
// perfect 100, weighted so cloud cover dominates (it's the single biggest
// factor in whether you can see anything at all):
//   - cloud:            0-60 pts  (nightCloudCoverPercent * 0.6)
//   - moonlight:         0-25 pts  (moonIlluminationPercent * 0.25)
//   - light pollution:   0-15 pts  ((bortleClass - 1) * 1.875)
// The three weights sum to exactly 100, so the worst case floors at 0.
// Humidity (which the reference site's "Constraint" line sometimes names)
// is deliberately NOT a scoring input here — it's shown on the weather cards
// as raw info only, not folded into the score.
export function computeStargazingScore(input: {
  nightCloudCoverPercent: number;
  moonIlluminationPercent: number;
  bortleClass: number;
}): StargazingScore {
  const cloudPenalty = input.nightCloudCoverPercent * 0.6;
  const moonPenalty = input.moonIlluminationPercent * 0.25;
  const lightPollutionPenalty = (input.bortleClass - 1) * 1.875;

  const score = Math.round(Math.max(0, 100 - cloudPenalty - moonPenalty - lightPollutionPenalty));
  const tier = scoreToTier(score);

  const penalties: Array<{ factor: ConstraintFactor; value: number }> = [
    { factor: "cloud", value: cloudPenalty },
    { factor: "moon", value: moonPenalty },
    { factor: "light-pollution", value: lightPollutionPenalty },
  ];
  const worst = penalties.reduce((a, b) => (b.value > a.value ? b : a));
  const constraintFactor: ConstraintFactor = worst.value > 0 ? worst.factor : "none";

  return { score, tier, constraintFactor };
}
