"use client";

import Link from "next/link";
import { motion } from "motion/react";
import RebrandingButton from "./RebrandingButton";
import { useReducedMotion } from "./useReducedMotion";

/*
 * ONE FICTIONAL BRAND SYSTEM demonstrated across six real-world contexts.
 *
 * The specimen uses:
 *   - a distinctive abstract mark (black square with cut-out + purple corner)
 *   - recurring typographic treatment ("Specimen A" in serif)
 *   - a graphic rule (thin horizontal line)
 *   - the Skapa palette (purple, pink, yellow, off-white)
 *   - consistent hierarchy
 *
 * Each application adapts the SAME ingredients for a different format.
 */

const APPLICATIONS = [
  {
    key: "website",
    label: "WEBSITE",
    description: "Editorial hero with navigation, headline hierarchy, and system colour.",
  },
  {
    key: "social",
    label: "SOCIAL",
    description: "Compact post composition sized for feed context.",
  },
  {
    key: "print",
    label: "PRINT / PACKAGING",
    description: "Physical label layout with material restraint.",
  },
  {
    key: "presentation",
    label: "PRESENTATION",
    description: "Title slide with data hierarchy and brand framing.",
  },
  {
    key: "campaign",
    label: "CAMPAIGN",
    description: "Bold advertising composition with confident scale.",
  },
  {
    key: "internal",
    label: "INTERNAL",
    description: "Document template with functional brand presence.",
  },
] as const;

