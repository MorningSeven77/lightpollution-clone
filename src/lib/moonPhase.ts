import { moonPhaseToIlluminationPercent } from "@/lib/weather";

// Average length of a synodic month (new moon to new moon) in days, and a
// known reference new moon — standard values used by every simple lunar
// phase calculator. Real synodic months vary by a few hours around this
// average (lunar orbit isn't perfectly circular), so age/phase here are a
// deliberately simplified approximation, not a full ephemeris — same spirit
// as bortle.ts's radiance->Bortle math and terminator.ts's solar position.
// Checked against the reference site's own live reading (Last Quarter,
// 22.5 days, 46.3% illumination) — this formula gave 22.3 days / 48.4%,
// close enough for a UI display.
const SYNODIC_MONTH_DAYS = 29.530588853;
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

export type MoonPhaseId =
  | "new-moon"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full-moon"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

export const MOON_PHASE_LABELS: Record<MoonPhaseId, string> = {
  "new-moon": "新月",
  "waxing-crescent": "娥眉月（渐盈）",
  "first-quarter": "上弦月",
  "waxing-gibbous": "盈凸月",
  "full-moon": "满月",
  "waning-gibbous": "亏凸月",
  "last-quarter": "下弦月",
  "waning-crescent": "残月（渐亏）",
};

const PHASE_ORDER: MoonPhaseId[] = [
  "new-moon",
  "waxing-crescent",
  "first-quarter",
  "waxing-gibbous",
  "full-moon",
  "waning-gibbous",
  "last-quarter",
  "waning-crescent",
];

// Days since the most recent new moon, wrapped into [0, SYNODIC_MONTH_DAYS).
export function computeMoonAgeDays(date: Date): number {
  const daysSinceReference = (date.getTime() - REFERENCE_NEW_MOON_MS) / 86400000;
  const age = daysSinceReference % SYNODIC_MONTH_DAYS;
  return age < 0 ? age + SYNODIC_MONTH_DAYS : age;
}

export function moonAgeToPhaseId(ageDays: number): MoonPhaseId {
  const eighth = SYNODIC_MONTH_DAYS / 8;
  const index = Math.round(ageDays / eighth) % 8;
  return PHASE_ORDER[index];
}

export type NextPhaseDate = { phaseId: "new-moon" | "first-quarter" | "full-moon" | "last-quarter"; date: Date };

// The next occurrence of each of the four "named" phases (new/first
// quarter/full/last quarter), computed forward from the current age.
export function computeNextPhaseDates(date: Date): NextPhaseDate[] {
  const age = computeMoonAgeDays(date);
  const targets: Array<{ phaseId: NextPhaseDate["phaseId"]; targetAge: number }> = [
    { phaseId: "new-moon", targetAge: 0 },
    { phaseId: "first-quarter", targetAge: SYNODIC_MONTH_DAYS / 4 },
    { phaseId: "full-moon", targetAge: SYNODIC_MONTH_DAYS / 2 },
    { phaseId: "last-quarter", targetAge: (SYNODIC_MONTH_DAYS * 3) / 4 },
  ];

  return targets
    .map(({ phaseId, targetAge }) => {
      let daysUntil = targetAge - age;
      if (daysUntil <= 0) daysUntil += SYNODIC_MONTH_DAYS;
      return { phaseId, date: new Date(date.getTime() + daysUntil * 86400000) };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export type MoonPhaseInfo = {
  ageDays: number;
  illuminationPercent: number;
  phaseId: MoonPhaseId;
  phaseLabel: string;
  nextPhases: NextPhaseDate[];
};

export function getMoonPhaseInfo(date: Date): MoonPhaseInfo {
  const ageDays = computeMoonAgeDays(date);
  const phaseFraction = ageDays / SYNODIC_MONTH_DAYS;
  const phaseId = moonAgeToPhaseId(ageDays);
  return {
    ageDays,
    illuminationPercent: moonPhaseToIlluminationPercent(phaseFraction),
    phaseId,
    phaseLabel: MOON_PHASE_LABELS[phaseId],
    nextPhases: computeNextPhaseDates(date),
  };
}
