"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "./useReducedMotion";

const PHASES = [
  {
    label: "POSITION",
    title: "Position brings structure before style.",
    body: "The first shift is spatial. The system gets a clearer hierarchy, margins, alignment and room to speak with more confidence.",
  },
  {
    label: "TYPE",
    title: "Type introduces a more considered voice.",
    body: "Typography starts carrying tone: more assured, more deliberate, less temporary.",
  },
  {
    label: "COLOUR",
    title: "Colour arrives with purpose.",
    body: "Purple, pink, yellow and off-white are not decoration here. They mark contrast, emphasis and hierarchy.",
  },
  {
    label: "VOICE",
    title: "Voice becomes clearer and more direct.",
    body: "The writing stops underselling the offer and starts describing the business as it exists now.",
  },
  {
    label: "IMAGE",
    title: "Image direction starts to belong.",
    body: "Imagery aligns with the intended perception instead of the old habits the business has outgrown.",
  },
  {
    label: "SYSTEM",
    title: "Then the parts behave like one brand.",
    body: "The result is not one updated asset. It is a system that finally catches up and moves as a whole.",
  },
] as const;

const MOBILE_STAGE_TOP =
  "pt-[calc(var(--skapa-site-chrome-height)+var(--skapa-chapter-pill-clearance)+1.5rem)]";

