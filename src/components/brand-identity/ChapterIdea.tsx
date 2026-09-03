"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import IdentityButton from "./IdentityButton";
import { useReducedMotion } from "./useReducedMotion";

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
  useMotionValueEvent(opacity, "change", (v) => setHidden(v < 0.04));

  return (
    <motion.div
      style={{ opacity }}
      aria-hidden={hidden}
      className={`absolute inset-0 flex flex-col justify-center ${
        hidden ? "invisible pointer-events-none" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SketchField({ progress }: { progress: MotionValue<number> }) {
  const chaos = useTransform(progress, [0, 0.35, 0.55], [1, 0.55, 0.15]);
  const align = useTransform(progress, [0.2, 0.55], [0, 1]);
  const noteOpacity = useTransform(progress, [0.05, 0.25, 0.7], [0.5, 1, 0.35]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div style={{ opacity: chaos }} className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-[18%] left-[8%] h-px w-[42%] -rotate-6 bg-neutral-400/50" />
        <div className="absolute top-[38%] right-[10%] h-px w-[28%] rotate-3 bg-neutral-400/40" />
        <div className="absolute bottom-[28%] left-[20%] h-[22%] w-px bg-neutral-400/35" />
        <div className="absolute top-[22%] right-[22%] h-24 w-24 rounded-full border border-dashed border-neutral-400/50" />
        <div className="absolute top-[48%] left-[12%] h-16 w-28 -rotate-2 border border-neutral-400/40" />
        <div className="absolute right-[18%] bottom-[22%] h-14 w-14 rotate-12 border border-neutral-500/30" />
        <div className="absolute top-[30%] left-[40%] font-mono text-[10px] tracking-[0.16em] text-neutral-400 line-through">
          OPTION B
        </div>
        <div className="absolute top-[58%] right-[28%] font-serif text-4xl text-neutral-300/80 line-through md:text-5xl">
          sk
        </div>
        <div className="absolute bottom-[18%] left-[8%] font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">
          measure · 12 / 16
        </div>
      </motion.div>

      <motion.div style={{ opacity: align }} className="absolute inset-0">
        <div className="absolute top-[20%] left-[10%] h-px w-[55%] bg-neutral-800/40" />
        <div className="absolute top-[20%] left-[10%] h-[42%] w-px bg-neutral-800/35" />
        <div className="absolute top-[28%] left-[18%] h-20 w-20 border-2 border-neutral-800/50" />
        <div className="absolute top-[34%] left-[24%] h-8 w-8 bg-neutral-800/80" />
        <div className="absolute top-[26%] right-[16%] font-mono text-[10px] tracking-[0.18em] text-neutral-600">
          KEEP
        </div>
      </motion.div>

      <motion.p
        style={{ opacity: noteOpacity }}
        className="absolute top-[18%] right-[8%] max-w-[14ch] text-right font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 md:top-[12%] md:right-[12%]"
      >
        #4b4ae4?
        <br />
        hold · later
      </motion.p>
    </div>
  );
}

/**
 * Absolute stages are positioned against the padding edge of their parent, so
 * parent padding-top does not push them down. Mobile offset must live on the
 * stage itself: site chrome + chapter pill + breathing room.
 */
const MOBILE_STAGE_TOP =
  "pt-[calc(var(--skapa-site-chrome-height)+var(--skapa-chapter-pill-clearance)+1.75rem)]";

export default function ChapterIdea() {
  const { reducedMotion } = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const sketchOpacity = useTransform(scrollYProgress, [0, 0.4, 0.58, 0.78], [1, 1, 0.4, 0.15]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.12, 0.36, 0.48], [1, 1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0.28, 0.46], [0, -36]);
  // Premise holds, then clears just before sticky release (no long empty tail).
  const revealOpacity = useTransform(
    scrollYProgress,
    [0.42, 0.54, 0.84, 0.97],
    [0, 1, 1, 0],
  );
  const revealY = useTransform(scrollYProgress, [0.42, 0.54, 0.88, 0.97], [28, 0, 0, -20]);

  if (reducedMotion) {
    return (
      <section
        id="it-starts-with-an-idea"
        className="relative scroll-mt-chapter overflow-hidden bg-[#e8e7e3] lg:scroll-mt-0"
      >
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Brand Identity · 01
          </p>
          <h1 className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight text-black md:text-6xl">
            Every identity starts somewhere unfinished.
          </h1>
          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            Before it&apos;s recognisable, it&apos;s just ideas: marks, notes,
            experiments and rejected directions. Brand identity is the work of
            turning that material into a system people can recognise.
          </p>
          <div className="mt-10">
            <IdentityButton href="/start">Start a project</IdentityButton>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="it-starts-with-an-idea"
      className="relative z-20 scroll-mt-chapter lg:scroll-mt-0"
    >
      <div ref={trackRef} className="relative h-[230vh] md:h-[230vh]">
        <div className="sticky top-0 isolate h-[100svh] overflow-hidden bg-[#e8e7e3]">
          <motion.div style={{ opacity: sketchOpacity }} className="absolute inset-0">
            <SketchField progress={scrollYProgress} />
          </motion.div>

          {/*
            Sketch stays full-bleed. Editorial stages carry their own horizontal
            inset: absolute layers ignore parent padding (same as Strategy hero).
          */}
          <div className="relative z-10 mx-auto h-full max-w-6xl md:px-10 lg:pr-24">
            <Stage
              opacity={titleOpacity}
              className={`justify-start px-8 pb-20 ${MOBILE_STAGE_TOP} sm:px-10 md:justify-center md:px-0 md:pt-0 md:py-12`}
            >
              <motion.div style={{ y: titleY }} className="max-w-3xl">
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500 md:mb-5">
                  Brand Identity · 01
                </p>
                <h1 className="font-serif text-[2.15rem] leading-[1.08] tracking-tight text-black sm:text-5xl md:text-6xl lg:text-[4rem]">
                  Every identity starts somewhere unfinished.
                </h1>
                <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:mt-6 md:text-base">
                  Loose marks. Construction lines. Experiments that might not
                  survive. Scroll, and watch an identity begin to take shape.
                </p>
                <div className="mt-7 md:mt-8">
                  <IdentityButton href="/start">Start a project</IdentityButton>
                </div>
              </motion.div>
            </Stage>

            <Stage
              opacity={revealOpacity}
              className={`justify-start px-8 pb-20 ${MOBILE_STAGE_TOP} sm:px-10 md:justify-center md:px-0 md:pt-0 md:py-12`}
            >
              <motion.div style={{ y: revealY }} className="max-w-2xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  The idea
                </p>
                <p className="mt-4 font-serif text-[1.65rem] leading-snug tracking-tight text-black md:mt-5 md:text-5xl">
                  Before it&apos;s recognisable, it&apos;s just decisions waiting
                  to be made.
                </p>
                <p className="mt-5 max-w-md font-mono text-sm leading-relaxed text-neutral-600 md:mt-6">
                  Brand identity is not decoration applied at the end. It&apos;s
                  the process of choosing what stays, what goes, and what
                  belongs together.
                </p>
              </motion.div>
            </Stage>
          </div>
        </div>
      </div>

      {/*
        Short release band so Chapter 01 leaves before Chapter 02 sticks.
        Desktop unchanged.
      */}
      <div className="h-[6vh] bg-[#e8e7e3] md:h-0" aria-hidden="true" />

      <div className="sr-only">
        <p>
          Brand identity begins unresolved: sketches, annotations and
          experiments that gradually become a recognisable visual system.
        </p>
      </div>
    </section>
  );
}