/* ─── shared mark element ─── */
function SpecimenMark({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative bg-black ${className}`}>
      <div className="absolute inset-[20%] bg-bs-offwhite" />
      <div className="absolute top-[20%] right-[20%] h-[26%] w-[26%] bg-black" />
      <div className="absolute bottom-[20%] left-[20%] h-[18%] w-[18%] bg-bs-purple" />
    </div>
  );
}

/* ─── WEBSITE: editorial hero ─── */
function AppWebsite() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-bs-offwhite">
      {/* Nav bar */}
      <div className="flex items-center justify-between border-b border-black/8 px-4 py-2.5">
        <SpecimenMark className="h-5 w-5" />
        <div className="flex gap-3">
          <div className="h-px w-6 bg-black/25" />
          <div className="h-px w-6 bg-black/25" />
          <div className="h-px w-6 bg-black/25" />
        </div>
      </div>
      {/* Hero */}
      <div className="flex flex-1 flex-col justify-end p-4">
        <div className="mb-1 h-px w-12 bg-bs-purple" />
        <p className="font-serif text-[clamp(1.1rem,2.5vw,1.6rem)] leading-[1.05] tracking-tight text-black">
          Specimen A
        </p>
        <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-500">
          More considered. More coherent.
        </p>
      </div>
      {/* Colour band */}
      <div className="flex">
        <div className="h-1.5 flex-1 bg-bs-purple" />
        <div className="h-1.5 w-[28%] bg-bs-pink" />
        <div className="h-1.5 w-[18%] bg-bs-yellow" />
      </div>
    </div>
  );
}

/* ─── SOCIAL: compact post ─── */
function AppSocial() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-bs-purple p-4">
      <div className="flex items-start justify-between">
        <SpecimenMark className="h-6 w-6 bg-bs-offwhite [&>div:first-child]:bg-bs-purple [&>div:nth-child(2)]:bg-bs-offwhite [&>div:nth-child(3)]:bg-bs-pink" />
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-bs-offwhite/60">
          Post
        </p>
      </div>
      <div>
        <div className="mb-2 h-px w-10 bg-bs-yellow" />
        <p className="font-serif text-[clamp(1rem,2.2vw,1.4rem)] leading-[1.08] tracking-tight text-bs-offwhite">
          Clear enough to lead.
        </p>
        <p className="mt-1.5 font-mono text-[7px] uppercase tracking-[0.14em] text-bs-offwhite/50">
          specimen-a.com
        </p>
      </div>
    </div>
  );
}

/* ─── PRINT: label/packaging ─── */
function AppPrint() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden border border-black/10 bg-white p-4">
      <div className="flex items-start justify-between">
        <SpecimenMark className="h-5 w-5" />
        <p className="font-mono text-[7px] uppercase tracking-[0.16em] text-neutral-400">
          Product label
        </p>
      </div>
      <div className="mt-auto">
        <div className="mb-2 h-px w-full bg-black/10" />
        <p className="font-serif text-[clamp(0.9rem,2vw,1.3rem)] leading-[1.08] tracking-tight text-black">
          Specimen A
        </p>
        <div className="mt-2 flex gap-1.5">
          <div className="h-3 w-3 bg-bs-purple" />
          <div className="h-3 w-3 bg-bs-pink" />
          <div className="h-3 w-3 bg-bs-yellow" />
        </div>
        <p className="mt-2 font-mono text-[7px] leading-relaxed text-neutral-500">
          Vol. 240ml / Net Wt. 8 oz
        </p>
      </div>
    </div>
  );
}

/* ─── PRESENTATION: title slide ─── */
function AppPresentation() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-black p-4">
      <div className="flex items-start justify-between">
        <SpecimenMark className="h-5 w-5 [&>div:first-child]:bg-black [&>div:nth-child(3)]:bg-bs-pink" />
        <p className="font-mono text-[7px] uppercase tracking-[0.14em] text-bs-offwhite/40">
          Q3 Strategy
        </p>
      </div>
      <div>
        <p className="font-serif text-[clamp(1rem,2.2vw,1.5rem)] leading-[1.05] tracking-tight text-bs-offwhite">
          Brand positioning review
        </p>
        <div className="mt-2 h-px w-16 bg-bs-purple" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-bs-purple/20 px-2 py-1.5 text-center font-mono text-[7px] text-bs-offwhite/70">
            42%
          </div>
          <div className="bg-bs-pink/20 px-2 py-1.5 text-center font-mono text-[7px] text-bs-offwhite/70">
            28%
          </div>
          <div className="bg-bs-yellow/20 px-2 py-1.5 text-center font-mono text-[7px] text-black/60">
            30%
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CAMPAIGN: bold advertising ─── */
function AppCampaign() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-bs-pink">
      <div className="flex flex-1 flex-col justify-center p-4">
        <p className="font-serif text-[clamp(1.2rem,3vw,2rem)] leading-[0.95] tracking-tight text-white">
          Ready for what comes next.
        </p>
        <div className="mt-2 h-px w-14 bg-bs-yellow" />
      </div>
      <div className="flex items-center justify-between bg-black px-4 py-2.5">
        <SpecimenMark className="h-4 w-4 [&>div:first-child]:bg-black [&>div:nth-child(3)]:bg-bs-pink" />
        <p className="font-mono text-[7px] uppercase tracking-[0.14em] text-bs-offwhite/50">
          specimen-a.com
        </p>
      </div>
    </div>
  );
}

/* ─── INTERNAL: document template ─── */
function AppInternal() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white p-4">
      <div className="flex items-center gap-2 border-b border-black/8 pb-2.5">
        <SpecimenMark className="h-4 w-4" />
        <p className="font-mono text-[7px] uppercase tracking-[0.14em] text-neutral-500">
          Specimen A / Internal
        </p>
      </div>
      <div className="mt-3 flex-1">
        <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-bs-purple">
          Brand guidelines
        </p>
        <p className="mt-2 font-serif text-[clamp(0.85rem,1.8vw,1.1rem)] leading-[1.15] tracking-tight text-black">
          Voice, colour and application rules for the updated system.
        </p>
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 w-full bg-black/6" />
          <div className="h-1.5 w-[85%] bg-black/6" />
          <div className="h-1.5 w-[70%] bg-black/6" />
        </div>
      </div>
      <div className="mt-auto flex gap-1">
        <div className="h-1 flex-1 bg-bs-purple" />
        <div className="h-1 w-[22%] bg-bs-pink" />
      </div>
    </div>
  );
}

/* ─── application renderer ─── */
function ApplicationVisual({ appKey }: { appKey: string }) {
  switch (appKey) {
    case "website":
      return <AppWebsite />;
    case "social":
      return <AppSocial />;
    case "print":
      return <AppPrint />;
    case "presentation":
      return <AppPresentation />;
    case "campaign":
      return <AppCampaign />;
    case "internal":
      return <AppInternal />;
    default:
      return null;
  }
}

/* ─── card aspect ratios per application type ─── */
function cardAspect(key: string): string {
  switch (key) {
    case "website":
      return "aspect-[4/3]";
    case "social":
      return "aspect-[4/5]";
    case "print":
      return "aspect-[3/4]";
    case "presentation":
      return "aspect-[16/10]";
    case "campaign":
      return "aspect-[3/2]";
    case "internal":
      return "aspect-[4/3]";
    default:
      return "aspect-[4/3]";
  }
}

/* ─── desktop grid span ─── */
function desktopSpan(key: string): string {
  switch (key) {
    case "website":
      return "md:col-span-5";
    case "social":
      return "md:col-span-3";
    case "print":
      return "md:col-span-4";
    case "presentation":
      return "md:col-span-4";
    case "campaign":
      return "md:col-span-5";
    case "internal":
      return "md:col-span-3";
    default:
      return "md:col-span-4";
  }
}

export default function ChapterApply() {
  const { reducedMotion } = useReducedMotion();

  return (
    <section
      id="apply"
      className="relative scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-bs-purple">
              06 · Apply
            </p>
            <h2 className="max-w-lg font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
              A rebrand has to work somewhere other than the presentation.
            </h2>
            <p className="mt-5 max-w-md font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
              The system only proves itself when it starts holding together
              across real contexts. Website direction, campaign assets, internal
              material and the quieter day-to-day pieces should all feel related
              without feeling repetitive.
            </p>
            <p className="mt-5 max-w-md font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
              These are specimen applications, built to test range and behaviour
              rather than imitate a client launch. The same mark, palette and
              typographic treatment adapt to each format.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <RebrandingButton href="/start">Start a project</RebrandingButton>
              <Link
                href="/what-we-do"
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500 underline decoration-black/15 underline-offset-4 transition-colors hover:text-black"
              >
                Explore digital direction
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8">
            <ul className="grid gap-4 md:grid-cols-8 md:auto-rows-fr">
              {APPLICATIONS.map((app, index) => (
                <motion.li
                  key={app.key}
                  initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  className={`group ${desktopSpan(app.key)}`}
                >
                  <div
                    className={`overflow-hidden border border-black/10 ${cardAspect(app.key)}`}
                  >
                    <ApplicationVisual appKey={app.key} />
                  </div>
                  <div className="mt-2.5 flex items-start justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                      {app.label}
                    </p>
                    <p className="text-right font-mono text-[9px] leading-relaxed text-neutral-400">
                      {app.description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
