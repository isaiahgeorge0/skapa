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
  compact = false,
}: {
  projectId: string;
  initialPhase: Phase;
  readOnly?: boolean;
  /** Portal-only: use --portal-accent instead of brand pink. */
  usePortalAccent?: boolean;
  showNow?: boolean;
  /** Compact percent + bar under the phase dots. */
  showPercent?: boolean;
  /**
   * Read-only stepper for tight spaces: dots plus "Step n of N" below sm,
   * dots with width-capped labels from sm up.
   */
  compact?: boolean;
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

  if (compact) {
    const stepCount = PHASES.length;
    const stepIndex = Math.max(currentIndex, 0);
    const edgePercent = 100 / (2 * stepCount);
    return (
      <div>
        <ol
          aria-label="Project phases"
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${stepCount}, minmax(0, 1fr))` }}
        >
          <span
            aria-hidden="true"
            className="absolute top-[7px] h-px bg-neutral-200"
            style={{ left: `${edgePercent}%`, right: `${edgePercent}%` }}
          />
          <span
            aria-hidden="true"
            className={`absolute top-[7px] h-px ${accentFill}`}
            style={{
              left: `${edgePercent}%`,
              width: `${(stepIndex / (stepCount - 1)) * (100 - 2 * edgePercent)}%`,
            }}
          />
          {PHASES.map((p, index) => {
            const isComplete = index < stepIndex;
            const isCurrent = index === stepIndex;
            return (
              <li
                key={p.key}
                aria-current={isCurrent ? "step" : undefined}
                className="relative z-10 flex min-w-0 flex-col items-center gap-2.5 px-1"
              >
                <span
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 rounded-full border-2 ${
                    isComplete
                      ? `${accentBorder} ${accentFill}`
                      : isCurrent
                        ? `${accentBorder} bg-white`
                        : "border-neutral-300 bg-white"
                  }`}
                />
                <span
                  className={`sr-only max-w-[110px] break-words text-center font-mono text-[10px] uppercase leading-tight tracking-[0.06em] sm:not-sr-only sm:w-full ${
                    isCurrent ? "text-black" : isComplete ? "text-neutral-600" : "text-neutral-400"
                  }`}
                >
                  {p.label}
                </span>
              </li>
            );
          })}
        </ol>
        <p aria-hidden="true" className="mt-3 font-mono text-xs text-neutral-500 sm:hidden">
          Step {stepIndex + 1} of {stepCount} · <span className="text-black">{current.label}</span>
        </p>
      </div>
    );
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
