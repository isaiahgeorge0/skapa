"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import LogoDesignButton from "./LogoDesignButton";
import StudyMark from "./StudyMark";
import { useReducedMotion } from "./useReducedMotion";

const MOBILE_STAGE_TOP =
  "pt-[calc(var(--skapa-site-chrome-height)+var(--skapa-chapter-pill-clearance)+1.5rem)]";

/**
 * Wave exit timing: weaker concepts leave first, then stronger survivors,
 * until only the resolved mark remains.
 */
type Wave = 1 | 2 | 3;

type Exploration = {
  id: string;
  wave: Wave;
  /** Desktop placement */
  desk: string;
  /** Mobile placement — deliberately recomposed, not a shrink */
  mob: string;
  deskSize: string;
  mobSize: string;
  mark: ReactNode;
  /** Optional mid-scroll colour (wave 2/3 survivors) */
  accent?: string;
};

const EXPLORATIONS: Exploration[] = [
  {
    id: "geo-ring",
    wave: 1,
    desk: "top-[14%] right-[8%]",
    mob: "top-[12%] right-[4%]",
    deskSize: "h-20 w-20",
    mobSize: "h-12 w-12",
    mark: <GeoRing />,
  },
  {
    id: "type-a",
    wave: 1,
    desk: "top-[18%] left-[6%]",
    mob: "top-[14%] left-[3%]",
    deskSize: "h-16 w-16",
    mobSize: "h-10 w-10",
    mark: <TypeA />,
  },
  {
    id: "mono-m",
    wave: 1,
    desk: "top-[42%] right-[4%]",
    mob: "top-[38%] right-[2%]",
    deskSize: "h-20 w-20",
    mobSize: "h-11 w-11",
    mark: <MonoM />,
  },
  {
    id: "neg-cut",
    wave: 1,
    desk: "bottom-[18%] left-[5%]",
    mob: "bottom-[10%] left-[2%]",
    deskSize: "h-16 w-16",
    mobSize: "h-10 w-10",
    mark: <NegCut />,
  },
  {
    id: "tri-peak",
    wave: 1,
    desk: "bottom-[22%] right-[22%]",
    mob: "bottom-[8%] right-[28%]",
    deskSize: "h-14 w-14",
    mobSize: "h-9 w-9",
    mark: <TriPeak />,
  },
  {
    id: "grid-block",
    wave: 2,
    desk: "top-[28%] right-[26%]",
    mob: "top-[22%] right-[22%]",
    deskSize: "h-16 w-16",
    mobSize: "h-11 w-11",
    mark: <GridBlock />,
    accent: "#ff2791",
  },
  {
    id: "abstract-blob",
    wave: 2,
    desk: "bottom-[28%] left-[22%]",
    mob: "bottom-[16%] left-[18%]",
    deskSize: "h-20 w-20",
    mobSize: "h-11 w-11",
    mark: <AbstractCurve />,
    accent: "#4b4ae4",
  },
  {
    id: "dot-orbit",
    wave: 2,
    desk: "top-[52%] left-[8%]",
    mob: "top-[48%] left-[4%]",
    deskSize: "h-14 w-14",
    mobSize: "h-9 w-9",
    mark: <DotOrbit />,
  },
  {
    id: "minimal-bar",
    wave: 3,
    desk: "top-[20%] right-[18%]",
    mob: "top-[16%] right-[16%]",
    deskSize: "h-24 w-24",
    mobSize: "h-14 w-14",
    mark: <MinimalBar />,
    accent: "#4b4ae4",
  },
  {
    id: "square-cross",
    wave: 3,
    desk: "bottom-[16%] right-[8%]",
    mob: "bottom-[12%] right-[6%]",
    deskSize: "h-16 w-16",
    mobSize: "h-11 w-11",
    mark: <SquareCross />,
    accent: "#ff2791",
  },
];

/** Exit windows per wave — short overall track. */
const WAVE_EXIT: Record<Wave, [number, number, number]> = {
  1: [0.12, 0.28, 0.4],
  2: [0.32, 0.48, 0.62],
  3: [0.55, 0.7, 0.82],
};

