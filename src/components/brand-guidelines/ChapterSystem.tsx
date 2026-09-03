"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import GuideMark from "./GuideMark";
import GuidelinesButton from "./GuidelinesButton";
import { useReducedMotion } from "./useReducedMotion";

const MOBILE_STAGE_TOP =
  "pt-[calc(var(--skapa-site-chrome-height)+var(--skapa-chapter-pill-clearance)+1.5rem)]";

const SPREADS = [
  { page: "02", title: "Logo", tabs: ["Mark", "Clear space", "Colour"] },
  { page: "08", title: "Colour", tabs: ["Primary", "Support", "Values"] },
  { page: "14", title: "Type", tabs: ["Serif", "Mono", "Hierarchy"] },
] as const;

export default function ChapterSystem() {
  const { reducedMotion, ready } = useReducedMotion();

  if (!ready) {
    return <div className="min-h-[100svh] bg-bs-offwhite" aria-hidden="true" />;
  }

  return (
    <section id="the-system" className="scroll-mt-chapter lg:scroll-mt-0">
      {reducedMotion ? (
        <div className="hidden bg-bs-offwhite md:block">
          <StaticHeroInner />
        </div>
      ) : (
        <DesktopPageTurn />
      )}

      <div className="bg-bs-offwhite md:hidden">
        <div className={`px-8 pb-8 sm:px-10 ${MOBILE_STAGE_TOP}`}>
          <HeroCopy />
        </div>
        <MobileStagedSequence reducedMotion={reducedMotion} />
      </div>
    </section>
  );
}

function DesktopPageTurn() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={trackRef} className="relative hidden h-[150vh] md:block">
      <div className="sticky top-0 isolate h-[100svh] overflow-hidden bg-bs-offwhite">
        <div
          className={`relative z-10 grid h-full items-center gap-8 px-8 pb-10 sm:px-10 md:grid-cols-12 md:gap-10 md:px-12 md:pb-14 lg:pr-28 ${MOBILE_STAGE_TOP}`}
        >
          <HeroCopy />
          <div className="relative md:col-span-7">
            <ManualStack progress={scrollYProgress} />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroCopy() {
  return (
    <div className="md:col-span-5">
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
        Brand guidelines · 01
      </p>
      <h1 className="font-serif text-[2.2rem] leading-[1.08] tracking-tight text-black sm:text-[2.55rem] md:text-5xl lg:text-[3.6rem]">
        A brand shouldn&apos;t change
        <br />
        depending on who&apos;s using it.
      </h1>
      <p className="mt-6 max-w-[36ch] font-mono text-sm leading-relaxed text-neutral-600 md:max-w-md md:text-base">
        Clear guidelines turn creative decisions into a system people can
        actually use. From logo and colour to typography, imagery and tone
        of voice, everything has a reason and a rule.
      </p>
      <div className="mt-8">
        <GuidelinesButton href="/start">Start a project</GuidelinesButton>
      </div>
    </div>
  );
}

function StaticHeroInner() {
  return (
    <div
      className={`mx-auto grid max-w-6xl items-center gap-10 px-8 pb-20 sm:px-10 md:grid-cols-12 md:px-10 md:pb-28 lg:pr-24 ${MOBILE_STAGE_TOP}`}
    >
      <HeroCopy />
      <div className="md:col-span-7">
        <ManualPage
          page="14"
          title="Type"
          tabs={["Serif", "Mono", "Hierarchy"]}
          active
        />
      </div>
    </div>
  );
}

