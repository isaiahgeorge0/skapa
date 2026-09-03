"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

const SAMPLE = "Clarity has a look.";

/**
 * Typography exploration sheet:
 * each treatment appears in its own row, gets rejected in place,
 * then the next appears below — never stacked on the same baseline.
 */
export default function ChapterVoice() {
  const { reducedMotion } = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // V01 mono — appear, hold, reject
  const v1Op = useTransform(scrollYProgress, [0, 0.08, 0.22, 0.32], [0, 1, 1, 0.35]);
  const v1Strike = useTransform(scrollYProgress, [0.18, 0.26], [0, 1]);
  const v1Note = useTransform(scrollYProgress, [0.2, 0.28, 0.4], [0, 1, 0.4]);

  // V02 bold — appear below, reject
  const v2Op = useTransform(scrollYProgress, [0.28, 0.36, 0.48, 0.56], [0, 1, 1, 0.35]);
  const v2Strike = useTransform(scrollYProgress, [0.44, 0.52], [0, 1]);
  const v2Note = useTransform(scrollYProgress, [0.46, 0.52, 0.62], [0, 1, 0.4]);

  // V03 italic — appear, reject
  const v3Op = useTransform(scrollYProgress, [0.52, 0.58, 0.68, 0.74], [0, 1, 1, 0.28]);
  const v3Strike = useTransform(scrollYProgress, [0.64, 0.7], [0, 1]);
  const v3Note = useTransform(scrollYProgress, [0.66, 0.72, 0.8], [0, 1, 0.35]);

  // Final — clean selection; rejected rows fade further
  const finalOp = useTransform(scrollYProgress, [0.72, 0.82, 1], [0, 1, 1]);
  const finalY = useTransform(scrollYProgress, [0.72, 0.82], [24, 0]);
  const sheetDim = useTransform(scrollYProgress, [0.72, 0.84], [1, 0.22]);
  const labelOp = useTransform(scrollYProgress, [0.8, 0.9], [0, 1]);

  if (reducedMotion) {
    return (
      <section
        id="give-it-a-voice"
        className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            03 · Give it a voice
          </p>
          <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Typography changes how the same idea feels.
          </h2>
          <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            The same line can feel technical, dramatic or editorial depending on
            the type. Identity settles on a hierarchy people recognise:
            editorial serif for expression, mono for structure.
          </p>
          <div className="mt-14 space-y-8 border-t border-black/10 pt-10">
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-neutral-400 line-through">
                {SAMPLE}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                Too rigid
              </p>
            </div>
            <div>
              <p className="font-serif text-4xl font-bold text-neutral-400 line-through md:text-5xl">
                {SAMPLE}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                Too loud
              </p>
            </div>
            <div>
              <p className="font-serif text-4xl italic text-neutral-400 line-through md:text-5xl">
                {SAMPLE}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                Too soft
              </p>
            </div>
            <div className="border-t border-black/10 pt-8">
              <p className="font-serif text-4xl tracking-tight text-black md:text-5xl">
                {SAMPLE}
              </p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-bs-purple">
                Selected · Newsreader · IBM Plex Mono
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="give-it-a-voice"
      className="relative z-10 scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div ref={trackRef} className="relative h-[280vh] md:h-[290vh]">
        <div className="sticky top-0 isolate flex h-[100svh] flex-col justify-start overflow-hidden bg-bs-offwhite pt-chapter-safe md:justify-center md:pt-0">
          <div className="mx-auto w-full max-w-6xl px-6 pb-8 md:px-10 md:pb-0 lg:pr-24">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500 md:mb-5">
              03 · Give it a voice
            </p>
            <h2 className="max-w-3xl font-serif text-[1.85rem] leading-snug tracking-tight text-black md:text-4xl lg:text-5xl">
              The same words. Different personality.
            </h2>

            <div className="relative mt-6 md:mt-12">
              {/* Exploration sheet — rows stack vertically, never overlap */}
              <motion.div style={{ opacity: sheetDim }} className="space-y-5 md:space-y-6">
                {/* V01 */}
                <motion.div style={{ opacity: v1Op }} className="relative">
                  <p className="relative inline-block font-mono text-xl uppercase tracking-[0.12em] text-neutral-600 md:text-3xl">
                    {SAMPLE}
                    <motion.span
                      style={{ scaleX: v1Strike }}
                      className="absolute top-1/2 left-0 h-[2px] w-full origin-left -translate-y-1/2 bg-neutral-800"
                      aria-hidden="true"
                    />
                  </p>
                  <motion.p
                    style={{ opacity: v1Note }}
                    className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400"
                  >
                    Too rigid
                  </motion.p>
                </motion.div>

                {/* V02 */}
                <motion.div style={{ opacity: v2Op }} className="relative">
                  <p className="relative inline-block font-serif text-3xl font-bold tracking-tight text-black md:text-5xl">
                    {SAMPLE}
                    <motion.span
                      style={{ scaleX: v2Strike }}
                      className="absolute top-1/2 left-0 h-[3px] w-full origin-left -translate-y-1/2 rotate-[-1.5deg] bg-bs-pink"
                      aria-hidden="true"
                    />
                  </p>
                  <motion.p
                    style={{ opacity: v2Note }}
                    className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400"
                  >
                    Too loud
                  </motion.p>
                </motion.div>

                {/* V03 */}
                <motion.div style={{ opacity: v3Op }} className="relative">
                  <p className="relative inline-block font-serif text-3xl italic text-neutral-700 md:text-5xl">
                    {SAMPLE}
                    <motion.span
                      style={{ scaleX: v3Strike }}
                      className="absolute top-[55%] left-0 h-px w-full origin-left bg-neutral-700"
                      aria-hidden="true"
                    />
                  </p>
                  <motion.p
                    style={{ opacity: v3Note }}
                    className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400"
                  >
                    Too soft
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Selected */}
              <motion.div
                style={{ opacity: finalOp, y: finalY }}
                className="mt-8 border-t border-black/10 pt-8 md:mt-10"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bs-purple">
                  Selected
                </p>
                <p className="mt-3 font-serif text-4xl leading-[1.1] tracking-tight text-black md:text-6xl lg:text-[4.25rem]">
                  {SAMPLE}
                </p>
                <motion.div style={{ opacity: labelOp }} className="mt-6 space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bs-purple">
                    Newsreader: expression
                  </p>
                  <p className="max-w-md font-mono text-sm leading-relaxed text-neutral-600">
                    IBM Plex Mono: structure, annotation, control. Together they
                    become a voice, not a specimen sheet.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
