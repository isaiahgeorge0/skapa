"use client";

import { motion } from "motion/react";
import StudyMark from "./StudyMark";
import { useReducedMotion } from "./useReducedMotion";

const ANNOTATIONS = [
  {
    id: "clear-space",
    label: "Clear space",
    style: "left-[4%] top-[12%] md:left-[8%] md:top-[16%]",
  },
  {
    id: "optical",
    label: "Optical centre",
    style: "right-[4%] top-[18%] md:right-[10%] md:top-[22%]",
  },
  {
    id: "ratio",
    label: "1 : 1",
    style: "left-[6%] bottom-[28%] md:left-[12%] md:bottom-[30%]",
  },
  {
    id: "min",
    label: "Minimum size",
    style: "right-[6%] bottom-[24%] md:right-[12%] md:bottom-[28%]",
  },
  {
    id: "align",
    label: "Alignment",
    style: "bottom-[10%] left-1/2 -translate-x-1/2",
  },
] as const;

export default function ChapterPrecision() {
  const { reducedMotion } = useReducedMotion();

  return (
    <section
      id="precision"
      className="scroll-mt-chapter border-t border-black/5 bg-white lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-2xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            04 · Detail matters
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Simple doesn&apos;t mean arbitrary.
          </h2>
          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            Behind a confident mark is quiet construction: proportion, alignment,
            clear space and optical correction.
          </p>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative mt-14 min-h-[22rem] overflow-hidden border border-black/10 bg-bs-offwhite md:min-h-[28rem]"
        >
          {/* Construction grid */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute inset-y-[12%] left-1/2 w-px -translate-x-1/2 bg-bs-purple/30" />
            <div className="absolute inset-x-[12%] top-1/2 h-px -translate-y-1/2 bg-bs-purple/30" />
            {/* Clear space guides */}
            <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 border border-dashed border-black/15 md:h-64 md:w-64" />
          </div>

          {/* Enlarged mark */}
          <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <StudyMark
              stage="resolve"
              className="h-36 w-36 text-bs-purple md:h-48 md:w-48"
              fill="currentColor"
            />
          </div>

          {/* Mono annotations */}
          {ANNOTATIONS.map((note, index) => (
            <motion.p
              key={note.id}
              initial={reducedMotion ? false : { opacity: 0 }}
              whileInView={reducedMotion ? undefined : { opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: 0.1 + index * 0.06 }}
              className={`absolute z-10 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 ${note.style}`}
            >
              {note.label}
            </motion.p>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
