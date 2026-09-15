export type Phase =
  | "onboarding"
  | "website_branding"
  | "social_rebrand"
  | "client_proof_check"
  | "final_sign_off";

export const PHASES: { key: Phase; label: string; description: string }[] = [
  {
    key: "onboarding",
    label: "Onboarding",
    description: "Kick-off, access, and the brief we work from.",
  },
  {
    key: "website_branding",
    label: "Website / Branding",
    description: "Design and build for the core brand or site work.",
  },
  {
    key: "social_rebrand",
    label: "Social Media Rebrand",
    description: "Templates, assets and rollout for social channels.",
  },
  {
    key: "client_proof_check",
    label: "Client Proof Check",
    description: "Your review pass before anything is locked in.",
  },
  {
    key: "final_sign_off",
    label: "Final Sign Off",
    description: "Approvals, handover and everything ready to use.",
  },
];

/**
 * Overall journey progress from phase index.
 * Onboarding = 0%, Final Sign Off = 100%.
 */
export function phaseProgressPercent(phase: Phase | string): number {
  const index = PHASES.findIndex((p) => p.key === phase);
  if (index < 0) return 0;
  if (PHASES.length <= 1) return 100;
  return Math.round((index / (PHASES.length - 1)) * 100);
}
