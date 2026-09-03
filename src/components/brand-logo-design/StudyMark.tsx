import type { SVGProps } from "react";

/**
 * Recurring fictional mark study for the Logo Design page.
 * Not client work: an abstract geometric form used to demonstrate process.
 *
 * Stages: idea (overworked) → reduce → refine → resolve (final).
 */
export type MarkStage = "idea" | "reduce" | "refine" | "resolve";

type Props = SVGProps<SVGSVGElement> & {
  stage?: MarkStage;
  /** Fill colour for solid forms. Stroke uses currentColor unless overridden. */
  fill?: string;
  stroke?: string;
};

export default function StudyMark({
  stage = "resolve",
  fill = "currentColor",
  stroke = "currentColor",
  className = "",
  ...rest
}: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {stage === "idea" && <IdeaStage stroke={stroke} fill={fill} />}
      {stage === "reduce" && <ReduceStage stroke={stroke} fill={fill} />}
      {stage === "refine" && <RefineStage stroke={stroke} fill={fill} />}
      {stage === "resolve" && <ResolveStage fill={fill} />}
    </svg>
  );
}

/** Final resolved mark: circle with a precise vertical channel and offset bar. */
function ResolveStage({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      {/* Outer ring */}
      <path d="M50 8C26.8 8 8 26.8 8 50s18.8 42 42 42 42-18.8 42-42S73.2 8 50 8zm0 8.5c18.5 0 33.5 15 33.5 33.5S68.5 83.5 50 83.5 16.5 68.5 16.5 50 31.5 16.5 50 16.5z" />
      {/* Vertical bar, optically centred slightly left of geometric centre */}
      <rect x="45.2" y="28" width="8.2" height="44" rx="0.5" />
      {/* Small square accent at optical centre */}
      <rect x="56" y="46" width="8" height="8" />
    </g>
  );
}

function RefineStage({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <g>
      <circle
        cx="50"
        cy="50"
        r="38"
        stroke={stroke}
        strokeWidth="7"
        fill="none"
      />
      <rect x="45" y="26" width="9" height="48" fill={fill} />
      <rect x="57" y="45.5" width="9" height="9" fill={fill} opacity="0.85" />
      {/* faint construction */}
      <line
        x1="50"
        y1="10"
        x2="50"
        y2="90"
        stroke={stroke}
        strokeWidth="0.4"
        opacity="0.25"
      />
      <line
        x1="10"
        y1="50"
        x2="90"
        y2="50"
        stroke={stroke}
        strokeWidth="0.4"
        opacity="0.25"
      />
    </g>
  );
}

function ReduceStage({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <g>
      <circle
        cx="50"
        cy="50"
        r="40"
        stroke={stroke}
        strokeWidth="5"
        fill="none"
        opacity="0.9"
      />
      <circle
        cx="50"
        cy="50"
        r="28"
        stroke={stroke}
        strokeWidth="1.2"
        fill="none"
        strokeDasharray="3 3"
        opacity="0.35"
      />
      <rect x="43" y="24" width="11" height="52" fill={fill} opacity="0.9" />
      <rect
        x="58"
        y="42"
        width="12"
        height="12"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        opacity="0.7"
      />
      <line
        x1="18"
        y1="22"
        x2="82"
        y2="78"
        stroke={stroke}
        strokeWidth="0.6"
        opacity="0.2"
      />
    </g>
  );
}

function IdeaStage({ fill, stroke }: { fill: string; stroke: string }) {
  return (
    <g stroke={stroke} fill="none">
      <circle cx="48" cy="48" r="36" strokeWidth="1.2" opacity="0.55" />
      <circle cx="54" cy="52" r="30" strokeWidth="0.8" opacity="0.35" />
      <circle
        cx="50"
        cy="50"
        r="42"
        strokeWidth="0.5"
        strokeDasharray="2 3"
        opacity="0.3"
      />
      <rect
        x="28"
        y="28"
        width="40"
        height="40"
        strokeWidth="0.8"
        opacity="0.4"
      />
      <path d="M32 68 L50 22 L68 68" strokeWidth="1.4" opacity="0.45" />
      <path d="M38 40 Q50 28 62 40" strokeWidth="1" opacity="0.4" />
      <line x1="12" y1="50" x2="88" y2="50" strokeWidth="0.4" opacity="0.25" />
      <line x1="50" y1="10" x2="50" y2="90" strokeWidth="0.4" opacity="0.25" />
      <line x1="20" y1="20" x2="80" y2="80" strokeWidth="0.35" opacity="0.2" />
      <line x1="80" y1="20" x2="20" y2="80" strokeWidth="0.35" opacity="0.2" />
      <rect x="44" y="30" width="8" height="40" fill={fill} opacity="0.35" />
      <circle cx="66" cy="36" r="6" strokeWidth="1" opacity="0.4" />
      <path
        d="M24 55 L30 55 L30 62"
        strokeWidth="1.2"
        opacity="0.5"
        fill="none"
      />
      <text
        x="72"
        y="78"
        fill={stroke}
        stroke="none"
        fontSize="9"
        fontFamily="IBM Plex Mono, monospace"
        opacity="0.35"
      >
        a
      </text>
    </g>
  );
}

/** Compact lockup: mark + abstract wordmark bars (study only, not a client brand). */
export function StudyLockup({
  className = "",
  markClassName = "h-10 w-10",
  color = "currentColor",
}: {
  className?: string;
  markClassName?: string;
  color?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} style={{ color }}>
      <StudyMark stage="resolve" className={markClassName} fill="currentColor" />
      <span aria-hidden="true" className="flex flex-col gap-1.5">
        <span className="block h-2 w-16 bg-current md:h-2.5 md:w-20" />
        <span className="block h-1.5 w-10 bg-current opacity-50 md:w-12" />
      </span>
    </div>
  );
}