/* ─── shared Stage ─── */
function Stage({
  opacity,
  children,
  className = "",
}: {
  opacity: MotionValue<number>;
  children: ReactNode;
  className?: string;
}) {
  const [hidden, setHidden] = useState(opacity.get() < 0.04);
  useMotionValueEvent(opacity, "change", (value) => setHidden(value < 0.04));

  return (
    <motion.div
      style={{ opacity }}
      aria-hidden={hidden}
      className={`absolute inset-0 flex flex-col ${
        hidden ? "invisible pointer-events-none" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

function phaseOpacity(
  progress: MotionValue<number>,
  enter: number,
  holdStart: number,
  holdEnd: number,
  exit: number,
) {
  return useTransform(progress, [enter, holdStart, holdEnd, exit], [0, 1, 1, 0]);
}

function PhaseCopy({
  opacity,
  label,
  title,
  body,
  className = "",
}: {
  opacity: MotionValue<number>;
  label: string;
  title: string;
  body: string;
  className?: string;
}) {
  const y = useTransform(opacity, [0, 1], [18, 0]);

  return (
    <Stage opacity={opacity} className={className}>
      <motion.div style={{ y }} className="max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bs-purple">
          {label}
        </p>
        <h3 className="mt-4 font-serif leading-[1.02] tracking-tight text-black max-md:text-[1.7rem] md:text-5xl">
          {title}
        </h3>
        <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-600 md:mt-6">
          {body}
        </p>
      </motion.div>
    </Stage>
  );
}

/* ─── desktop specimen (unchanged behaviour) ─── */
function DesktopSpecimen({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const gridOpacity = useTransform(progress, [0, 0.16, 1], [0.7, 0.55, 0.12]);
  const markScale = useTransform(progress, [0, 0.82], [0.72, 1]);
  const markX = useTransform(progress, [0, 0.82], ["-10%", "0%"]);
  const markY = useTransform(progress, [0, 0.82], ["8%", "0%"]);
  const typeOpacity = useTransform(
    progress,
    [0.14, 0.24, 0.55, 0.72, 0.9, 1],
    [0, 1, 1, 0.35, 0.18, 0.08],
  );
  const typeY = useTransform(progress, [0.14, 0.24], [24, 0]);
  const colourOpacity = useTransform(
    progress,
    [0.36, 0.48, 0.66, 0.79, 0.95, 1],
    [0, 1, 0.9, 0.22, 0.1, 0.08],
  );
  const voiceOpacity = useTransform(
    progress,
    [0.5, 0.62, 0.7, 0.78, 0.95, 1],
    [0, 1, 1, 0.22, 0.1, 0.08],
  );
  const imageOpacity = useTransform(
    progress,
    [0.64, 0.76, 0.82, 0.9, 1],
    [0, 1, 1, 0.45, 0.12],
  );
  const systemOpacity = useTransform(progress, [0.78, 0.9], [0, 1]);
  const captionOpacity = useTransform(progress, [0.12, 0.9], [0.3, 1]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-bs-offwhite">
      <motion.div style={{ opacity: gridOpacity }} className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </motion.div>

      <motion.div style={{ opacity: colourOpacity }} className="absolute inset-0">
        <div className="absolute top-0 right-0 h-[36%] w-[28%] bg-bs-purple" />
        <div className="absolute right-[10%] bottom-[12%] h-[18%] w-[22%] bg-bs-pink" />
        <div className="absolute bottom-0 left-0 h-[24%] w-[34%] bg-bs-yellow" />
      </motion.div>

      <motion.div
        style={{ scale: markScale, x: markX, y: markY }}
        className="absolute top-[18%] left-[12%] aspect-square w-[26%] bg-black"
      >
        <div className="absolute inset-[18%] bg-bs-offwhite" />
        <div className="absolute top-[18%] right-[18%] h-[28%] w-[28%] bg-black" />
        <div className="absolute bottom-[18%] left-[18%] h-[20%] w-[20%] bg-bs-purple" />
      </motion.div>

      <motion.div
        style={{ opacity: typeOpacity, y: typeY }}
        className="absolute top-[18%] left-[45%] max-w-[40%]"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
          Specimen System A
        </p>
        <p className="mt-4 font-serif text-[clamp(2rem,4vw,4.5rem)] leading-[0.95] tracking-tight text-black">
          Catches up
        </p>
        <p className="mt-3 font-mono text-sm leading-relaxed text-neutral-600">
          More considered. More coherent. More aligned with the business now.
        </p>
      </motion.div>

      <motion.div
        style={{ opacity: voiceOpacity }}
        className="absolute bottom-[16%] left-[12%] max-w-[32%] border-l border-black/15 pl-5"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
          Voice
        </p>
        <p className="mt-3 font-serif text-2xl leading-snug tracking-tight text-black">
          Clear enough to lead. Warm enough to stay human.
        </p>
      </motion.div>

      <motion.div
        style={{ opacity: imageOpacity }}
        className="absolute right-[8%] bottom-[16%] h-[30%] w-[32%] overflow-hidden border border-black/10 bg-black"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,39,145,0.8),transparent_45%),radial-gradient(circle_at_75%_25%,rgba(75,74,228,0.85),transparent_40%),linear-gradient(135deg,#111,#2c2c2c)]" />
        <div className="absolute right-5 bottom-5 h-12 w-12 border border-bs-offwhite/30" />
        <div className="absolute top-5 left-5 h-px w-16 bg-bs-yellow" />
      </motion.div>

      <motion.div
        style={{ opacity: systemOpacity }}
        className="absolute inset-x-[12%] bottom-[7%] grid grid-cols-3 gap-3"
      >
        <div className="bg-bs-purple px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-bs-offwhite">
          Type
        </div>
        <div className="bg-bs-pink px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white">
          Tone
        </div>
        <div className="bg-bs-yellow px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-black">
          Behaviour
        </div>
      </motion.div>

      <motion.p
        style={{ opacity: captionOpacity }}
        className="absolute top-[9%] right-[8%] font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400"
      >
        Abstract specimen, not client work
      </motion.p>
    </div>
  );
}

/* ─── mobile specimen: simplified per-phase layers ─── */
function MobileSpecimen({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  // Base grid
  const gridOp = useTransform(progress, [0, 0.15, 0.9, 1], [0.6, 0.5, 0.15, 0.08]);
  // Mark: present throughout, scales up
  const markScale = useTransform(progress, [0, 0.8], [0.68, 1]);
  const markOp = useTransform(progress, [0, 0.1], [0.6, 1]);
  // Type label: enters with TYPE phase, fades before IMAGE
  const typeOp = useTransform(progress, [0.14, 0.24, 0.5, 0.62], [0, 1, 1, 0]);
  const typeY = useTransform(progress, [0.14, 0.24], [16, 0]);
  // Colour fields: enter with COLOUR, reduce before SYSTEM
  const colourOp = useTransform(progress, [0.34, 0.46, 0.72, 0.82], [0, 0.85, 0.85, 0.3]);
  // Voice text: enters with VOICE, fades before IMAGE
  const voiceOp = useTransform(progress, [0.48, 0.58, 0.62, 0.7], [0, 1, 1, 0]);
  // Image panel: enters with IMAGE, reduces at SYSTEM
  const imageOp = useTransform(progress, [0.62, 0.72, 0.8, 0.88], [0, 1, 1, 0.5]);
  // System tags: enter late
  const systemOp = useTransform(progress, [0.78, 0.88], [0, 1]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-bs-offwhite">
      {/* Grid */}
      <motion.div style={{ opacity: gridOp }} className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </motion.div>

      {/* Colour fields */}
      <motion.div style={{ opacity: colourOp }} className="absolute inset-0">
        <div className="absolute top-0 right-0 h-[30%] w-[24%] bg-bs-purple" />
        <div className="absolute right-[8%] bottom-[10%] h-[14%] w-[18%] bg-bs-pink" />
        <div className="absolute bottom-0 left-0 h-[20%] w-[30%] bg-bs-yellow" />
      </motion.div>

      {/* Mark */}
      <motion.div
        style={{ scale: markScale, opacity: markOp }}
        className="absolute top-[14%] left-[8%] aspect-square w-[28%] bg-black"
      >
        <div className="absolute inset-[18%] bg-bs-offwhite" />
        <div className="absolute top-[18%] right-[18%] h-[28%] w-[28%] bg-black" />
        <div className="absolute bottom-[18%] left-[18%] h-[20%] w-[20%] bg-bs-purple" />
      </motion.div>

      {/* Type label */}
      <motion.div
        style={{ opacity: typeOp, y: typeY }}
        className="absolute top-[14%] left-[42%] max-w-[52%]"
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-500">
          Specimen A
        </p>
        <p className="mt-2 font-serif text-[1.7rem] leading-[0.95] tracking-tight text-black">
          Catches up
        </p>
      </motion.div>

      {/* Voice */}
      <motion.div
        style={{ opacity: voiceOp }}
        className="absolute bottom-[14%] left-[8%] max-w-[38%] border-l border-black/15 pl-3"
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-500">
          Voice
        </p>
        <p className="mt-2 font-serif text-[1.1rem] leading-snug tracking-tight text-black">
          Clear enough to lead.
        </p>
      </motion.div>

      {/* Image */}
      <motion.div
        style={{ opacity: imageOp }}
        className="absolute right-[6%] bottom-[14%] h-[28%] w-[36%] overflow-hidden border border-black/10 bg-black"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,39,145,0.8),transparent_45%),radial-gradient(circle_at_75%_25%,rgba(75,74,228,0.85),transparent_40%),linear-gradient(135deg,#111,#2c2c2c)]" />
        <div className="absolute right-3 bottom-3 h-8 w-8 border border-bs-offwhite/30" />
      </motion.div>

      {/* System tags */}
      <motion.div
        style={{ opacity: systemOp }}
        className="absolute inset-x-[8%] bottom-[5%] grid grid-cols-3 gap-2"
      >
        <div className="bg-bs-purple px-2 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-bs-offwhite">
          Type
        </div>
        <div className="bg-bs-pink px-2 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white">
          Tone
        </div>
        <div className="bg-bs-yellow px-2 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-black">
          Behaviour
        </div>
      </motion.div>

      <p className="absolute top-[6%] right-[6%] font-mono text-[8px] uppercase tracking-[0.16em] text-neutral-400">
        Abstract specimen
      </p>
    </div>
  );
}

function StaticSpecimen() {
  return (
    <div className="relative overflow-hidden border border-black/10 bg-bs-offwhite">
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>
      <div className="absolute top-0 right-0 h-28 w-24 bg-bs-purple md:h-36 md:w-32" />
      <div className="absolute right-6 bottom-6 h-16 w-16 bg-bs-pink md:h-24 md:w-24" />
      <div className="absolute bottom-0 left-0 h-24 w-32 bg-bs-yellow md:h-28 md:w-40" />
      <div className="relative grid gap-8 px-6 py-8 md:grid-cols-[0.9fr_1.1fr] md:px-10 md:py-10">
        <div className="relative aspect-square max-w-[220px] bg-black">
          <div className="absolute inset-[18%] bg-bs-offwhite" />
          <div className="absolute top-[18%] right-[18%] h-[28%] w-[28%] bg-black" />
          <div className="absolute bottom-[18%] left-[18%] h-[20%] w-[20%] bg-bs-purple" />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            Specimen System A
          </p>
          <h3 className="mt-4 font-serif text-3xl leading-none tracking-tight text-black md:text-5xl">
            Then the brand catches up.
          </h3>
          <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-neutral-600">
            Position, type, colour, voice, image and system start behaving like
            one recognisable whole.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {PHASES.map((phase) => (
              <div key={phase.label} className="border-t border-black/10 pt-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                  {phase.label}
                </p>
                <p className="mt-2 font-mono text-sm leading-relaxed text-neutral-600">
                  {phase.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChapterTransform() {
  const { reducedMotion } = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const introOpacity = useTransform(scrollYProgress, [0, 0.12, 0.22, 0.3], [1, 1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0.2, 0.3], [0, -24]);

  const desktopPhaseOpacities = [
    phaseOpacity(scrollYProgress, 0.14, 0.2, 0.27, 0.33),
    phaseOpacity(scrollYProgress, 0.27, 0.33, 0.4, 0.46),
    phaseOpacity(scrollYProgress, 0.4, 0.46, 0.53, 0.59),
    phaseOpacity(scrollYProgress, 0.53, 0.59, 0.66, 0.72),
    phaseOpacity(scrollYProgress, 0.66, 0.72, 0.79, 0.85),
    phaseOpacity(scrollYProgress, 0.79, 0.85, 0.95, 1),
  ];

  const resolveOpacity = useTransform(scrollYProgress, [0.82, 0.9, 1], [0, 1, 1]);
  const resolveY = useTransform(scrollYProgress, [0.82, 0.9], [18, 0]);

  // Mobile: heading
  const mobileHeadingOp = useTransform(scrollYProgress, [0, 0.12, 0.2], [1, 1, 0]);
  const mobileHeadingY = useTransform(scrollYProgress, [0.12, 0.2], [0, -16]);

  // Mobile: specimen visual
  const mobileVisualOp = useTransform(
    scrollYProgress,
    [0.14, 0.22, 0.82, 0.9],
    [0, 1, 1, 0.3],
  );
  const mobileVisualY = useTransform(
    scrollYProgress,
    [0.14, 0.22, 0.82, 0.9],
    [20, 0, 0, -8],
  );

  // Mobile: phase copy (each phase gets its own moment below the specimen)
  const mobileCopyOpacities = [
    phaseOpacity(scrollYProgress, 0.18, 0.24, 0.32, 0.37),
    phaseOpacity(scrollYProgress, 0.33, 0.38, 0.46, 0.51),
    phaseOpacity(scrollYProgress, 0.47, 0.52, 0.58, 0.63),
    phaseOpacity(scrollYProgress, 0.59, 0.64, 0.7, 0.75),
    phaseOpacity(scrollYProgress, 0.71, 0.76, 0.82, 0.87),
    phaseOpacity(scrollYProgress, 0.83, 0.88, 0.96, 1),
  ];

  if (reducedMotion) {
    return (
      <section
        id="transform"
        className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            05 · Transform
          </p>
          <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Then the brand catches up.
          </h2>
          <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            A stronger rebrand is not a single reveal. It is a system shift
            across position, type, colour, voice, imagery and behaviour.
          </p>
          <div className="mt-12">
            <StaticSpecimen />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="transform"
      className="relative z-10 scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div ref={trackRef} className="relative h-[280vh] md:h-[300vh]">
        <div className="sticky top-0 isolate h-[100svh] overflow-hidden bg-bs-offwhite">
          {/* ─── Desktop (unchanged) ─── */}
          <div className="relative z-10 mx-auto hidden h-full max-w-6xl md:block md:px-10 lg:pr-24">
            <Stage
              opacity={introOpacity}
              className="justify-start px-0 pt-20 pb-10"
            >
              <motion.div style={{ y: introY }} className="max-w-3xl">
                <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  05 · Transform
                </p>
                <h2 className="font-serif text-6xl leading-[1.02] tracking-tight text-black">
                  Then the brand catches up.
                </h2>
              </motion.div>
            </Stage>

            <div className="absolute inset-x-0 top-[24%] bottom-[14%] grid grid-cols-[1.05fr_0.95fr] gap-10">
              <div className="overflow-hidden border border-black/10 bg-white">
                <DesktopSpecimen progress={scrollYProgress} />
              </div>

              <div className="relative">
                {PHASES.map((phase, index) => (
                  <PhaseCopy
                    key={phase.label}
                    opacity={desktopPhaseOpacities[index]}
                    label={phase.label}
                    title={phase.title}
                    body={phase.body}
                    className="justify-center"
                  />
                ))}

                <Stage opacity={resolveOpacity} className="justify-end pb-4">
                  <motion.div style={{ y: resolveY }} className="max-w-md">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bs-pink">
                      Resolved
                    </p>
                    <p className="mt-4 font-serif text-4xl leading-snug tracking-tight text-black">
                      Position, type, colour, voice, image and system finally
                      read as one brand.
                    </p>
                  </motion.div>
                </Stage>
              </div>
            </div>
          </div>

          {/* ─── Mobile: rebuilt composition ─── */}
          <div className="relative h-full md:hidden">
            {/* Heading */}
            <Stage
              opacity={mobileHeadingOp}
              className={`justify-start px-8 pb-14 ${MOBILE_STAGE_TOP}`}
            >
              <motion.div style={{ y: mobileHeadingY }} className="max-w-[18rem]">
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  05 · Transform
                </p>
                <h2 className="font-serif text-[2.1rem] leading-[1.05] tracking-tight text-black">
                  Then the brand catches up.
                </h2>
              </motion.div>
            </Stage>

            {/* Specimen visual: top portion of viewport */}
            <motion.div
              style={{ opacity: mobileVisualOp, y: mobileVisualY }}
              className="absolute inset-x-6 top-[calc(var(--skapa-site-chrome-height)+var(--skapa-chapter-pill-clearance)+1rem)] overflow-hidden border border-black/10 bg-white sm:inset-x-8"
            >
              <div className="aspect-[4/3]">
                <MobileSpecimen progress={scrollYProgress} />
              </div>
            </motion.div>

            {/* Phase copy: bottom portion */}
            <div className="absolute inset-x-0 bottom-[8%] px-8 sm:px-10">
              {PHASES.map((phase, index) => (
                <PhaseCopy
                  key={phase.label}
                  opacity={mobileCopyOpacities[index]}
                  label={phase.label}
                  title={phase.title}
                  body={phase.body}
                  className="justify-end"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
