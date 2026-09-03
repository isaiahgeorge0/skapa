"use client";

import { motion } from "motion/react";
import StudyMark from "./StudyMark";
import { useReducedMotion } from "./useReducedMotion";

export default function ChapterResult() {
  const { reducedMotion } = useReducedMotion();

  return (
    <section
      id="the-result"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-36 lg:pr-24">
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            08 · The result
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Recognisable without needing to shout.
          </h2>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mx-auto mt-16 flex max-w-lg flex-col items-center justify-center py-10 md:mt-20 md:py-16"
        >
          <StudyMark
            stage="resolve"
            className="h-40 w-40 text-bs-purple md:h-52 md:w-52"
            fill="currentColor"
          />
          <p className="mt-10 max-w-sm text-center font-mono text-sm leading-relaxed text-neutral-500">
            Many possibilities. One strong mark.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
