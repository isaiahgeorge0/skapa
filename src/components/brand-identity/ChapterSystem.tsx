"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "./useReducedMotion";

const SYSTEM = [
  {
    id: "logo",
    title: "Logo",
    body: "A recognisable mark with clear construction: strong alone, stronger inside the system.",
  },
  {
    id: "typography",
    title: "Typography",
    body: "Editorial serif for expression. Mono for structure. Hierarchy that stays consistent under pressure.",
  },
  {
    id: "colour",
    title: "Colour",
    body: "A palette with relationships: high-energy accents against calm off-white ground.",
  },
  {
    id: "imagery",
    title: "Imagery",
    body: "Art direction that feels intentional: crop, contrast, geometry and negative space.",
  },
  {
    id: "graphic",
    title: "Graphic language",
    body: "Rules, planes and simple forms that can reappear without becoming noise.",
  },
  {
    id: "motion",
    title: "Motion",
    body: "Where movement helps (wipe, reveal, assemble), not animation for its own sake.",
  },
] as const;

function SystemVisual({ id }: { id: (typeof SYSTEM)[number]["id"] }) {
  if (id === "logo") {
    return (
      <div className="flex h-full items-center justify-center bg-black p-10">
        <div className="relative h-28 w-28 md:h-36 md:w-36">
          <div className="absolute inset-0 bg-bs-offwhite" />
          <div className="absolute top-0 right-0 h-1/2 w-1/2 bg-black" />
          <div className="absolute bottom-0 left-0 h-1/3 w-1/3 bg-black" />
        </div>
      </div>
    );
  }
  if (id === "typography") {
    return (
      <div className="flex h-full flex-col justify-between bg-white p-8 md:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
          Hierarchy
        </p>
        <div>
          <p className="font-serif text-4xl tracking-tight text-black md:text-5xl">
            Display
          </p>
          <p className="mt-3 font-mono text-sm text-neutral-600">
            Annotation / control
          </p>
        </div>
        <div className="h-px w-16 bg-bs-purple" />
      </div>
    );
  }
  if (id === "colour") {
    return (
      <div className="grid h-full grid-cols-3">
        <div className="bg-bs-purple" />
        <div className="bg-bs-pink" />
        <div className="bg-bs-yellow" />
      </div>
    );
  }
  if (id === "imagery") {
    return (
      <div className="relative h-full overflow-hidden bg-neutral-200">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-300 via-bs-offwhite to-neutral-400" />
        <div className="absolute inset-y-0 left-0 w-1.5 bg-bs-pink" />
        <div className="absolute top-4 right-4 bg-black px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white">
          Crop · contrast
        </div>
      </div>
    );
  }
  if (id === "graphic") {
    return (
      <div className="relative flex h-full items-end bg-bs-offwhite p-8">
        <div className="absolute top-8 left-8 h-24 w-[40%] bg-bs-purple" />
        <div className="absolute top-16 right-10 h-16 w-16 bg-bs-pink" />
        <div className="absolute right-[30%] bottom-24 h-px w-32 bg-black/30" />
        <p className="relative font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
          Planes · rules · repeat
        </p>
      </div>
    );
  }
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-black">
      <motion.div
        className="absolute inset-y-0 left-0 w-1/3 bg-bs-pink"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }}
        style={{ originX: 0 }}
      />
      <p className="relative font-mono text-[11px] uppercase tracking-[0.18em] text-bs-offwhite">
        Reveal · assemble
      </p>
    </div>
  );
}

function TravelPanel({
  index,
  progress,
  children,
  leadReady = false,
}: {
  index: number;
  progress: MotionValue<number>;
  children: ReactNode;
  /** When true, the first panel starts already settled in the window. */
  leadReady?: boolean;
}) {
  const n = SYSTEM.length;
  const slice = 1 / n;
  const start = index * slice;
  const enter = start;
  const hold = start + slice * 0.35;
  const leave = start + slice * 0.75;
  const end = Math.min(1, start + slice * 1.05);
  const ready = leadReady && index === 0;

  const y = useTransform(
    progress,
    [enter, hold, leave, end],
    ready ? ["0%", "0%", "0%", "-115%"] : ["110%", "0%", "0%", "-115%"],
  );
  const opacity = useTransform(
    progress,
    [enter, hold, leave, Math.min(1, end)],
    ready ? [1, 1, 1, 0.2] : [0.35, 1, 1, 0.2],
  );

  return (
    <motion.div
      style={{ y, opacity }}
      className="absolute inset-0 border border-black/10 bg-white shadow-sm will-change-transform"
    >
      {children}
    </motion.div>
  );
}

function useSystemActive(progress: MotionValue<number>) {
  const [active, setActive] = useState(0);
  useMotionValueEvent(progress, "change", (v) => {
    const n = SYSTEM.length;
    const slice = 1 / n;
    const idx = Math.min(
      n - 1,
      Math.max(0, Math.floor((v + slice * 0.2) / slice)),
    );
    setActive(idx);
  });
  return active;
}

