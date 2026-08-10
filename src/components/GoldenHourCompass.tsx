const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 80;

type AzimuthRange = { startAzimuthDeg: number; endAzimuthDeg: number };

export type GoldenHourCompassProps = {
  morningBlueHour: AzimuthRange | null;
  morningGoldenHour: AzimuthRange | null;
  eveningGoldenHour: AzimuthRange | null;
  eveningBlueHour: AzimuthRange | null;
  labels: { north: string; east: string; south: string; west: string };
};

// Azimuth 0° (north) maps to the top of the circle, increasing clockwise —
// standard compass convention, matching how azimuth is defined in
// sunPosition.ts.
function pointOnCircle(azimuthDeg: number, radius: number): { x: number; y: number } {
  const rad = (azimuthDeg * Math.PI) / 180;
  return { x: CENTER + radius * Math.sin(rad), y: CENTER - radius * Math.cos(rad) };
}

function arcPath(range: AzimuthRange, radius: number): string {
  const start = pointOnCircle(range.startAzimuthDeg, radius);
  const end = pointOnCircle(range.endAzimuthDeg, radius);
  const spanDeg = ((range.endAzimuthDeg - range.startAzimuthDeg + 360) % 360) || 360;
  const largeArcFlag = spanDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export default function GoldenHourCompass({
  morningBlueHour,
  morningGoldenHour,
  eveningGoldenHour,
  eveningBlueHour,
  labels,
}: GoldenHourCompassProps) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[220px]" role="img" aria-hidden="true">
      <circle cx={CENTER} cy={CENTER} r={RADIUS} className="fill-none stroke-white/10" strokeWidth={1} />

      {morningBlueHour && (
        <path d={arcPath(morningBlueHour, RADIUS)} className="fill-none stroke-blue-400" strokeWidth={6} strokeLinecap="round" />
      )}
      {eveningBlueHour && (
        <path d={arcPath(eveningBlueHour, RADIUS)} className="fill-none stroke-blue-400" strokeWidth={6} strokeLinecap="round" />
      )}
      {morningGoldenHour && (
        <path d={arcPath(morningGoldenHour, RADIUS)} className="fill-none stroke-amber-400" strokeWidth={6} strokeLinecap="round" />
      )}
      {eveningGoldenHour && (
        <path d={arcPath(eveningGoldenHour, RADIUS)} className="fill-none stroke-amber-400" strokeWidth={6} strokeLinecap="round" />
      )}

      <text x={CENTER} y={CENTER - RADIUS - 8} textAnchor="middle" className="fill-zinc-400 text-[10px]">
        {labels.north}
      </text>
      <text x={CENTER + RADIUS + 10} y={CENTER + 3} textAnchor="middle" className="fill-zinc-400 text-[10px]">
        {labels.east}
      </text>
      <text x={CENTER} y={CENTER + RADIUS + 16} textAnchor="middle" className="fill-zinc-400 text-[10px]">
        {labels.south}
      </text>
      <text x={CENTER - RADIUS - 10} y={CENTER + 3} textAnchor="middle" className="fill-zinc-400 text-[10px]">
        {labels.west}
      </text>
    </svg>
  );
}
