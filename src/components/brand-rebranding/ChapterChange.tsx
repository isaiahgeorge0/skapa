"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import RebrandingButton from "./RebrandingButton";
import { useReducedMotion } from "./useReducedMotion";

const PRESSURES = [
  { label: "NEW AUDIENCE", desktopLeft: "14%", desktopTop: "48%" },
  { label: "NEW OFFER", desktopLeft: "38%", desktopTop: "56%" },
  { label: "NEW MARKET", desktopLeft: "62%", desktopTop: "50%" },
  { label: "BIGGER TEAM", desktopLeft: "22%", desktopTop: "68%" },
  { label: "NEW AMBITION", desktopLeft: "52%", desktopTop: "72%" },
] as const;

const MOBILE_STAGE_TOP =
  "pt-[calc(var(--skapa-site-chrome-height)+var(--skapa-chapter-pill-clearance)+1.75rem)]";

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
      className={`absolute inset-0 flex flex-col ${
        hidden ? "invisible pointer-events-none" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SpecimenSystem({ pressure }: { pressure: MotionValue<number> }) {
  const markScale = useTransform(pressure, [0, 0.55, 1], [1, 0.92, 0.86]);
  const gridOpacity = useTransform(pressure, [0, 0.4, 1], [0.35, 0.22, 0.12]);
  const typeShift = useTransform(pressure, [0, 1], [0, -10]);
  const ruleScale = useTransform(pressure, [0, 1], [1, 0.72]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div style={{ opacity: gridOpacity }} className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.07) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </motion.div>

      <motion.div
        style={{ scale: markScale }}
        className="absolute top-[22%] right-[12%] h-20 w-20 border-2 border-neutral-800 md:top-[18%] md:right-[16%] md:h-28 md:w-28"
      >
        <div className="absolute top-3 left-3 h-3 w-3 bg-neutral-800 md:top-4 md:left-4 md:h-4 md:w-4" />
        <div className="absolute right-3 bottom-3 h-px w-8 bg-neutral-800 md:right-4 md:bottom-4 md:w-10" />
      </motion.div>

      <motion.div
        style={{ y: typeShift, scaleX: ruleScale }}
        className="absolute top-[28%] left-[10%] h-px w-[38%] origin-left bg-neutral-800/50 md:left-[12%]"
      />
      <motion.p
        style={{ y: typeShift }}
        className="absolute top-[30%] left-[10%] font-serif text-3xl tracking-tight text-neutral-800/40 md:left-[12%] md:text-5xl"
      >
        Aa
      </motion.p>
      <div className="absolute bottom-[18%] left-[10%] font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400 md:left-[12%]">
        Specimen · System A
      </div>
    </div>
  );
}

function PressureChip({
  progress,
  index,
  label,
  desktopLeft,
  desktopTop,
}: {
  progress: MotionValue<number>;
  index: number;
  label: string;
  desktopLeft: string;
  desktopTop: string;
}) {
  const start = 0.14 + index * 0.1;
  const mid = start + 0.08;
  const opacity = useTransform(progress, [start, mid, 0.86, 0.95], [0, 1, 1, 0.35]);
  const y = useTransform(progress, [start, mid], [18, 0]);
  const x = useTransform(progress, [start, mid], [14, 0]);

  return (
    <>
      <motion.p
        style={{ opacity, y, left: desktopLeft, top: desktopTop }}
        className="absolute hidden font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-700 md:block"
      >
        {label}
      </motion.p>
      <motion.p
        style={{ opacity, x }}
        className="border-l border-neutral-400 pl-3 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-700 md:hidden"
      >
        {label}
      </motion.p>
    </>
  );
}

export default function ChapterChange() {
  const { reducedMotion } = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.12, 0.28, 0.38], [1, 1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0.22, 0.38], [0, -28]);
  const pressure = useTransform(scrollYProgress, [0.18, 0.72], [0, 1]);
  // "THE PRESSURE" explanation enters early so it precedes the visual development
  const resolveOpacity = useTransform(scrollYProgress, [0.34, 0.46, 0.92, 1], [0, 1, 1, 1]);
  const resolveY = useTransform(scrollYProgress, [0.34, 0.46], [20, 0]);
  // Specimen and resolved composition stay at full strength; the section
  // leaves spatially (sticky release) rather than fading to nothing.
  const specimenFade = useTransform(scrollYProgress, [0, 1], [1, 1]);

  if (reducedMotion) {
    return (
      <section
        id="change"
        className="relative scroll-mt-chapter overflow-hidden bg-[#e8e7e3] lg:scroll-mt-0"
      >
        <div className="relative mx-auto max-w-6xl px-8 py-20 md:px-10 md:py-28 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Rebranding · 01
          </p>
          <h1 className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight text-black md:text-6xl">
            Your business changed. Did your brand?
          </h1>
          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            Businesses evolve. Offers grow. Audiences shift. Sometimes the brand
            that got you here isn&apos;t the one that can take you further.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <RebrandingButton href="/start">Start a project</RebrandingButton>
            <RebrandingButton href="/what-we-do/brand/brand-strategy" variant="secondary">
              Explore brand strategy
            </RebrandingButton>
          </div>
          <ul className="mt-14 space-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
            {PRESSURES.map((item) => (
              <li key={item.label}>{item.label}</li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section id="change" className="relative z-20 scroll-mt-chapter lg:scroll-mt-0">
      <div ref={trackRef} className="relative h-[200vh] md:h-[240vh]">
        <div className="sticky top-0 isolate h-[100svh] overflow-hidden bg-[#e8e7e3]">
          <motion.div style={{ opacity: specimenFade }} className="absolute inset-0">
            <SpecimenSystem pressure={pressure} />
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute inset-x-8 top-[48%] space-y-3 md:contents">
                {PRESSURES.map((item, index) => (
                  <PressureChip
                    key={item.label}
                    progress={scrollYProgress}
                    index={index}
                    label={item.label}
                    desktopLeft={item.desktopLeft}
                    desktopTop={item.desktopTop}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <div className="relative z-10 mx-auto h-full max-w-6xl md:px-10 lg:pr-24">
            <Stage
              opacity={heroOpacity}
              className={`justify-start px-8 pb-16 ${MOBILE_STAGE_TOP} sm:px-10 md:justify-center md:px-0 md:pt-0 md:py-12`}
            >
              <motion.div style={{ y: heroY }} className="max-w-3xl">
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500 md:mb-5">
                  Rebranding · 01
                </p>
                <h1 className="font-serif text-[2.2rem] leading-[1.08] tracking-tight text-black sm:text-5xl md:text-6xl lg:text-[4rem]">
                  Your business changed.
                  <br />
                  Did your brand?
                </h1>
                <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:mt-6 md:text-base">
                  Businesses evolve. Offers grow. Audiences shift. Sometimes the
                  brand that got you here isn&apos;t the one that can take you
                  further.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 md:mt-10 md:gap-4">
                  <RebrandingButton href="/start">Start a project</RebrandingButton>
                  <RebrandingButton
                    href="/what-we-do/brand/brand-strategy"
                    variant="secondary"
                  >
                    Explore brand strategy
                  </RebrandingButton>
                </div>
              </motion.div>
            </Stage>

            <Stage
              opacity={resolveOpacity}
              className={`justify-start px-8 pb-16 ${MOBILE_STAGE_TOP} sm:px-10 md:justify-center md:px-0 md:pt-0 md:py-12`}
            >
              <motion.div style={{ y: resolveY }} className="max-w-2xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  The pressure
                </p>
                <p className="mt-4 font-serif text-[1.65rem] leading-snug tracking-tight text-black md:mt-5 md:text-4xl">
                  The business has outgrown the system.
                </p>
                <p className="mt-5 max-w-md font-mono text-sm leading-relaxed text-neutral-600">
                  Not because the brand was incompetent. Because the company moved
                  on, and the identity stayed where it was.
                </p>
              </motion.div>
            </Stage>
          </div>
        </div>
      </div>
      <div className="h-[6vh] bg-[#e8e7e3] md:h-0" aria-hidden="true" />
    </section>
  );
}
