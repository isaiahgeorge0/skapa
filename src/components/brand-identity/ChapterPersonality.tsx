"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

function useIsMd() {
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

export default function ChapterPersonality() {
  const { reducedMotion } = useReducedMotion();
  const isMd = useIsMd();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const purpleY = useTransform(scrollYProgress, [0.15, 0.4, 0.85], ["110%", "0%", "-8%"]);
  const pinkX = useTransform(scrollYProgress, [0.28, 0.5, 0.9], ["110%", "0%", "4%"]);
  const yellowYDesktop = useTransform(
    scrollYProgress,
    [0.55, 0.72, 1],
    ["110%", "0%", "0%"],
  );
  // Mobile: yellow arrives later as a small corner so light body copy never
  // sits on the pale field at any intermediate state.
  const yellowYMobile = useTransform(
    scrollYProgress,
    [0.58, 0.76, 1],
    ["110%", "0%", "0%"],
  );
  const yellowY = isMd ? yellowYDesktop : yellowYMobile;
  const monoFade = useTransform(scrollYProgress, [0, 0.2, 0.45], [1, 1, 0.25]);
  const noteOp = useTransform(scrollYProgress, [0.5, 0.65], [0, 1]);
  const copyOp = useTransform(scrollYProgress, [0.52, 0.66, 1], [0, 1, 1]);
  const headColorDesktop = useTransform(
    scrollYProgress,
    [0.18, 0.28, 0.32],
    ["#111111", "#111111", "#efeeea"],
  );
  // Mobile: flip only after taller purple has covered the heading band.
  const headColorMobile = useTransform(
    scrollYProgress,
    [0.34, 0.42, 0.48],
    ["#111111", "#111111", "#efeeea"],
  );
  const headColor = isMd ? headColorDesktop : headColorMobile;
  const eyebrowColorDesktop = useTransform(
    scrollYProgress,
    [0.18, 0.28, 0.32],
    ["#525252", "#525252", "rgba(239,238,234,0.75)"],
  );
  const eyebrowColorMobile = useTransform(
    scrollYProgress,
    [0.34, 0.42, 0.48],
    ["#525252", "#525252", "rgba(239,238,234,0.75)"],
  );
  const eyebrowColor = isMd ? eyebrowColorDesktop : eyebrowColorMobile;

  if (reducedMotion) {
    return (
      <section
        id="give-it-personality"
        className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            04 · Give it personality
          </p>
          <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Colour isn&apos;t decoration. It changes how a brand feels.
          </h2>
          <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            Early notes become a palette with relationships, not a random set
            of swatches. Colour gives the system emotional range.
          </p>
          <div className="mt-14 grid grid-cols-3 gap-3 md:gap-4">
            <div className="aspect-[3/4] bg-bs-purple" />
            <div className="aspect-[3/4] bg-bs-pink" />
            <div className="aspect-[3/4] bg-bs-yellow" />
          </div>
          <ul className="mt-8 flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-600">
            <li>#4b4ae4</li>
            <li>#ff2791</li>
            <li>#fff1a7</li>
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section
      id="give-it-personality"
      className="relative z-10 scroll-mt-chapter border-t border-black/5 lg:scroll-mt-0"
    >
      <div ref={trackRef} className="relative h-[260vh] md:h-[270vh]">
        <div className="sticky top-0 isolate h-[100svh] overflow-hidden bg-[#e4e3df]">
          <motion.div
            style={{ opacity: monoFade }}
            className="absolute inset-0"
            aria-hidden="true"
          >
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </motion.div>

          <motion.div
            style={{ y: purpleY }}
            className="absolute inset-x-0 bottom-0 h-[90%] bg-bs-purple md:h-[78%]"
            aria-hidden="true"
          />
          <motion.div
            style={{ x: pinkX }}
            className="absolute top-0 right-0 h-[36%] w-[34%] bg-bs-pink md:h-[48%] md:w-[36%]"
            aria-hidden="true"
          />
          <motion.div
            style={{ y: yellowY }}
            className="absolute bottom-0 left-0 h-[11%] w-[30%] bg-bs-yellow md:h-[28%] md:w-[34%]"
            aria-hidden="true"
          />
          <motion.p
            style={{ opacity: copyOp }}
            className="pointer-events-none absolute bottom-3 left-3 z-20 font-mono text-[10px] uppercase tracking-[0.18em] text-black md:bottom-8 md:left-10"
            aria-hidden="true"
          >
            #fff1a7
          </motion.p>

          <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col px-6 pt-chapter-safe pb-8 md:px-10 md:py-20 lg:pr-24">
            <div className="relative max-w-3xl">
              <motion.p
                style={{ color: eyebrowColor }}
                className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] md:mb-5"
              >
                04 · Give it personality
              </motion.p>
              <motion.h2
                style={{ color: headColor }}
                className="font-serif text-[1.85rem] leading-snug tracking-tight md:text-5xl"
              >
                Then colour arrives, and the system starts feeling like
                something.
              </motion.h2>
            </div>

            {/*
              Body stays in the purple band, above the yellow corner and
              right of its footprint. Light foreground only on purple.
            */}
            <motion.div
              style={{ opacity: copyOp }}
              className="mt-auto mb-[30%] max-w-[17rem] self-end md:mb-[14%] md:ml-auto md:mr-[8%] md:max-w-lg"
            >
              <motion.p
                style={{ opacity: noteOp }}
                className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-bs-offwhite/80 md:mb-4"
              >
                That early note · #4b4ae4 · kept
              </motion.p>
              <p className="font-serif text-[1.45rem] leading-snug text-bs-offwhite md:text-3xl">
                Colour isn&apos;t decoration. It changes how a brand feels.
              </p>
              <p className="mt-3 font-mono text-[13px] leading-relaxed text-bs-offwhite/85 md:mt-4 md:text-sm">
                Purple, pink and pale yellow aren&apos;t applied as a finish.
                They become part of how the identity behaves across space,
                type and application.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
