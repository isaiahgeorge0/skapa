"use client";

import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

function Mark({ className = "" }: { className?: string }) {
  return (
    <div className={`relative bg-black p-[18%] ${className}`}>
      <div className="relative h-full w-full min-h-[1.25rem] min-w-[1.25rem]">
        <div className="absolute inset-0 bg-bs-offwhite" />
        <div className="absolute top-0 right-0 h-1/2 w-1/2 bg-black" />
        <div className="absolute bottom-0 left-0 h-1/3 w-1/3 bg-black" />
      </div>
    </div>
  );
}

function WebsiteApp() {
  return (
    <div className="flex h-full flex-col bg-bs-offwhite">
      <div className="flex items-center gap-2 border-b border-black/10 bg-neutral-100 px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
        <div className="ml-2 flex flex-1 items-center gap-2 rounded-sm bg-white px-2 py-1">
          <span className="h-1 w-1 rounded-full bg-bs-pink" />
          <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-neutral-400">
            skapa.uk
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between border-b border-black/8 bg-white px-4 py-2.5">
        <Mark className="h-6 w-6" />
        <div className="flex gap-3 font-mono text-[7px] uppercase tracking-[0.14em] text-neutral-500">
          <span>Work</span>
          <span>About</span>
          <span className="text-bs-purple">Contact</span>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-12">
        <div className="col-span-7 flex flex-col justify-between p-4 pb-5">
          <p className="font-mono text-[7px] uppercase tracking-[0.18em] text-bs-purple">
            Brand identity
          </p>
          <div>
            <p className="font-serif text-[1.35rem] leading-[1.1] tracking-tight text-black">
              Good design gets attention.
            </p>
            <p className="mt-2 max-w-[18ch] font-mono text-[8px] leading-relaxed text-neutral-500">
              Great design has a reason.
            </p>
            <div className="mt-4 inline-flex bg-black px-2.5 py-1.5 font-mono text-[7px] uppercase tracking-[0.14em] text-bs-offwhite">
              Start a project
            </div>
          </div>
        </div>
        <div className="relative col-span-5 overflow-hidden bg-bs-purple">
          <div className="absolute top-0 right-0 h-1/2 w-3/5 bg-bs-pink" />
          <div className="absolute bottom-0 left-0 h-1/3 w-2/5 bg-bs-yellow" />
        </div>
      </div>
    </div>
  );
}

