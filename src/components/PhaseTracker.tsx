"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  PHASES,
  phaseProgressPercent,
  type Phase,
} from "@/lib/project-phases";

export type { Phase };

export default function PhaseTracker({
  projectId,
  initialPhase,
  readOnly = false,
  usePortalAccent = false,
  /** When false, omit the inline Now callout (portal uses PortalNowHero). */
  showNow = true,
  showPercent = false,
}: {
  projectId: string;
  initialPhase: Phase;
  readOnly?: boolean;
  /** Portal-only: use --portal-accent instead of brand pink. */
  usePortalAccent?: boolean;
  showNow?: boolean;
  /** Compact percent + bar under the phase dots. */
  showPercent?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const currentIndex = PHASES.findIndex((p) => p.key === phase);
  const current = PHASES[currentIndex] ?? PHASES[0];
  const percent = phaseProgressPercent(phase);
  const accentFill = usePortalAccent ? "bg-portal-accent" : "bg-brand-pink";
  const accentBorder = usePortalAccent ? "border-portal-accent" : "border-brand-pink";

  async function setProjectPhase(newPhase: Phase) {
    if (readOnly) return;
    const previous = phase;
    setPhase(newPhase);
    setSaving(true);

    const { error } = await supabase
      .from("projects")
      .update({ phase: newPhase })
      .eq("id", projectId);

    setSaving(false);
    if (error) {
      console.error("Failed to update phase:", error);
      setPhase(previous);
    }
  }

  return (
    <div>
      <div className="relative flex justify-between">
        <div className="absolute left-0 right-0 top-[7px] h-px bg-neutral-200" />
        <div
          className={`absolute left-0 top-[7px] h-px transition-all duration-500 ease-out ${accentFill}`}
          style={{
            width:
              currentIndex <= 0
                ? "0%"
                : `${(currentIndex / (PHASES.length - 1)) * 100}%`,
          }}
        />
        {PHASES.map((p, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Tag = readOnly ? "div" : "button";
          return (
            <Tag
              key={p.key}
              onClick={readOnly ? undefined : () => setProjectPhase(p.key)}
              disabled={readOnly ? undefined : saving}
              className={`group relative z-10 flex flex-col items-center gap-3 ${
                readOnly ? "" : "disabled:cursor-wait"
              }`}
              style={{
                flex: index === 0 || index === PHASES.length - 1 ? "0 0 auto" : "1 1 0",
              }}
            >
              <span
                className={`h-3.5 w-3.5 rounded-full border-2 transition-colors ${
                  isComplete
                    ? `${accentBorder} ${accentFill}`
                    : isCurrent
                      ? `${accentBorder} bg-white`
                      : `border-neutral-300 bg-white ${readOnly ? "" : "group-hover:border-neutral-400"}`
                }`}
              />
              <span
                className={`max-w-[90px] text-center font-mono text-[10px] uppercase leading-tight tracking-[0.06em] transition-colors ${
                  isCurrent
                    ? "text-black"
                    : isComplete
                      ? "text-neutral-600"
                      : `text-neutral-400 ${readOnly ? "" : "group-hover:text-neutral-600"}`
                }`}
              >
                {p.label}
              </span>
            </Tag>
          );
        })}
      </div>

      {showPercent ? (
        <div className="mt-8">
          <div className="mb-2.5 flex items-baseline justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
              Phase progress
            </p>
            <p className="font-mono text-[11px] tabular-nums text-neutral-600">
              <span
                className={
                  usePortalAccent ? "text-portal-accent" : "text-brand-pink"
                }
              >
                {percent}%
              </span>{" "}
              complete
            </p>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Phase progress"
          >
            <div
              className={`progress-fill transition-[width] duration-500 ease-out ${accentFill}`}
              style={{ width: `${Math.max(percent, percent > 0 ? 2 : 0)}%` }}
            />
          </div>
        </div>
      ) : null}

      {readOnly && showNow ? (
        <div
          className={`mt-6 border-l-2 pl-4 ${
            usePortalAccent ? "border-portal-accent" : "border-brand-pink"
          }`}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
            Now
          </p>
          <p className="mt-1 font-serif text-lg text-black">{current.label}</p>
          <p className="mt-1 max-w-prose text-sm text-neutral-500">
            {current.description}
          </p>
        </div>
      ) : null}

      {!readOnly ? (
        <p className="mt-6 font-mono text-[11px] text-neutral-400">
          Click any stage to set the project&apos;s current phase.
        </p>
      ) : null}
    </div>
  );
}
