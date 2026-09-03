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

const PAIRS = [
  { was: "Local", now: "National" },
  { was: "One service", now: "A complete offer" },
  { was: "Startup", now: "Established business" },
  { was: "Accessible", now: "Premium" },
  { was: "Founder-led", now: "Growing team" },
  { was: "One audience", now: "Several" },
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

/* ─── desktop pair labels (unchanged) ─── */
function PairLabel({
  pair,
  index,
  progress,
}: {
  pair: (typeof PAIRS)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const start = 0.16 + index * 0.08;
  const hold = start + 0.08;
  const opacity = useTransform(progress, [start, hold, 0.74, 0.86], [0, 1, 1, 0]);
  const x = useTransform(progress, [start, hold], [14, 0]);

  return (
    <motion.div
      style={{ opacity, x }}
      className="absolute hidden items-center gap-4 md:flex"
    >
      <span className="font-serif text-2xl tracking-tight text-neutral-500">
        {pair.was}
      </span>
      <span className="h-px w-12 bg-bs-purple/35" aria-hidden="true" />
      <span className="font-serif text-2xl tracking-tight text-black">
        {pair.now}
      </span>
    </motion.div>
  );
}

/* ─── desktop distance field (unchanged) ─── */
function DesktopDistanceField({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const lineScale = useTransform(progress, [0.06, 0.78], [0.18, 1]);
  const lineOpacity = useTransform(
    progress,
    [0.06, 0.18, 0.72, 0.84],
    [0.18, 0.42, 0.42, 0.08],
  );
  const leftX = useTransform(progress, [0.08, 0.72, 0.86], ["0%", "-24%", "-31%"]);
  const rightX = useTransform(progress, [0.08, 0.72, 0.86], ["0%", "24%", "31%"]);
  const purpleOpacity = useTransform(progress, [0.62, 0.82], [0, 1]);
  const desktopFieldOpacity = useTransform(
    progress,
    [0.68, 0.78, 0.86],
    [1, 0.35, 0],
  );
  const desktopFieldScale = useTransform(
    progress,
    [0.68, 0.78, 0.86],
    [1, 0.985, 0.95],
  );
  const desktopFieldY = useTransform(
    progress,
    [0.68, 0.78, 0.86],
    ["0%", "-5%", "-11%"],
  );

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        style={{ opacity: purpleOpacity }}
        className="absolute inset-y-0 left-1/2 w-[14%] -translate-x-1/2 bg-bs-purple/10 blur-3xl"
      />

      <motion.div
        style={{
          opacity: desktopFieldOpacity,
          scale: desktopFieldScale,
          y: desktopFieldY,
        }}
        className="absolute inset-0"
      >
        <motion.div
          style={{ x: leftX }}
          className="absolute top-1/2 left-[22%] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
            WHO YOU WERE
          </div>
          <div className="font-serif text-[clamp(2rem,4vw,4rem)] leading-none tracking-tight text-neutral-500">
            Earlier
          </div>
        </motion.div>

        <motion.div
          style={{ x: rightX }}
          className="absolute top-1/2 right-[22%] translate-x-1/2 -translate-y-1/2 text-right"
        >
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-bs-purple">
            WHO YOU ARE NOW
          </div>
          <div className="font-serif text-[clamp(2rem,4vw,4rem)] leading-none tracking-tight text-black">
            Today
          </div>
        </motion.div>

        <motion.div
          style={{ scaleX: lineScale, opacity: lineOpacity }}
          className="absolute top-1/2 left-1/2 h-px w-[42%] -translate-x-1/2 -translate-y-1/2 origin-center bg-gradient-to-r from-neutral-300 via-bs-purple/45 to-neutral-900/70"
        />

        <div className="absolute inset-x-[18%] top-[26%]">
          {PAIRS.slice(0, 3).map((pair, index) => (
            <div
              key={pair.was}
              className="absolute"
              style={{ left: `${index * 29}%`, top: `${index * 20}%` }}
            >
              <PairLabel pair={pair} index={index} progress={progress} />
            </div>
          ))}
        </div>

        <div className="absolute inset-x-[20%] top-[60%]">
          {PAIRS.slice(3).map((pair, index) => (
            <div
              key={pair.was}
              className="absolute"
              style={{ left: `${index * 32}%`, top: `${index * 18}%` }}
            >
              <PairLabel pair={pair} index={index + 3} progress={progress} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── mobile progression row ─── */
function MobilePairRow({
  pair,
  index,
  progress,
}: {
  pair: (typeof PAIRS)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  // stagger rows across the "change" phase (mobile progress 0.26 - 0.58)
  const start = 0.26 + index * 0.046;
  const hold = start + 0.06;
  const opacity = useTransform(progress, [start, hold], [0, 1]);
  const y = useTransform(progress, [start, hold], [14, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-3 border-t border-black/10 py-2.5"
    >
      <span className="font-serif text-[1.15rem] leading-snug tracking-tight text-neutral-400">
        {pair.was}
      </span>
      <span
        className="font-mono text-[9px] uppercase tracking-[0.16em] text-bs-purple/50"
        aria-hidden="true"
      >
        &rarr;
      </span>
      <span className="text-right font-serif text-[1.15rem] leading-snug tracking-tight text-black/85">
        {pair.now}
      </span>
    </motion.div>
  );
}

/* ─── mobile-specific scroll sequence ─── */
function MobileGapSequence({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  // STATE 1: Premise (0 - 0.20)
  const premiseOp = useTransform(progress, [0, 0.10, 0.16, 0.22], [1, 1, 1, 0]);
  const premiseY = useTransform(progress, [0.16, 0.22], [0, -18]);

  // STATE 2: Earlier anchor (0.18 - 0.72)
  const earlierOp = useTransform(progress, [0.18, 0.24, 0.66, 0.74], [0, 1, 1, 0]);
  const earlierY = useTransform(progress, [0.18, 0.24], [14, 0]);

  // STATE 3: Change rows (0.26 - 0.72) - individual rows staggered inside MobilePairRow

  // STATE 4: Today destination (0.58 - 0.74)
  const todayOp = useTransform(progress, [0.58, 0.64, 0.70, 0.78], [0, 1, 1, 0]);
  const todayY = useTransform(progress, [0.58, 0.64], [14, 0]);

  // STATE 5/6: Conclusion (0.80 - 1)
  const conclusionOp = useTransform(progress, [0.80, 0.88, 1], [0, 1, 1]);
  const conclusionY = useTransform(progress, [0.80, 0.88], [22, 0]);

  // Diagram container (Earlier + rows + Today): fade out together before conclusion
  const diagramOp = useTransform(progress, [0.68, 0.78], [1, 0]);

  return (
    <div className="relative h-full">
      {/* STATE 1: Premise */}
      <Stage
        opacity={premiseOp}
        className={`justify-start px-8 ${MOBILE_STAGE_TOP} sm:px-10`}
      >
        <motion.div style={{ y: premiseY }} className="max-w-[20rem]">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            02 · The gap
          </p>
          <h2 className="font-serif text-[2.1rem] leading-[1.08] tracking-tight text-black">
            Sometimes the brand stays still while the business moves on.
          </h2>
        </motion.div>
      </Stage>

      {/* STATES 2-4: Diagram */}
      <motion.div
        style={{ opacity: diagramOp }}
        className={`absolute inset-0 flex flex-col justify-start px-8 ${MOBILE_STAGE_TOP} sm:px-10`}
      >
        {/* Earlier: restrained neutral, left-anchored */}
        <motion.div style={{ opacity: earlierOp, y: earlierY }} className="mb-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
            WHO YOU WERE
          </p>
          <p className="mt-2 font-serif text-[2rem] leading-none tracking-tight text-neutral-400">
            Earlier
          </p>
        </motion.div>

        {/* Comparison rows */}
        <div className="space-y-0">
          {PAIRS.map((pair, index) => (
            <MobilePairRow
              key={pair.was}
              pair={pair}
              index={index}
              progress={progress}
            />
          ))}
        </div>

        {/* Today: stronger purple accent, right-anchored */}
        <motion.div style={{ opacity: todayOp, y: todayY }} className="mt-5 text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bs-purple">
            WHO YOU ARE NOW
          </p>
          <p className="mt-2 font-serif text-[2rem] leading-none tracking-tight text-bs-purple">
            Today
          </p>
        </motion.div>
      </motion.div>

      {/* STATE 6: Conclusion — starts below chrome + pill with breathing room */}
      <Stage
        opacity={conclusionOp}
        className={`justify-start px-8 ${MOBILE_STAGE_TOP} sm:px-10`}
      >
        <motion.div style={{ y: conclusionY }} className="mt-4 max-w-[20rem]">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bs-purple">
            The distance
          </p>
          <p className="mt-4 font-serif text-[1.65rem] leading-snug tracking-tight text-black">
            That distance is where rebranding begins.
          </p>
          <p className="mt-5 max-w-[18rem] font-mono text-sm leading-relaxed text-neutral-600">
            The work is not pretending nothing changed. It is closing the gap
            between what the business has become and what the brand still says.
          </p>
        </motion.div>
      </Stage>
    </div>
  );
}

export default function ChapterGap() {
  const { reducedMotion } = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const introOpacity = useTransform(scrollYProgress, [0, 0.14, 0.3, 0.42], [1, 1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0.26, 0.42], [0, -24]);
  const resolveOpacity = useTransform(scrollYProgress, [0.76, 0.88, 1], [0, 1, 1]);
  const resolveY = useTransform(scrollYProgress, [0.76, 0.88], [24, 0]);

  if (reducedMotion) {
    return (
      <section
        id="the-gap"
        className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            02 · The gap
          </p>
          <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Sometimes the brand stays still while the business moves on.
          </h2>
          <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            Rebranding starts when the distance between the old picture and the
            current business becomes too obvious to ignore.
          </p>

          <div className="mt-14 grid gap-12 md:grid-cols-[1fr_auto_1fr] md:items-start">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                WHO YOU WERE
              </p>
              <ul className="mt-5 space-y-4">
                {PAIRS.map((pair) => (
                  <li key={pair.was} className="font-serif text-2xl tracking-tight text-neutral-500">
                    {pair.was}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden self-stretch md:block">
              <div className="h-full w-px bg-gradient-to-b from-transparent via-bs-purple to-transparent" />
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bs-purple">
                WHO YOU ARE NOW
              </p>
              <ul className="mt-5 space-y-4">
                {PAIRS.map((pair) => (
                  <li key={pair.now} className="font-serif text-2xl tracking-tight text-black">
                    {pair.now}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-14 max-w-xl font-serif text-2xl leading-snug tracking-tight text-black md:text-4xl">
            That distance is where <span className="text-bs-purple">rebranding</span>{" "}
            begins.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="the-gap"
      className="relative z-10 scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      {/* Desktop track */}
      <div ref={trackRef} className="relative h-[170vh] md:h-[200vh]">
        <div className="sticky top-0 isolate h-[100svh] overflow-hidden bg-bs-offwhite">
          {/* Desktop distance field */}
          <div className="hidden md:block">
            <DesktopDistanceField progress={scrollYProgress} />
          </div>

          {/* Desktop stages */}
          <div className="relative z-10 mx-auto hidden h-full max-w-6xl md:block md:px-10 lg:pr-24">
            <Stage
              opacity={introOpacity}
              className="justify-start px-0 pt-20 pb-12"
            >
              <motion.div style={{ y: introY }} className="max-w-3xl">
                <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  02 · The gap
                </p>
                <h2 className="font-serif text-6xl leading-[1.08] tracking-tight text-black">
                  Sometimes the brand stays still while the business moves on.
                </h2>
              </motion.div>
            </Stage>

            <Stage
              opacity={resolveOpacity}
              className="justify-center px-0 pt-0 pb-0"
            >
              <motion.div
                style={{ y: resolveY }}
                className="mx-auto w-full max-w-2xl md:w-[56%] md:max-w-[32rem]"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bs-purple">
                  The distance
                </p>
                <p className="mt-5 font-serif text-5xl leading-snug tracking-tight text-black">
                  That distance is where rebranding begins.
                </p>
                <p className="mt-5 max-w-md font-mono text-sm leading-relaxed text-neutral-600">
                  The work is not pretending nothing changed. It is closing the gap
                  between what the business has become and what the brand still says.
                </p>
              </motion.div>
            </Stage>
          </div>

          {/* Mobile sequence */}
          <div className="md:hidden">
            <MobileGapSequence progress={scrollYProgress} />
          </div>
        </div>
      </div>
    </section>
  );
}