/** Window-scroll progress through a track element (reliable on mobile sticky). */
function useTrackProgress() {
  const progress = useMotionValue(0);
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!node) return;

    const update = () => {
      const rect = node.getBoundingClientRect();
      const total = Math.max(1, node.offsetHeight - window.innerHeight);
      const scrolled = Math.min(total, Math.max(0, -rect.top));
      progress.set(scrolled / total);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [node, progress]);

  return { progress, trackRef: setNode };
}

function SystemInfo({
  active,
  compact = false,
}: {
  active: number;
  compact?: boolean;
}) {
  const current = SYSTEM[active] ?? SYSTEM[0];
  return (
    <>
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-bs-purple">
          {String(active + 1).padStart(2, "0")} / {SYSTEM.length}
        </p>
        <h2
          className={`mt-2 font-serif leading-snug tracking-tight text-black ${
            compact ? "text-[1.75rem]" : "mt-3 text-4xl lg:text-5xl"
          }`}
        >
          {current.title}
        </h2>
        <p
          className={`mt-2 font-mono text-sm leading-relaxed text-neutral-600 ${
            compact ? "line-clamp-3 max-w-none" : "mt-5 max-w-sm"
          }`}
        >
          {current.body}
        </p>
      </motion.div>
      {!compact && (
        <ol className="mt-10 space-y-2">
          {SYSTEM.map((item, index) => (
            <li
              key={item.id}
              className={`font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 ${
                index === active ? "text-black" : "text-neutral-400"
              }`}
            >
              {item.title}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

export default function ChapterSystem() {
  const { reducedMotion } = useReducedMotion();
  const desktopTrackRef = useRef<HTMLDivElement>(null);
  const { progress: mobileProgress, trackRef: mobileTrackRef } = useTrackProgress();

  const { scrollYProgress: desktopProgress } = useScroll({
    target: desktopTrackRef,
    offset: ["start start", "end end"],
  });

  const desktopActive = useSystemActive(desktopProgress);
  const mobileActive = useSystemActive(mobileProgress);

  if (reducedMotion) {
    return (
      <section
        id="make-it-a-system"
        className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            05 · Make it a system
          </p>
          <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Individual ingredients become powerful when they belong together.
          </h2>
          <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            Brand identity is the relationship between logo, type, colour,
            imagery, graphic language and motion, not any one element in
            isolation.
          </p>
          <div className="mt-14 space-y-12">
            {SYSTEM.map((item) => (
              <article key={item.id} className="grid gap-6 md:grid-cols-2 md:gap-10">
                <div>
                  <h3 className="font-serif text-2xl text-black md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 font-mono text-sm leading-relaxed text-neutral-600">
                    {item.body}
                  </p>
                </div>
                <div className="min-h-[280px] overflow-hidden border border-black/10">
                  <SystemVisual id={item.id} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="make-it-a-system"
      className="relative scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      {/* Desktop: pinned left + vertical traveling window on right (approved) */}
      <div ref={desktopTrackRef} className="relative hidden md:block">
        <div className="relative h-[620vh]">
          <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
            <div className="mx-auto grid w-full max-w-6xl grid-cols-12 gap-10 px-6 md:px-10 lg:pr-24">
              <div className="col-span-5 flex flex-col justify-center">
                <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                  05 · Make it a system
                </p>
                <SystemInfo active={desktopActive} />
              </div>

              <div className="col-span-7">
                <div className="relative aspect-[5/4] w-full overflow-hidden lg:aspect-[4/3]">
                  {SYSTEM.map((item, index) => (
                    <TravelPanel
                      key={item.id}
                      index={index}
                      progress={desktopProgress}
                    >
                      <SystemVisual id={item.id} />
                    </TravelPanel>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*
        Mobile: same narrative, stacked composition.
        Pinned info above; diagrams travel through a lower viewing window.
      */}
      <div className="relative md:hidden">
        <div ref={mobileTrackRef} className="relative h-[780vh]">
          <div className="sticky top-0 isolate flex h-[100svh] flex-col overflow-hidden bg-bs-offwhite pt-chapter-safe">
            <div className="shrink-0 px-6 pb-3">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                05 · Make it a system
              </p>
              <SystemInfo active={mobileActive} compact />
              <ol className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                {SYSTEM.map((item, index) => (
                  <li
                    key={item.id}
                    className={`font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300 ${
                      index === mobileActive ? "text-black" : "text-neutral-400"
                    }`}
                  >
                    {item.title}
                  </li>
                ))}
              </ol>
            </div>

            <div className="relative min-h-0 flex-1 px-6 pb-6">
              <div className="relative h-full min-h-[220px] overflow-hidden rounded-sm">
                {SYSTEM.map((item, index) => (
                  <TravelPanel
                    key={item.id}
                    index={index}
                    progress={mobileProgress}
                    leadReady
                  >
                    <SystemVisual id={item.id} />
                  </TravelPanel>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-6 md:px-10 lg:pr-24">
        <p className="max-w-2xl font-mono text-sm leading-relaxed text-neutral-500">
          Brand identity is the connected system, not a logo dropped onto
          whatever comes next.
        </p>
      </div>
    </section>
  );
}
