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

function MarkStages({
  progress,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const reject = useTransform(progress, [0, 0.25, 0.4], [1, 0.4, 0]);
  const construct = useTransform(progress, [0.2, 0.45, 0.7], [0, 1, 0.35]);
  const resolve = useTransform(progress, [0.5, 0.7, 1], [0, 1, 1]);
  const resolveScale = useTransform(progress, [0.5, 0.75], [0.92, 1]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <motion.div
        style={{ opacity: reject }}
        className="absolute inset-[12%] border border-dashed border-neutral-400"
        aria-hidden="true"
      >
        <div className="absolute top-1/3 left-1/4 h-16 w-24 -rotate-6 bg-neutral-300/80" />
        <div className="absolute right-1/4 bottom-1/3 h-20 w-20 rotate-12 rounded-full border-2 border-neutral-400" />
        <p className="absolute top-4 left-4 font-mono text-[9px] tracking-[0.16em] text-neutral-400 line-through">
          A1
        </p>
      </motion.div>

      <motion.div
        style={{ opacity: construct }}
        className="absolute inset-[18%]"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-neutral-700" />
        <div className="absolute inset-y-0 left-0 w-px bg-neutral-700" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-neutral-700" />
        <div className="absolute inset-y-0 right-0 w-px bg-neutral-700" />
        <div className="absolute top-[22%] left-[22%] h-[56%] w-[56%] border-2 border-neutral-800" />
        <div className="absolute top-[38%] left-[38%] h-[24%] w-[24%] bg-neutral-900" />
        <p className="absolute -top-6 left-0 font-mono text-[9px] tracking-[0.16em] text-neutral-500">
          CONSTRUCT
        </p>
      </motion.div>

      <motion.div
        style={{ opacity: resolve, scale: resolveScale }}
        className="absolute inset-[22%] flex items-center justify-center bg-black"
      >
        <div className="relative h-[42%] w-[42%]">
          <div className="absolute inset-0 bg-bs-offwhite" />
          <div className="absolute top-0 right-0 h-1/2 w-1/2 bg-black" />
          <div className="absolute bottom-0 left-0 h-1/3 w-1/3 bg-black" />
        </div>
        <p className="absolute -bottom-8 left-0 font-mono text-[9px] tracking-[0.16em] text-neutral-500">
          FORM · LOCKED
        </p>
      </motion.div>
    </div>
  );
}

/** Hide scroll-driven layers once opacity bottoms out (still reversible on scroll up). */
function MobileLayer({
  opacity,
  y,
  scale,
  className,
  children,
}: {
  opacity: MotionValue<number>;
  y?: MotionValue<number>;
  scale?: MotionValue<number>;
  className?: string;
  children: ReactNode;
}) {
  const [hidden, setHidden] = useState(opacity.get() < 0.04);
  useMotionValueEvent(opacity, "change", (v) => setHidden(v < 0.04));

  return (
    <motion.div
      style={{ opacity, y, scale }}
      aria-hidden={hidden}
      className={`${hidden ? "invisible pointer-events-none" : ""} ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * Remap chapter progress into construction-only progress.
 * Construction runs only while the mark layer is the focal phase.
 * Keyframes sit earlier in the (shorter) mobile track so the commercial
 * hold does not leave a long empty tail.
 */
function useMobileMarkProgress(
  progress: ReturnType<typeof useScroll>["scrollYProgress"],
) {
  return useTransform(progress, [0.28, 0.38, 0.62, 0.72], [0, 0.2, 0.85, 1]);
}

export default function ChapterForm() {
  const { reducedMotion } = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const mobileMarkProgress = useMobileMarkProgress(scrollYProgress);

  // Desktop commercial copy (unchanged timing)
  const copyOpacity = useTransform(scrollYProgress, [0.55, 0.7, 1], [0, 1, 1]);
  const copyY = useTransform(scrollYProgress, [0.55, 0.7], [24, 0]);

  /*
   * Mobile one-way story (monotonic while scrolling down).
   * Phase order unchanged; progress windows sit earlier so the commercial
   * statement gets a brief hold, then the track ends (no long empty tail).
   *
   *   intro → construct/lock → mark retreats → commercial → brief hold → exit
   */
  const mobileHeadOp = useTransform(
    scrollYProgress,
    [0, 0.2, 0.34],
    [1, 1, 0],
  );
  const mobileHeadY = useTransform(scrollYProgress, [0.2, 0.34], [0, -28]);

  const mobileMarkOp = useTransform(
    scrollYProgress,
    [0.22, 0.34, 0.62, 0.76],
    [0, 1, 1, 0.4],
  );
  const mobileMarkY = useTransform(
    scrollYProgress,
    [0.22, 0.34, 0.62, 0.76],
    [36, 0, 0, -12],
  );
  const mobileMarkScale = useTransform(
    scrollYProgress,
    [0.62, 0.76],
    [1, 0.42],
  );
  const mobileMarkTop = useTransform(
    scrollYProgress,
    [0.62, 0.76],
    ["22%", "6%"],
  );

  const mobileCopyOp = useTransform(
    scrollYProgress,
    [0.72, 0.86, 1],
    [0, 1, 1],
  );
  const mobileCopyY = useTransform(scrollYProgress, [0.72, 0.86], [28, 0]);

  if (reducedMotion) {
    return (
      <section
        id="give-it-form"
        className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            02 · Give it form
          </p>
          <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Exploration becomes a mark you can recognise.
          </h2>
          <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            A logo matters. But a logo alone isn&apos;t an identity. Form is the
            first decision in a wider visual system: typography, colour,
            imagery, graphic language and application.
          </p>
          <div className="mt-14 grid gap-10 md:grid-cols-2 md:items-center">
            <div className="mx-auto aspect-square w-full max-w-sm bg-black p-[18%]">
              <div className="relative h-full w-full">
                <div className="absolute inset-0 bg-bs-offwhite" />
                <div className="absolute top-0 right-0 h-1/2 w-1/2 bg-black" />
                <div className="absolute bottom-0 left-0 h-1/3 w-1/3 bg-black" />
              </div>
            </div>
            <ul className="space-y-4 font-mono text-sm text-neutral-600">
              <li>Explore directions.</li>
              <li>Reject what doesn&apos;t belong.</li>
              <li>Refine construction.</li>
              <li>Lock a recognisable form.</li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="give-it-form"
      className="relative z-10 scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      {/* Mobile: short post-commercial hold; desktop track unchanged */}
      <div ref={trackRef} className="relative h-[200vh] md:h-[250vh]">
        <div className="sticky top-0 isolate h-[100svh] overflow-hidden bg-bs-offwhite pt-chapter-safe md:flex md:flex-col md:justify-center md:pt-0">
          {/* Desktop: approved stacked composition */}
          <div className="mx-auto hidden w-full max-w-6xl px-6 md:block md:px-10 lg:pr-24">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              02 · Give it form
            </p>
            <h2 className="max-w-2xl font-serif text-3xl leading-snug tracking-tight text-black md:text-4xl lg:text-5xl">
              From loose marks to a form that can hold meaning.
            </h2>

            <div className="mt-12">
              <MarkStages progress={scrollYProgress} />
            </div>

            <motion.div
              style={{ opacity: copyOpacity, y: copyY }}
              className="mx-auto mt-12 max-w-xl text-center"
            >
              <p className="font-serif text-2xl leading-snug text-black md:text-3xl">
                A logo matters.{" "}
                <span className="text-neutral-500">
                  But a logo alone isn&apos;t an identity.
                </span>
              </p>
              <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-600">
                Form is only the beginning. Next: the voice, colour and system
                that make the mark belong somewhere.
              </p>
            </motion.div>
          </div>

          {/*
            Mobile: exclusive phases in separate vertical zones.
            Intro lives in the top band; mark in the middle; commercial below.
            Mark retreats/scales into the top band before commercial establishes,
            so the logo never sits on the statement.
          */}
          <div className="relative h-full md:hidden">
            <MobileLayer
              opacity={mobileHeadOp}
              y={mobileHeadY}
              className="absolute inset-x-0 top-0 z-20 px-6 pt-3"
            >
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                02 · Give it form
              </p>
              <h2 className="max-w-[16ch] font-serif text-[1.85rem] leading-snug tracking-tight text-black">
                From loose marks to a form that can hold meaning.
              </h2>
            </MobileLayer>

            <motion.div
              style={{
                opacity: mobileMarkOp,
                y: mobileMarkY,
                scale: mobileMarkScale,
                top: mobileMarkTop,
              }}
              className="absolute inset-x-0 z-10 origin-top px-10 will-change-transform"
            >
              <MarkStages progress={mobileMarkProgress} />
            </motion.div>

            <MobileLayer
              opacity={mobileCopyOp}
              y={mobileCopyY}
              className="absolute inset-x-0 top-[52%] z-20 px-6"
            >
              <p className="font-serif text-[1.45rem] leading-snug text-black">
                A logo matters.{" "}
                <span className="text-neutral-500">
                  But a logo alone isn&apos;t an identity.
                </span>
              </p>
              <p className="mt-3 font-mono text-sm leading-relaxed text-neutral-600">
                Form is only the beginning. Next: the voice, colour and system
                that make the mark belong somewhere.
              </p>
            </MobileLayer>
          </div>
        </div>
      </div>
    </section>
  );
}