export default function ChapterIdea() {
  const { reducedMotion, ready } = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  if (!ready) {
    return <div className="min-h-[100svh] bg-bs-offwhite" aria-hidden="true" />;
  }

  if (reducedMotion) {
    return <StaticHero />;
  }

  return (
    <section id="the-idea" className="scroll-mt-chapter lg:scroll-mt-0">
      {/* Short track: establish → thin → resolve → brief hold → release */}
      <div ref={trackRef} className="relative h-[145vh] md:h-[155vh]">
        <div className="sticky top-0 isolate h-[100svh] overflow-hidden bg-bs-offwhite">
          {/* Soft colour wash arrives only as selection clarifies */}
          <ColourWash progress={scrollYProgress} />

          {/* Desktop exploration field */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden md:block"
          >
            {EXPLORATIONS.map((item) => (
              <ExplorationMark
                key={`d-${item.id}`}
                item={item}
                progress={scrollYProgress}
                placement={item.desk}
                size={item.deskSize}
              />
            ))}
            <ResolvedHeroMark progress={scrollYProgress} desktop />
          </div>

          {/* Mobile exploration field — recomposed, not shrunk */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 md:hidden"
          >
            {EXPLORATIONS.map((item) => (
              <ExplorationMark
                key={`m-${item.id}`}
                item={item}
                progress={scrollYProgress}
                placement={item.mob}
                size={item.mobSize}
              />
            ))}
            <ResolvedHeroMark progress={scrollYProgress} desktop={false} />
          </div>

          {/* Stable copy — animation belongs to the marks */}
          <div
            className={`relative z-20 flex h-full flex-col px-8 pb-10 sm:px-10 md:px-12 md:pb-14 lg:pr-28 ${MOBILE_STAGE_TOP}`}
          >
            {/* Mobile readability shield so explorations never fight the headline */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-bs-offwhite via-bs-offwhite/92 to-transparent md:hidden"
            />
            <div className="relative max-w-[20rem] sm:max-w-md md:max-w-xl lg:max-w-2xl">
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                Logo design · 01
              </p>
              <h1 className="font-serif text-[2.25rem] leading-[1.08] tracking-tight text-black sm:text-[2.6rem] md:text-6xl lg:text-[4rem]">
                A logo should be simple.
                <br />
                Getting there isn&apos;t.
              </h1>
              <p className="mt-6 max-w-[34ch] font-mono text-sm leading-relaxed text-neutral-600 md:max-w-xl md:text-base">
                The strongest marks often look obvious once they&apos;re finished.
                Behind them are ideas explored, decisions questioned and details
                refined until nothing unnecessary remains.
              </p>
              <div className="mt-8">
                <LogoDesignButton href="/start">Start a project</LogoDesignButton>
              </div>
            </div>

            <ProgressCue progress={scrollYProgress} />
          </div>
        </div>
      </div>
    </section>
  );
}

function StaticHero() {
  return (
    <section
      id="the-idea"
      className="scroll-mt-chapter bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className={`relative overflow-hidden ${MOBILE_STAGE_TOP}`}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute top-[16%] right-[6%] opacity-25 md:right-[10%]">
            <div className="h-12 w-12 text-neutral-500 md:h-16 md:w-16">
              <GeoRing />
            </div>
          </div>
          <div className="absolute bottom-[14%] right-[8%] md:right-[14%]">
            <StudyMark
              stage="resolve"
              className="h-24 w-24 text-bs-purple md:h-32 md:w-32"
              fill="currentColor"
            />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-8 pb-20 sm:px-10 md:px-10 md:pb-28 lg:pr-24">
          <div className="max-w-2xl">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Logo design · 01
            </p>
            <h1 className="font-serif text-[2.25rem] leading-[1.08] tracking-tight text-black sm:text-[2.6rem] md:text-6xl lg:text-[4rem]">
              A logo should be simple.
              <br />
              Getting there isn&apos;t.
            </h1>
            <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
              The strongest marks often look obvious once they&apos;re finished.
              Behind them are ideas explored, decisions questioned and details
              refined until nothing unnecessary remains.
            </p>
            <div className="mt-8">
              <LogoDesignButton href="/start">Start a project</LogoDesignButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ColourWash({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.45, 0.7, 0.95], [0, 0.08, 0.14]);
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-bs-purple"
      style={{ opacity }}
    />
  );
}

function ExplorationMark({
  item,
  progress,
  placement,
  size,
}: {
  item: Exploration;
  progress: MotionValue<number>;
  placement: string;
  size: string;
}) {
  const [a, b, c] = WAVE_EXIT[item.wave];
  const opacity = useTransform(progress, [0, a, b, c], [1, 1, 0.35, 0]);
  const scale = useTransform(progress, [a, c], [1, 0.82]);
  const y = useTransform(progress, [a, c], [0, item.wave === 1 ? -18 : 14]);
  const color = useTransform(progress, (v) => {
    if (!item.accent) return "#2a2a2a";
    if (v < a) return "#2a2a2a";
    if (v > b) return item.accent;
    return "#2a2a2a";
  });

  return (
    <motion.div
      className={`absolute ${placement} ${size}`}
      style={{ opacity, scale, y, color }}
    >
      {item.mark}
    </motion.div>
  );
}

function ResolvedHeroMark({
  progress,
  desktop,
}: {
  progress: MotionValue<number>;
  desktop: boolean;
}) {
  const opacity = useTransform(progress, [0.68, 0.82, 1], [0, 1, 1]);
  const scale = useTransform(progress, [0.68, 0.86], [0.88, 1]);

  return (
    <motion.div
      className={
        desktop
          ? "absolute top-1/2 right-[10%] -translate-y-1/2 xl:right-[14%]"
          : "absolute right-[6%] bottom-[18%]"
      }
      style={{ opacity, scale }}
    >
      <StudyMark
        stage="resolve"
        className={
          desktop
            ? "h-36 w-36 text-bs-purple xl:h-44 xl:w-44"
            : "h-20 w-20 text-bs-purple"
        }
        fill="currentColor"
      />
    </motion.div>
  );
}

function ProgressCue({ progress }: { progress: MotionValue<number> }) {
  const [label, setLabel] = useState("Many possibilities");
  const opacity = useTransform(progress, [0, 0.05, 0.92, 1], [0.7, 0.7, 0.7, 0]);

  useMotionValueEvent(progress, "change", (v) => {
    const next =
      v < 0.28
        ? "Many possibilities"
        : v < 0.62
          ? "Fewer strong ideas"
          : "One resolved mark";
    setLabel((current) => (current === next ? current : next));
  });

  useEffect(() => {
    // Sync initial label if page loads mid-scroll
    const v = progress.get();
    if (v < 0.28) setLabel("Many possibilities");
    else if (v < 0.62) setLabel("Fewer strong ideas");
    else setLabel("One resolved mark");
  }, [progress]);

  return (
    <motion.p
      className="mt-auto pt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400"
      style={{ opacity }}
    >
      {label}
    </motion.p>
  );
}

/* ─── Distinct exploration marks (not decorative geometry) ─── */

function GeoRing() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none">
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="32" cy="32" r="8" fill="currentColor" />
    </svg>
  );
}

function TypeA() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none">
      <path
        d="M16 50 L32 12 L48 50"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M22 36 H42" stroke="currentColor" strokeWidth="3.5" />
    </svg>
  );
}

