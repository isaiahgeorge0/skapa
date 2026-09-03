"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import StudyMark, { type MarkStage } from "./StudyMark";
import { useReducedMotion } from "./useReducedMotion";

const STAGES: { key: MarkStage; label: string }[] = [
  { key: "idea", label: "Idea" },
  { key: "reduce", label: "Reduce" },
  { key: "refine", label: "Refine" },
  { key: "resolve", label: "Resolve" },
];

export default function ChapterReduction() {
  const { reducedMotion, ready } = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  if (!ready) {
    return <div className="min-h-[40vh] bg-bs-offwhite" aria-hidden="true" />;
  }

  if (reducedMotion) {
    return <StaticReduction />;
  }

  return (
    <section id="reduction" className="scroll-mt-chapter lg:scroll-mt-0">
      <div ref={trackRef} className="relative h-[240vh] md:h-[260vh]">
        <div className="sticky top-0 isolate h-[100svh] overflow-hidden bg-bs-offwhite">
          <ReductionStage progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}

function ReductionStage({ progress }: { progress: MotionValue<number> }) {
  const ideaOp = useTransform(progress, [0, 0.18, 0.28], [1, 1, 0]);
  const reduceOp = useTransform(progress, [0.22, 0.32, 0.48, 0.55], [0, 1, 1, 0]);
  const refineOp = useTransform(progress, [0.48, 0.58, 0.72, 0.8], [0, 1, 1, 0]);
  const resolveOp = useTransform(progress, [0.74, 0.84, 1], [0, 1, 1]);

  const purpleField = useTransform(progress, [0.7, 0.88], [0, 1]);
  const copyColor = useTransform(
    progress,
    [0.7, 0.88],
    ["#111111", "#efeeea"],
  );
  const mutedColor = useTransform(
    progress,
    [0.7, 0.88],
    ["#525252", "rgba(239,238,234,0.82)"],
  );
  const markColor = useTransform(
    progress,
    [0, 0.55, 0.8, 1],
    ["#404040", "#2a2a2a", "#efeeea", "#efeeea"],
  );

  const stepIndex = useTransform(progress, (v): number => {
    if (v < 0.28) return 0;
    if (v < 0.52) return 1;
    if (v < 0.78) return 2;
    return 3;
  });

  return (
    <div className="relative flex h-full flex-col">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-bs-purple"
        style={{ opacity: purpleField }}
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-6 pt-chapter-safe pb-10 md:px-10 lg:pr-24">
        <div className="max-w-2xl">
          <motion.p
            className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em]"
            style={{ color: mutedColor }}
          >
            03 · The edit
          </motion.p>
          <motion.h2
            className="font-serif text-3xl leading-snug tracking-tight md:text-5xl"
            style={{ color: copyColor }}
          >
            Good logo design is often about what you remove.
          </motion.h2>
          <motion.p
            className="mt-4 max-w-lg font-mono text-sm leading-relaxed md:text-base"
            style={{ color: mutedColor }}
          >
            Refinement isn&apos;t making an idea more complicated. It&apos;s finding
            what matters and removing what doesn&apos;t.
          </motion.p>
        </div>

        <div className="relative mt-8 flex flex-1 items-center justify-center md:mt-4">
          <StageMark stage="idea" opacity={ideaOp} color={markColor} />
          <StageMark stage="reduce" opacity={reduceOp} color={markColor} />
          <StageMark stage="refine" opacity={refineOp} color={markColor} />
          <StageMark stage="resolve" opacity={resolveOp} color={markColor} />
        </div>

        <ol className="relative z-10 mt-auto flex w-full max-w-md justify-between gap-2 self-center md:self-start">
          {STAGES.map((stage, index) => (
            <StepItem
              key={stage.key}
              label={stage.label}
              index={index}
              stepIndex={stepIndex}
              color={mutedColor}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}

function StageMark({
  stage,
  opacity,
  color,
}: {
  stage: MarkStage;
  opacity: MotionValue<number>;
  color: MotionValue<string>;
}) {
  const pointerEvents = useTransform(opacity, (v) =>
    v < 0.04 ? "none" : "auto",
  );

  return (
    <motion.div
      className="absolute"
      style={{ opacity, color, pointerEvents }}
      aria-hidden="true"
    >
      <StudyMark
        stage={stage}
        className="h-40 w-40 md:h-56 md:w-56"
        fill="currentColor"
        stroke="currentColor"
      />
    </motion.div>
  );
}

function StepItem({
  label,
  index,
  stepIndex,
  color,
}: {
  label: string;
  index: number;
  stepIndex: MotionValue<number>;
  color: MotionValue<string>;
}) {
  const active = useTransform(stepIndex, (v) => (v === index ? 1 : 0.35));

  return (
    <motion.li
      className="font-mono text-[10px] uppercase tracking-[0.16em]"
      style={{ opacity: active, color }}
    >
      {label}
    </motion.li>
  );
}

function StaticReduction() {
  return (
    <section
      id="reduction"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-2xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            03 · The edit
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Good logo design is often about what you remove.
          </h2>
          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            Refinement isn&apos;t making an idea more complicated. It&apos;s finding
            what matters and removing what doesn&apos;t.
          </p>
        </div>

        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage, index) => (
            <li
              key={stage.key}
              className={`flex flex-col items-center border border-black/10 p-6 ${
                index === 3
                  ? "bg-bs-purple text-bs-offwhite"
                  : "bg-white text-black"
              }`}
            >
              <StudyMark
                stage={stage.key}
                className="h-24 w-24"
                fill="currentColor"
                stroke="currentColor"
              />
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] opacity-70">
                {stage.label}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
