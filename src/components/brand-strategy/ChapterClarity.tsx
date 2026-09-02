"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import BrandStrategyButton from "./BrandStrategyButton";
import { useReducedMotion } from "./useReducedMotion";

const QUESTIONS = [
  {
    index: "01",
    label: "Audience",
    question: "Who are you actually for?",
  },
  {
    index: "02",
    label: "Difference",
    question: "Why should anyone choose you?",
  },
  {
    index: "03",
    label: "Position",
    question: "What do you want to be known for?",
  },
] as const;

function useExclusiveOpacity(
  progress: MotionValue<number>,
  enter: number,
  holdStart: number,
  holdEnd: number,
  exit: number,
) {
  return useTransform(
    progress,
    [enter, holdStart, holdEnd, exit],
    [0, 1, 1, 0],
  );
}

function StageCopy({
  children,
  opacity,
  y,
  className = "",
}: {
  children: ReactNode;
  opacity: MotionValue<number>;
  y?: MotionValue<number>;
  className?: string;
}) {
  const [interactive, setInteractive] = useState(opacity.get() >= 0.5);
  const [hidden, setHidden] = useState(opacity.get() < 0.04);

  useMotionValueEvent(opacity, "change", (value) => {
    setInteractive(value >= 0.5);
    setHidden(value < 0.04);
  });

  return (
    <motion.div
      style={y ? { opacity, y } : { opacity }}
      aria-hidden={hidden}
      className={`absolute inset-0 flex flex-col justify-center ${
        interactive ? "" : "pointer-events-none"
      } ${hidden ? "invisible" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

function HeroCopy() {
  return (
    <div className="max-w-3xl">
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-bs-pink">
        Brand Strategy · 01
      </p>
      <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-bs-offwhite sm:text-5xl md:text-6xl lg:text-[4.1rem]">
        Before your brand looks different,
        <br className="hidden sm:block" /> it needs a reason to be different.
      </h1>
      <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-bs-offwhite/80 md:text-base">
        We uncover what makes your business worth choosing, then turn it into a
        clear position, personality and message your brand can build from.
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <BrandStrategyButton href="/start" variant="on-colour">
          Start a project
        </BrandStrategyButton>
        <a
          href="#sound-familiar"
          className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-bs-offwhite/80 transition-colors hover:text-bs-pink"
        >
          See how it works
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 group-hover:translate-y-0.5"
          >
            ↓
          </span>
        </a>
      </div>
    </div>
  );
}

function QuestionLabel({
  index,
  label,
  className = "",
}: {
  index: string;
  label: string;
  className?: string;
}) {
  return (
    <p
      className={`font-mono text-[11px] uppercase tracking-[0.2em] ${className}`}
    >
      {index} / {label}
    </p>
  );
}

/** Q1 — purple-led: editorial type + sliding rule + left colour bar */
function QuestionOne({
  ruleScale,
}: {
  ruleScale?: MotionValue<number>;
}) {
  const rule = (
    <div
      className="mt-5 h-px w-14 origin-left bg-bs-purple"
      aria-hidden="true"
    />
  );

  return (
    <div className="relative w-full max-w-3xl pl-5 md:pl-7">
      <div
        className="absolute top-1 bottom-1 left-0 w-1 bg-bs-purple md:w-1.5"
        aria-hidden="true"
      />
      <QuestionLabel index="01" label="Audience" className="text-bs-purple" />
      {ruleScale ? (
        <motion.div style={{ scaleX: ruleScale }} className="origin-left">
          {rule}
        </motion.div>
      ) : (
        rule
      )}
      <p className="mt-6 font-serif text-3xl leading-[1.08] tracking-tight text-black sm:text-4xl md:text-5xl lg:text-6xl">
        Who are you actually{" "}
        <span className="text-bs-purple">for?</span>
      </p>
    </div>
  );
}

/** Q2 — pink-led: right-aligned, accent phrase on a pink field */
function QuestionTwo() {
  return (
    <div className="ml-auto w-full max-w-3xl text-right">
      <QuestionLabel index="02" label="Difference" className="text-bs-pink" />
      <p className="mt-6 font-serif text-3xl leading-[1.08] tracking-tight text-black sm:text-4xl md:text-5xl lg:text-6xl">
        Why should anyone
        <br />
        <span className="mt-3 inline-block bg-bs-pink px-3 py-1 text-bs-offwhite md:mt-4 md:px-4">
          choose you?
        </span>
      </p>
    </div>
  );
}

/** Q3 — pale yellow field + dark type, pink detail on the key word */
function QuestionThree() {
  return (
    <div className="relative w-full max-w-3xl">
      <div
        className="absolute -inset-x-4 -inset-y-6 -z-10 bg-bs-yellow md:-inset-x-8 md:-inset-y-8"
        aria-hidden="true"
      />
      <QuestionLabel index="03" label="Position" className="text-bs-pink" />
      <p className="mt-6 font-serif text-3xl leading-[1.08] tracking-tight text-black sm:text-4xl md:text-5xl lg:text-6xl">
        What do you want to be{" "}
        <span className="underline decoration-bs-pink decoration-2 underline-offset-[0.18em]">
          known for?
        </span>
      </p>
    </div>
  );
}

function ResolveCopy() {
  return (
    <div className="max-w-4xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bs-purple">
        Brand Strategy
      </p>
      <p className="mt-6 font-serif text-4xl leading-snug tracking-tight text-black md:text-5xl lg:text-6xl">
        Good design starts with{" "}
        <span className="text-bs-purple">better questions.</span>
      </p>
      <div
        className="mt-8 flex h-1 w-24 overflow-hidden"
        aria-hidden="true"
      >
        <span className="h-full w-1/3 bg-bs-purple" />
        <span className="h-full w-1/3 bg-bs-pink" />
        <span className="h-full w-1/3 bg-bs-yellow" />
      </div>
    </div>
  );
}

export default function ChapterClarity() {
  const { reducedMotion } = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  /*
   * 0.00–0.16  complete hero hold
   * 0.16–0.34  hero foreground exits
   * 0.22–0.56  hero curtain exits → reveals questions
   * 0.26–0.34  Q1 enters (unchanged)
   * 0.34–0.58  Q1 holds past curtain clear (~0.56)
   * 0.58–0.66  Q1↔Q2 crossfade (no blank viewport)
   * 0.66–0.74  Q2 holds
   * 0.74–0.80  Q2↔Q3 crossfade
   * 0.80–0.88  Q3 holds
   * 0.88–0.94  Q3↔resolve crossfade
   * 0.94–1.00  resolve → Ch02
   */

  const heroCopyOpacity = useTransform(
    scrollYProgress,
    [0, 0.16, 0.32],
    [1, 1, 0],
  );
  const heroCopyY = useTransform(scrollYProgress, [0.16, 0.34], [0, -240]);

  const heroCurtainY = useTransform(
    scrollYProgress,
    [0, 0.16, 0.48, 0.56],
    ["0vh", "0vh", "-58vh", "-110vh"],
  );

  // Entrance unchanged; hold past curtain; exit overlaps Q2 enter
  const q1Opacity = useExclusiveOpacity(scrollYProgress, 0.26, 0.34, 0.58, 0.66);
  const q1Y = useTransform(scrollYProgress, [0.26, 0.34, 0.58, 0.66], [28, 0, 0, -20]);
  const q1RuleScale = useTransform(
    scrollYProgress,
    [0.3, 0.38, 0.58, 0.66],
    [0, 1, 1, 0],
  );

  const q2Opacity = useExclusiveOpacity(scrollYProgress, 0.58, 0.66, 0.74, 0.8);
  const q2Y = useTransform(scrollYProgress, [0.58, 0.66, 0.74, 0.8], [28, 0, 0, -20]);

  const q3Opacity = useExclusiveOpacity(scrollYProgress, 0.74, 0.8, 0.88, 0.93);
  const q3Y = useTransform(scrollYProgress, [0.74, 0.8, 0.88, 0.93], [28, 0, 0, -20]);

  const resolveOpacity = useTransform(
    scrollYProgress,
    [0.88, 0.93, 1],
    [0, 1, 1],
  );
  const resolveY = useTransform(scrollYProgress, [0.88, 0.93], [20, 0]);

  if (reducedMotion) {
    return (
      <section
        id="find-the-clarity"
        className="relative scroll-mt-16 lg:scroll-mt-0"
      >
        <div className="relative overflow-hidden bg-bs-purple">
          <div
            className="absolute top-0 right-0 h-[48%] w-[30%] bg-bs-pink"
            aria-hidden="true"
          />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-12 lg:pr-24">
            <div className="pt-2 md:pt-4">
              <HeroCopy />
            </div>
          </div>
        </div>

        <div className="bg-bs-offwhite">
          <div className="mx-auto max-w-6xl space-y-20 px-6 py-20 md:px-10 md:py-24 lg:pr-24">
            <QuestionOne />
            <QuestionTwo />
            <QuestionThree />
            <ResolveCopy />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="find-the-clarity"
      className="relative scroll-mt-16 lg:scroll-mt-0"
    >
      <div ref={trackRef} className="relative h-[240vh] md:h-[250vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-bs-offwhite">
          {/*
            Question sequence lives UNDER the hero curtain.
            As the purple/pink field slides away, it uncovers this stage.
          */}
          <div className="relative z-10 mx-auto h-full max-w-6xl px-6 md:px-10 lg:pr-24">
            <StageCopy opacity={q1Opacity} y={q1Y} className="py-10 md:py-12">
              <QuestionOne ruleScale={q1RuleScale} />
            </StageCopy>

            <StageCopy opacity={q2Opacity} y={q2Y} className="py-10 md:py-12">
              <QuestionTwo />
            </StageCopy>

            <StageCopy opacity={q3Opacity} y={q3Y} className="py-10 md:py-12">
              <QuestionThree />
            </StageCopy>

            <StageCopy
              opacity={resolveOpacity}
              y={resolveY}
              className="py-10 md:py-12"
            >
              <ResolveCopy />
            </StageCopy>
          </div>

          {/* Hero colour curtain — moves slowly; contains no question copy */}
          <motion.div
            style={{ y: heroCurtainY }}
            className="absolute inset-0 z-20 will-change-transform"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-bs-purple" />
            <div className="absolute top-0 right-0 h-[48%] w-[30%] bg-bs-pink md:h-[52%]" />
          </motion.div>

          {/*
            Hero foreground — held fully visible at load, then leaves faster
            than the curtain so the parallax handoff can begin.
          */}
          <div className="pointer-events-none absolute inset-0 z-30">
            <div className="pointer-events-auto mx-auto h-full max-w-6xl px-6 md:px-10 lg:pr-24">
              <StageCopy
                opacity={heroCopyOpacity}
                y={heroCopyY}
                className="py-10 md:py-12"
              >
                <HeroCopy />
              </StageCopy>
            </div>
          </div>
        </div>
      </div>

      <div className="sr-only">
        <p>Brand strategy begins by asking better questions.</p>
        <ol>
          {QUESTIONS.map((item) => (
            <li key={item.index}>
              {item.label}: {item.question}
            </li>
          ))}
        </ol>
        <p>Good design starts with better questions.</p>
      </div>
    </section>
  );
}
