"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

const PROBLEMS = [
  {
    short: "People don’t really understand what makes us different.",
    detail:
      "The offer is strong, but the brand isn’t making the difference obvious enough.",
  },
  {
    short: "We’ve grown. Our brand hasn’t.",
    detail:
      "The business has moved on, while the brand still describes an earlier version of it.",
  },
  {
    short: "Everything we make feels like it came from a different company.",
    detail:
      "Without a shared position and message, every campaign starts from scratch.",
  },
] as const;

function ProblemRow({
  problem,
  index,
  reducedMotion,
}: {
  problem: (typeof PROBLEMS)[number];
  index: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.35"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.22, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const rule = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const numberScale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <motion.article
      ref={ref}
      style={reducedMotion ? undefined : { opacity, x }}
      className="relative py-14 md:py-20"
    >
      <div className="mb-6 flex items-center gap-4">
        <motion.span
          style={reducedMotion ? undefined : { scale: numberScale }}
          className="font-mono text-[11px] tracking-[0.18em] text-bs-pink"
        >
          {String(index + 1).padStart(2, "0")}
        </motion.span>
        <motion.span
          style={reducedMotion ? { width: "5rem" } : { width: rule }}
          className="h-px origin-left bg-bs-pink"
          aria-hidden="true"
        />
      </div>
      <blockquote>
        <p className="max-w-4xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
          “{problem.short}”
        </p>
      </blockquote>
      <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-neutral-600">
        {problem.detail}
      </p>
    </motion.article>
  );
}

export default function ChapterFamiliar() {
  const { reducedMotion } = useReducedMotion();

  return (
    <section
      id="sound-familiar"
      className="relative scroll-mt-chapter lg:scroll-mt-0 border-t border-black/5 bg-bs-offwhite"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          02 · Sound familiar?
        </p>
        <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
          A brand problem doesn’t always look like a brand problem.
        </h2>

        <div className="mt-10 divide-y divide-black/10 md:mt-14">
          {PROBLEMS.map((problem, index) => (
            <ProblemRow
              key={problem.short}
              problem={problem}
              index={index}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        <div className="sr-only">
          <p>
            Other familiar situations include: every piece of marketing feeling
            inconsistent; knowing where the business is going but not how to
            communicate it; and preparing to rebrand without changing things
            merely for the sake of change.
          </p>
        </div>
      </div>
    </section>
  );
}
