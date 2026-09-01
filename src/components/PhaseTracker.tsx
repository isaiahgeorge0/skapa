"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type Phase =
  | "onboarding"
  | "website_branding"
  | "social_rebrand"
  | "client_proof_check"
  | "final_sign_off";

const PHASES: { key: Phase; label: string }[] = [
  { key: "onboarding", label: "Onboarding" },
  { key: "website_branding", label: "Website / Branding" },
  { key: "social_rebrand", label: "Social Media Rebrand" },
  { key: "client_proof_check", label: "Client Proof Check" },
  { key: "final_sign_off", label: "Final Sign Off" },
];

export default function PhaseTracker({
  projectId,
  initialPhase,
  readOnly = false,
}: {
  projectId: string;
  initialPhase: Phase;
  readOnly?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const currentIndex = PHASES.findIndex((p) => p.key === phase);

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
          className="absolute left-0 top-[7px] h-px bg-brand-pink transition-all duration-500 ease-out"
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
              style={{ flex: index === 0 || index === PHASES.length - 1 ? "0 0 auto" : "1 1 0" }}
            >
              <span
                className={`h-3.5 w-3.5 rounded-full border-2 transition-colors ${
                  isComplete
                    ? "border-brand-pink bg-brand-pink"
                    : isCurrent
                      ? "border-brand-pink bg-white"
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
      {!readOnly && (
        <p className="mt-6 font-mono text-[11px] text-neutral-400">
          Click any stage to set the project's current phase.
        </p>
      )}
    </div>
  );
}