function SocialApp() {
  return (
    <div className="flex h-full flex-col bg-neutral-200/70 p-3">
      <div className="flex flex-1 flex-col overflow-hidden rounded-sm border border-black/10 bg-black shadow-md">
        <div className="relative flex-1 overflow-hidden bg-bs-pink">
          <div className="absolute top-0 right-0 h-[52%] w-[48%] bg-bs-purple" />
          <div className="absolute bottom-0 left-0 h-[26%] w-[46%] bg-bs-yellow" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2.5">
            <Mark className="h-7 w-7" />
            <span className="font-mono text-[7px] uppercase tracking-[0.16em] text-bs-offwhite/70">
              Campaign
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-[30%] px-4">
            <p className="max-w-[10ch] font-serif text-[1.55rem] leading-[1.05] tracking-tight text-bs-offwhite">
              Clarity has a look.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between bg-white px-3 py-2.5">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-black">
              @skapa
            </p>
            <p className="mt-0.5 font-mono text-[7px] text-neutral-400">
              Brand system · Feed
            </p>
          </div>
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-bs-purple" />
            <span className="h-1.5 w-1.5 rounded-full bg-bs-pink" />
            <span className="h-1.5 w-1.5 rounded-full bg-bs-yellow" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DeckApp() {
  return (
    <div className="relative flex h-full items-center justify-center bg-neutral-300/60 p-4">
      <div
        className="absolute right-7 top-9 h-[56%] w-[70%] rotate-[2.5deg] border border-black/10 bg-bs-purple shadow-sm"
        aria-hidden="true"
      />
      <div
        className="absolute right-5 top-11 h-[56%] w-[70%] rotate-[1.2deg] border border-black/10 bg-white shadow-sm"
        aria-hidden="true"
      >
        <div className="h-full w-full p-3 opacity-40">
          <div className="mb-2 h-4 w-4 bg-black" />
          <div className="mt-6 h-2 w-3/5 bg-neutral-200" />
          <div className="mt-2 h-2 w-2/5 bg-neutral-200" />
        </div>
      </div>
      <div className="relative z-10 flex h-[64%] w-[78%] flex-col border border-black/15 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-black/10 px-3.5 py-2">
          <Mark className="h-5 w-5" />
          <span className="font-mono text-[7px] tracking-[0.14em] text-neutral-400">
            03 / 12
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-between p-3.5">
          <div>
            <p className="font-mono text-[7px] uppercase tracking-[0.16em] text-bs-purple">
              Brand position
            </p>
            <p className="mt-2 font-serif text-[1.15rem] leading-snug tracking-tight text-black">
              Before it looks different, it needs a reason.
            </p>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="flex gap-1.5">
              <span className="h-1.5 w-7 bg-bs-purple" />
              <span className="h-1.5 w-3.5 bg-bs-pink" />
              <span className="h-1.5 w-5 bg-bs-yellow" />
            </div>
            <span className="font-mono text-[6px] uppercase tracking-[0.12em] text-neutral-400">
              Deck
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrintApp() {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-[#c8c4bb] p-3">
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 bg-[#b4aea3]/50"
        aria-hidden="true"
      />
      <div className="relative flex h-[94%] w-[70%] -rotate-[1.5deg] flex-col overflow-hidden bg-bs-offwhite shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
        <div className="relative h-[42%] shrink-0 overflow-hidden bg-bs-purple">
          <div className="absolute bottom-0 right-0 h-[55%] w-[55%] bg-bs-pink" />
          <div className="absolute top-3 left-3">
            <Mark className="h-7 w-7" />
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between p-4">
          <p className="font-serif text-[1.45rem] leading-[1.05] tracking-tight text-black">
            Form.
            <br />
            Voice.
            <br />
            System.
          </p>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-mono text-[7px] uppercase tracking-[0.16em] text-neutral-500">
                Poster
              </p>
              <p className="mt-0.5 font-mono text-[6px] text-neutral-400">
                A2 · uncoated
              </p>
            </div>
            <div className="h-9 w-11 bg-bs-yellow" />
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function SignageApp() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#9a9690]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#a8a49c_0%,#8f8b84_55%,#7a766f_100%)]" />
      <div
        className="absolute inset-y-[12%] left-[8%] w-px bg-black/15"
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-[12%] right-[8%] w-px bg-black/15"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 py-6">
        <div className="w-full border border-black/25 bg-black px-4 py-5 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-3">
            <Mark className="h-9 w-9 shrink-0" />
            <div className="min-w-0 text-right">
              <p className="font-serif text-[1.65rem] leading-none tracking-tight text-bs-offwhite">
                skapa
              </p>
              <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.2em] text-bs-offwhite/50">
                Creative
              </p>
            </div>
          </div>
          <div className="mt-5 flex gap-1.5">
            <span className="h-1 flex-1 bg-bs-purple" />
            <span className="h-1 w-7 bg-bs-pink" />
            <span className="h-1 w-4 bg-bs-yellow" />
          </div>
        </div>
        <p className="mt-4 text-center font-mono text-[7px] uppercase tracking-[0.16em] text-black/45">
          Fascia · environmental
        </p>
      </div>
    </div>
  );
}

const APPS = [
  {
    id: "website",
    label: "Website",
    note: "Same system. Digital structure.",
    Visual: WebsiteApp,
  },
  {
    id: "social",
    label: "Social",
    note: "Cropped, fast, still recognisable.",
    Visual: SocialApp,
  },
  {
    id: "deck",
    label: "Presentation",
    note: "Clarity under commercial pressure.",
    Visual: DeckApp,
  },
  {
    id: "print",
    label: "Print",
    note: "Touch, scale, restraint.",
    Visual: PrintApp,
  },
  {
    id: "signage",
    label: "Signage",
    note: "Distance. Instant read.",
    Visual: SignageApp,
  },
] as const;

function AppCard({
  app,
  index,
}: {
  app: (typeof APPS)[number];
  index: number;
}) {
  const Visual = app.Visual;
  return (
    <article className="flex h-full w-[78vw] max-w-sm shrink-0 flex-col border border-black/10 bg-white md:w-[22rem]">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Visual />
      </div>
      <div className="border-t border-black/10 px-4 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-serif text-xl tracking-tight text-black">
            {app.label}
          </p>
          <span className="font-mono text-[9px] tracking-[0.14em] text-neutral-400">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-1 font-mono text-[11px] leading-relaxed text-neutral-500">
          {app.note}
        </p>
      </div>
    </article>
  );
}

function useMediaMd() {
  const [isMd, setIsMd] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsMd(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isMd;
}

export default function ChapterRecognisable() {
  const { reducedMotion } = useReducedMotion();
  const isMd = useMediaMd();
  const trackRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const travelMV = useMotionValue(0);
  const [trackVh, setTrackVh] = useState(480);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Manual progress for mobile: useScroll was not advancing on the sticky track.
  const mobileProgress = useMotionValue(0);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      if (window.matchMedia("(min-width: 768px)").matches) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      const scrolled = Math.min(total, Math.max(0, -rect.top));
      mobileProgress.set(scrolled / total);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [mobileProgress, isMd]);

  // Desktop: approved percentage travel (unchanged).
  const xDesktop = useTransform(scrollYProgress, [0.1, 0.9], ["8%", "-72%"]);

  // Mobile: pixel travel from measured strip overflow.
  const xMobile = useTransform([mobileProgress, travelMV], ([v, travel]) => {
    const start = 16;
    const end = -Math.max(Number(travel) || 0, 0);
    const t = Math.min(1, Math.max(0, (Number(v) - 0.02) / 0.93));
    return start + (end - start) * t;
  });

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const measure = () => {
      if (window.matchMedia("(min-width: 768px)").matches) return;
      const overflow = Math.max(0, strip.scrollWidth - window.innerWidth);
      travelMV.set(overflow);
      const vh = window.innerHeight || 700;
      const needed = Math.ceil((overflow / vh) * 100) + 260;
      setTrackVh(Math.max(480, Math.min(980, needed)));
    };

    measure();
    requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [isMd, reducedMotion, travelMV]);

  if (reducedMotion) {
    return (
      <section
        id="make-it-recognisable"
        className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            06 · Make it recognisable
          </p>
          <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Different contexts. Same identity.
          </h2>
          <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            A finished identity should still feel like itself on a website,
            social post, presentation, print piece or sign, without forcing
            every application to look identical.
          </p>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {APPS.map((app, index) => (
              <AppCard key={app.id} app={app} index={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="make-it-recognisable"
      className="relative scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 pt-chapter-safe pb-4 md:px-10 md:pt-28 md:pb-0 lg:pr-24">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          06 · Make it recognisable
        </p>
        <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
          Different contexts. Same identity.
        </h2>
        <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
          The payoff: a system that can move across applications and still be
          read as one brand.
        </p>
      </div>

      <div
        ref={trackRef}
        className="relative mt-10 md:mt-16 md:h-[300vh]"
        style={isMd ? undefined : { height: `${trackVh}vh` }}
      >
        <div className="sticky top-[calc(var(--skapa-site-chrome-height)+var(--skapa-chapter-pill-clearance)+0.25rem)] overflow-hidden py-3 md:top-[14vh] md:py-4">
          <motion.div
            ref={stripRef}
            style={{ x: isMd ? xDesktop : xMobile }}
            className="flex w-max gap-5 px-6 will-change-transform md:gap-6 md:px-10"
          >
            {APPS.map((app, index) => (
              <AppCard key={app.id} app={app} index={index} />
            ))}
            <div className="flex w-[70vw] max-w-xs shrink-0 flex-col justify-end border border-black/10 bg-black p-6 text-bs-offwhite md:w-[20rem]">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bs-offwhite/60">
                System complete
              </p>
              <p className="mt-4 font-serif text-3xl leading-snug">
                Logo. Type. Colour. Language. Application.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-8 pb-20 md:px-10 md:pt-10 md:pb-28 lg:pr-24">
        <p className="max-w-xl font-mono text-sm leading-relaxed text-neutral-500">
          Application studies: browser-built representations of the same
          identity across real mediums.
        </p>
      </div>
    </section>
  );
}