function MonoM() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none">
      <path
        d="M12 48 V16 L32 40 L52 16 V48"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NegCut() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <circle cx="32" cy="32" r="22" fill="currentColor" />
      <rect x="26" y="18" width="12" height="28" fill="#efeeea" />
    </svg>
  );
}

function TriPeak() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none">
      <path
        d="M32 10 L54 50 H10 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GridBlock() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none">
      <rect x="12" y="12" width="40" height="40" stroke="currentColor" strokeWidth="2.5" />
      <path d="M32 12 V52 M12 32 H52" stroke="currentColor" strokeWidth="2.5" />
      <rect x="32" y="32" width="20" height="20" fill="currentColor" />
    </svg>
  );
}

function AbstractCurve() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none">
      <path
        d="M14 40 C14 20 26 12 32 12 C44 12 52 24 52 34 C52 48 40 54 32 54 C20 54 14 46 14 40 Z"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path d="M32 12 V54" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

function DotOrbit() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none">
      <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="14" r="4" fill="currentColor" />
      <circle cx="48" cy="40" r="3" fill="currentColor" />
    </svg>
  );
}

function MinimalBar() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none">
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="3" />
      <rect x="28" y="18" width="8" height="28" fill="currentColor" />
    </svg>
  );
}

function SquareCross() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none">
      <rect
        x="14"
        y="14"
        width="36"
        height="36"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path d="M20 32 H44 M32 20 V44" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
