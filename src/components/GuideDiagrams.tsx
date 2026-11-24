import type { GuideDiagram } from "@/content/guides/types";

export default function GuideDiagram({ diagram }: { diagram: GuideDiagram }) {
  return (
    <figure className="rounded-lg border border-white/10 bg-zinc-900/50 p-4">
      <figcaption className="mb-3 text-sm font-medium text-zinc-200">{diagram.title}</figcaption>
      {diagram.kind === "types" ? <TypesSvg labels={diagram.labels} /> : null}
      {diagram.kind === "ladder" ? <LadderSvg labels={diagram.labels} /> : null}
      {diagram.kind === "season" ? <SeasonSvg labels={diagram.labels} /> : null}
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">{diagram.caption}</p>
    </figure>
  );
}

function TypesSvg({ labels }: { labels: string[] }) {
  const [skyglow = "Skyglow", glare = "Glare", trespass = "Light trespass"] = labels;
  return (
    <svg viewBox="0 0 360 140" role="img" className="h-auto w-full">
      <title>{skyglow}</title>
      <rect width="360" height="140" fill="#09090b" />
      <circle cx="60" cy="78" r="28" fill="#fbbf24" opacity="0.35" />
      <circle cx="60" cy="78" r="8" fill="#fde68a" />
      <text x="60" y="122" textAnchor="middle" fill="#d4d4d8" fontSize="11">
        {skyglow}
      </text>
      <polygon points="180,40 168,90 192,90" fill="#f8fafc" />
      <polygon points="180,40 150,100 210,100" fill="#f8fafc" opacity="0.18" />
      <text x="180" y="122" textAnchor="middle" fill="#d4d4d8" fontSize="11">
        {glare}
      </text>
      <rect x="268" y="48" width="36" height="28" fill="#27272a" stroke="#e4e4e7" />
      <path d="M304 40 L330 70" stroke="#fbbf24" strokeWidth="4" />
      <text x="292" y="122" textAnchor="middle" fill="#d4d4d8" fontSize="11">
        {trespass}
      </text>
    </svg>
  );
}

function LadderSvg({ labels }: { labels: string[] }) {
  const steps = labels.length > 0 ? labels : ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const colors = ["#0b1020", "#142f72", "#2154d8", "#0f5714", "#1fa12a", "#b8a625", "#bf641e", "#fb5a49", "#f2f2f2"];
  return (
    <svg viewBox="0 0 360 120" role="img" className="h-auto w-full">
      <title>{steps.join(", ")}</title>
      {steps.slice(0, 9).map((label, index) => (
        <g key={label} transform={`translate(${8 + index * 39}, 16)`}>
          <rect width="34" height="64" rx="4" fill={colors[index]} stroke="#ffffff22" />
          <text x="17" y="96" textAnchor="middle" fill="#d4d4d8" fontSize="10">
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function SeasonSvg({ labels }: { labels: string[] }) {
  const items = labels.length >= 4 ? labels.slice(0, 4) : ["Winter", "Spring", "Summer", "Autumn"];
  return (
    <svg viewBox="0 0 360 110" role="img" className="h-auto w-full">
      <title>{items.join(", ")}</title>
      <rect width="360" height="110" fill="#09090b" />
      {items.map((label, index) => {
        const height = [28, 48, 78, 42][index];
        return (
          <g key={label} transform={`translate(${28 + index * 86}, 0)`}>
            <rect x="18" y={88 - height} width="28" height={height} rx="3" fill={index === 2 ? "#fbbf24" : "#3f3f46"} />
            <text x="32" y="102" textAnchor="middle" fill="#d4d4d8" fontSize="11">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
