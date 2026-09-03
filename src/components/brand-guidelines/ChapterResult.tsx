"use client";

import { motion } from "motion/react";
import GuideMark from "./GuideMark";
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
            The result
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Your brand, without the guesswork.
          </h2>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto mt-16 max-w-2xl border border-black/10 bg-white md:mt-20"
        >
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
              Brand manual
            </p>
            <p className="font-mono text-[10px] tracking-[0.14em] text-neutral-400">
              Complete
            </p>
          </div>
          <div className="grid gap-6 p-6 md:grid-cols-3 md:p-8">
            <div className="flex flex-col items-center justify-center border border-black/8 bg-bs-offwhite p-6 md:col-span-1">
              <GuideMark className="h-14 w-14" color="#4b4ae4" />
            </div>
            <div className="md:col-span-2">
              <div className="mb-3 h-1 w-10 bg-bs-purple" />
              <p className="font-serif text-2xl tracking-tight text-black md:text-3xl">
                System ready
              </p>
              <ul className="mt-5 space-y-2 font-mono text-xs uppercase tracking-[0.14em] text-neutral-500">
                <li>Logo · Colour · Type</li>
                <li>Imagery · Voice · Application</li>
                <li>Files organised for use</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