function MobileStagedSequence({ reducedMotion }: { reducedMotion: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.12", "end end"],
  });

  const logoX = useTransform(scrollYProgress, [0.02, 0.2], ["-118%", "0%"]);
  const logoR = useTransform(scrollYProgress, [0.02, 0.2], [-8, -5]);
  const colourX = useTransform(scrollYProgress, [0.32, 0.5], ["118%", "0%"]);
  const colourR = useTransform(scrollYProgress, [0.32, 0.5], [8, 5]);
  const typeY = useTransform(scrollYProgress, [0.6, 0.78], ["120%", "0%"]);

  if (reducedMotion) {
    return (
      <div className="px-8 pb-12 sm:px-10">
        <MobileStageCaption />
        <div className="relative mx-auto h-[19.5rem] max-w-[22rem]">
          <MobileCardLayer subject="logo" className="left-0 top-3 z-[1] w-[72%] -rotate-[5deg]" />
          <MobileCardLayer subject="colour" className="right-0 top-5 z-[2] w-[72%] rotate-[5deg]" />
          <MobileCardLayer subject="type" className="bottom-1 left-[11%] z-[3] w-[78%]" />
        </div>
      </div>
    );
  }

  return (
    <div ref={trackRef} className="relative h-[calc(22rem+185vh)]">
      <div
        className="sticky isolate bg-bs-offwhite px-8 pb-6 sm:px-10"
        style={{
          top: "calc(var(--skapa-site-chrome-height) + var(--skapa-chapter-pill-clearance))",
        }}
      >
        <MobileStageCaption />
        <div className="relative mx-auto h-[19.5rem] max-w-[22rem] overflow-hidden">
          <motion.div
            className="absolute left-0 top-3 z-[1] w-[72%]"
            style={{ x: logoX, rotate: logoR }}
          >
            <ProgressCard subject="logo" />
          </motion.div>
          <motion.div
            className="absolute right-0 top-5 z-[2] w-[72%]"
            style={{ x: colourX, rotate: colourR }}
          >
            <ProgressCard subject="colour" />
          </motion.div>
          <motion.div
            className="absolute bottom-1 left-[11%] z-[3] w-[78%]"
            style={{ y: typeY }}
          >
            <ProgressCard subject="type" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function MobileStageCaption() {
  return (
    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
      Inconsistent → correcting → consistent
    </p>
  );
}

function MobileCardLayer({
  subject,
  className,
}: {
  subject: "logo" | "colour" | "type";
  className: string;
}) {
  return (
    <div className={`absolute ${className}`}>
      <ProgressCard subject={subject} />
    </div>
  );
}

function ProgressCard({ subject }: { subject: "logo" | "colour" | "type" }) {
  return (
    <div className="overflow-hidden border border-black/15 bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between border-b border-black/10 px-2.5 py-1.5">
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-neutral-400">
          {subject === "logo"
            ? "01 · Logo"
            : subject === "colour"
              ? "02 · Colour"
              : "03 · Type"}
        </p>
        <p
          className={`font-mono text-[8px] uppercase tracking-[0.12em] ${
            subject === "logo"
              ? "text-bs-pink"
              : subject === "colour"
                ? "text-neutral-500"
                : "text-bs-purple"
          }`}
        >
          {subject === "logo"
            ? "Mark"
            : subject === "colour"
              ? "Palette"
              : "Hierarchy"}
        </p>
      </div>

      {subject === "logo" ? (
        <div className="grid grid-cols-[1.05fr_0.95fr] gap-2 p-2.5">
          <div className="pl-1 pt-0.5">
            <div className="mb-2 h-1 w-6 bg-bs-pink" />
            <p className="font-serif text-[1.35rem] leading-none tracking-tight text-black">
              Logo
            </p>
            <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-neutral-500">
              Clear space
            </p>
            <div className="mt-2.5 flex flex-col gap-2">
              <div className="h-1 w-[48%] bg-neutral-200" />
              <div className="ml-3 h-1 w-[88%] bg-bs-pink/35" />
              <div className="h-1 w-[32%] bg-neutral-200" />
            </div>
          </div>
          <div className="relative flex items-center justify-center bg-neutral-100 py-3">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 border border-dashed border-black/20"
            />
            <div style={{ transform: "translate(7px, -5px) rotate(-11deg)" }}>
              <GuideMark className="h-9 w-9" color="#ff2791" />
            </div>
          </div>
        </div>
      ) : null}

      {subject === "colour" ? (
        <div className="relative grid grid-cols-[1.05fr_0.95fr] gap-2 p-2.5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(75,74,228,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(75,74,228,0.18) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />
          <div className="relative">
            <div className="mb-2 h-1 w-8 bg-black" />
            <p className="font-serif text-lg tracking-wide text-black">Colour</p>
            <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-bs-purple">
              Primary · support
            </p>
            <div className="mt-2.5 flex gap-1">
              <span className="h-5 w-5 bg-bs-purple" />
              <span className="h-5 w-5 bg-bs-pink" />
              <span className="h-5 w-5 bg-bs-yellow" />
              <span className="h-5 w-5 bg-black" />
            </div>
          </div>
          <div className="relative flex flex-col justify-between border border-dashed border-bs-purple/45 bg-bs-offwhite p-2">
            <p className="font-mono text-[7px] uppercase tracking-[0.12em] text-neutral-500">
              Values
            </p>
            <div className="space-y-1">
              <div className="h-2 w-full bg-bs-purple" />
              <div className="h-2 w-[70%] bg-bs-pink" />
              <div className="h-2 w-[46%] bg-bs-yellow" />
            </div>
          </div>
        </div>
      ) : null}

      {subject === "type" ? (
        <div className="grid grid-cols-[1.05fr_0.95fr] gap-2 p-2.5">
          <div>
            <div className="mb-2 h-1 w-8 bg-bs-purple" />
            <p className="font-serif text-xl tracking-tight text-black">Type</p>
            <p className="mt-1 font-mono text-[8px] leading-snug text-neutral-500">
              Serif display. Mono notes.
            </p>
            <div className="mt-2.5 flex flex-col gap-1.5">
              <div className="h-1.5 w-full bg-neutral-800" />
              <div className="h-1 w-[86%] bg-neutral-400" />
              <div className="h-[3px] w-[72%] bg-neutral-300" />
            </div>
          </div>
          <div className="relative flex flex-col items-center justify-center bg-bs-offwhite p-2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-1.5 border border-dashed border-bs-purple/40"
            />
            <p className="font-serif text-3xl leading-none text-bs-purple">Aa</p>
            <p className="mt-1.5 font-mono text-[7px] uppercase tracking-[0.12em] text-bs-purple">
              Approved
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ManualStack({ progress }: { progress: MotionValue<number> }) {
  const p0 = useTransform(progress, [0, 0.28, 0.4], [1, 1, 0]);
  const p1 = useTransform(progress, [0.28, 0.4, 0.55, 0.68], [0, 1, 1, 0]);
  const p2 = useTransform(progress, [0.58, 0.72, 1], [0, 1, 1]);
  const lift = useTransform(progress, [0, 1], [8, 0]);

  return (
    <motion.div className="relative mx-auto aspect-[4/3] w-full max-w-xl" style={{ y: lift }}>
      <ManualPage
        page={SPREADS[0].page}
        title={SPREADS[0].title}
        tabs={[...SPREADS[0].tabs]}
        opacity={p0}
        stacked
      />
      <ManualPage
        page={SPREADS[1].page}
        title={SPREADS[1].title}
        tabs={[...SPREADS[1].tabs]}
        opacity={p1}
        stacked
        accent="pink"
      />
      <ManualPage
        page={SPREADS[2].page}
        title={SPREADS[2].title}
        tabs={[...SPREADS[2].tabs]}
        opacity={p2}
        stacked
        accent="purple"
        active
      />
    </motion.div>
  );
}

function ManualPage({
  page,
  title,
  tabs,
  opacity,
  stacked = false,
  accent = "neutral",
  active = false,
}: {
  page: string;
  title: string;
  tabs: string[];
  opacity?: MotionValue<number>;
  stacked?: boolean;
  accent?: "neutral" | "pink" | "purple";
  active?: boolean;
}) {
  const accentBar =
    accent === "pink"
      ? "bg-bs-pink"
      : accent === "purple"
        ? "bg-bs-purple"
        : "bg-black";

  const content = (
    <div
      className={`flex h-full flex-col border border-black/15 bg-white shadow-[0_18px_40px_rgba(0,0,0,0.06)] ${
        stacked ? "absolute inset-0" : "relative min-h-[16rem] md:min-h-[20rem]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 md:px-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
          Brand manual
        </p>
        <p className="font-mono text-[10px] tracking-[0.14em] text-neutral-400">
          {page} / 48
        </p>
      </div>

      <div className="flex gap-1 border-b border-black/10 px-3 py-2 md:px-4">
        {tabs.map((tab, index) => (
          <span
            key={tab}
            className={`px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] ${
              index === 0
                ? "bg-black text-white"
                : "border border-black/10 text-neutral-500"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1.1fr_0.9fr] gap-4 p-4 md:gap-6 md:p-6">
        <div>
          <div className={`mb-4 h-1 w-10 ${accentBar}`} />
          <p className="font-serif text-2xl tracking-tight text-black md:text-3xl">
            {title}
          </p>
          <p className="mt-3 max-w-[18ch] font-mono text-[11px] leading-relaxed text-neutral-500 md:text-xs">
            Specifications for consistent use across every application.
          </p>
          <div className="mt-5 space-y-2">
            <div className="h-1.5 w-full bg-neutral-200" />
            <div className="h-1.5 w-[86%] bg-neutral-200" />
            <div className="h-1.5 w-[72%] bg-neutral-200" />
          </div>
        </div>
        <div className="flex flex-col justify-between border border-black/8 bg-bs-offwhite p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-400">
            Example
          </p>
          <div className="flex flex-1 items-center justify-center py-4">
            <GuideMark
              className="h-12 w-12 md:h-16 md:w-16"
              color={
                accent === "pink"
                  ? "#ff2791"
                  : accent === "purple"
                    ? "#4b4ae4"
                    : "#111111"
              }
            />
          </div>
          {active && (
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-500">
              Approved
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (opacity) {
    return (
      <motion.div className={stacked ? "absolute inset-0" : undefined} style={{ opacity }}>
        {content}
      </motion.div>
    );
  }

  return content;
}
