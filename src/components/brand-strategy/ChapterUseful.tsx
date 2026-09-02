"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

const SLIDES = [
  { number: "01", title: "Positioning", treatment: "purple-hero", note: "Ownable space" },
  { number: "02", title: "Audience", treatment: "diagram", note: "Who it must matter to" },
  { number: "03", title: "Differentiation", treatment: "isolate", note: "Credible reason to choose" },
  { number: "04", title: "Value proposition", treatment: "yellow", note: "What is at stake" },
  { number: "05", title: "Personality", treatment: "pink-type", note: "How it behaves" },
  { number: "06", title: "Messaging", treatment: "hierarchy", note: "Order of meaning" },
  { number: "07", title: "Tone of voice", treatment: "editorial", note: "How it sounds" },
  { number: "08", title: "Creative direction", treatment: "grid", note: "How it looks" },
] as const;

function SlideFace({ slide }: { slide: (typeof SLIDES)[number] }) {
  if (slide.treatment === "purple-hero") {
    return (
      <div className="flex h-full flex-col justify-between bg-bs-purple p-6 text-bs-offwhite md:p-8">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] tracking-[0.18em]">{slide.number}</span>
          <span className="font-mono text-[10px] tracking-[0.14em] text-bs-offwhite/70">
            skapa
          </span>
        </div>
        <div>
          <p className="font-serif text-4xl leading-none md:text-5xl">{slide.title}</p>
          <div className="mt-8 grid grid-cols-3 gap-px bg-bs-offwhite/25">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square ${i === 4 ? "bg-bs-pink" : "bg-bs-purple"}`}
              />
            ))}
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-bs-offwhite/70">
            {slide.note}
          </p>
        </div>
      </div>
    );
  }

  if (slide.treatment === "diagram") {
    return (
      <div className="flex h-full flex-col bg-bs-offwhite p-6 md:p-8">
        <div className="flex items-baseline justify-between text-neutral-500">
          <span className="font-mono text-[10px] tracking-[0.18em]">{slide.number}</span>
          <span className="font-mono text-[10px] tracking-[0.14em]">skapa</span>
        </div>
        <p className="mt-8 font-serif text-3xl text-black md:text-4xl">{slide.title}</p>
        <div className="relative mt-auto flex h-32 items-center justify-center">
          <div className="absolute h-28 w-28 rounded-full border-2 border-bs-purple" />
          <div className="absolute h-16 w-16 rounded-full bg-bs-purple" />
          <div className="relative h-5 w-5 rounded-full bg-bs-offwhite" />
          <span className="absolute top-2 right-8 font-mono text-[9px] tracking-[0.14em] text-bs-pink">
            core
          </span>
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
          {slide.note}
        </p>
      </div>
    );
  }

  if (slide.treatment === "isolate") {
    return (
      <div className="flex h-full flex-col bg-bs-pink p-6 text-white md:p-8">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] tracking-[0.18em]">{slide.number}</span>
          <span className="font-mono text-[10px] tracking-[0.14em] text-white/70">
            skapa
          </span>
        </div>
        <p className="mt-8 font-serif text-3xl md:text-4xl">{slide.title}</p>
        <div className="mt-auto flex items-end gap-2">
          {[0.45, 0.45, 0.45, 1, 0.45].map((h, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                height: `${h * 88}px`,
                background: h === 1 ? "#efeeea" : "rgba(0,0,0,0.18)",
              }}
            />
          ))}
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/75">
          {slide.note}
        </p>
      </div>
    );
  }

  if (slide.treatment === "yellow") {
    return (
      <div className="flex h-full flex-col justify-between bg-bs-yellow p-6 text-black md:p-8">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] tracking-[0.18em]">{slide.number}</span>
          <span className="font-mono text-[10px] tracking-[0.14em]">skapa</span>
        </div>
        <div>
          <p className="font-serif text-4xl leading-none md:text-5xl">{slide.title}</p>
          <div className="mt-6 h-px w-16 bg-bs-purple" />
          <p className="mt-4 max-w-[16ch] font-mono text-xs leading-relaxed">
            The promise that makes the offer matter.
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em]">{slide.note}</p>
      </div>
    );
  }

  if (slide.treatment === "pink-type") {
    return (
      <div className="relative flex h-full overflow-hidden bg-white p-6 md:p-8">
        <div className="relative z-10 flex w-full flex-col justify-between">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] tracking-[0.18em] text-bs-pink">
              {slide.number}
            </span>
            <span className="font-mono text-[10px] tracking-[0.14em] text-neutral-400">
              skapa
            </span>
          </div>
          <p className="font-serif text-5xl italic leading-[0.95] text-bs-pink md:text-6xl">
            {slide.title}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
            {slide.note}
          </p>
        </div>
      </div>
    );
  }

  if (slide.treatment === "hierarchy") {
    return (
      <div className="flex h-full flex-col bg-bs-offwhite p-6 md:p-8">
        <div className="flex items-baseline justify-between text-neutral-500">
          <span className="font-mono text-[10px] tracking-[0.18em]">{slide.number}</span>
          <span className="font-mono text-[10px] tracking-[0.14em]">skapa</span>
        </div>
        <p className="mt-6 font-serif text-3xl text-black">{slide.title}</p>
        <div className="mt-auto space-y-3">
          <p className="font-serif text-sm text-black/25 line-through">Everything at once</p>
          <p className="font-serif text-lg text-black/40">Supporting detail</p>
          <p className="font-serif text-3xl text-bs-purple">What matters</p>
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
          {slide.note}
        </p>
      </div>
    );
  }

  if (slide.treatment === "editorial") {
    return (
      <div className="flex h-full flex-col bg-white p-6 md:p-8">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] tracking-[0.18em] text-bs-pink">
            {slide.number}
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] text-neutral-400">
            skapa
          </span>
        </div>
        <div className="mt-8 h-px w-12 bg-bs-pink" />
        <p className="mt-4 font-serif text-3xl text-black md:text-4xl">{slide.title}</p>
        <div className="mt-8 space-y-2">
          <p className="font-serif text-2xl text-black">Clear.</p>
          <p className="font-serif text-2xl italic text-neutral-500">Human.</p>
          <p className="font-serif text-2xl text-bs-pink">Distinct.</p>
        </div>
        <p className="mt-auto font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
          {slide.note}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-bs-purple p-6 text-bs-offwhite md:p-8">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-[0.18em]">{slide.number}</span>
        <span className="font-mono text-[10px] tracking-[0.14em] text-bs-offwhite/70">
          skapa
        </span>
      </div>
      <p className="mt-8 font-serif text-3xl md:text-4xl">{slide.title}</p>
      <div className="mt-auto grid grid-cols-2 gap-2">
        {["Colour", "Type", "Image", "Form"].map((item) => (
          <div
            key={item}
            className="border border-bs-offwhite/35 px-3 py-4 font-mono text-[10px] uppercase tracking-[0.14em]"
          >
            {item}
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-bs-offwhite/70">
        {slide.note}
      </p>
    </div>
  );
}

function FlipPage({
  slide,
  index,
  progress,
}: {
  slide: (typeof SLIDES)[number];
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  // Keep the whole sequence inside the sticky track:
  // brief lead-in before card 1, readable hold after the final card.
  const INTRO = 0.1;
  const OUTRO = 0.14;
  const usable = 1 - INTRO - OUTRO;
  const slice = usable / SLIDES.length;
  const start = INTRO + index * slice;
  const mid = start + slice * 0.42;
  const holdEnd = start + slice * 0.9;
  const end = start + slice;
  const isLast = index === SLIDES.length - 1;

  const opacity = useTransform(
    progress,
    isLast
      ? [start, mid, 1]
      : [start, mid, holdEnd, Math.min(1, end + slice * 0.2)],
    isLast ? [0, 1, 1] : [0, 1, 1, 0.9],
  );
  const y = useTransform(
    progress,
    [start, mid, holdEnd],
    [48, 0, index * 7],
  );
  const x = useTransform(progress, [start, mid], [index % 2 === 0 ? -18 : 18, 0]);
  const rotate = useTransform(
    progress,
    [start, mid, holdEnd],
    [index % 2 === 0 ? -3 : 3, 0, isLast ? 0 : -0.4],
  );
  const scale = useTransform(progress, [start, mid], [0.96, 1]);
  const zIndex = useTransform(progress, (v) => {
    if (v < start) return index;
    if (v < end) return 20 + index;
    return isLast ? 30 : index;
  });

  return (
    <motion.article
      style={{ opacity, y, x, rotate, scale, zIndex }}
      className="absolute inset-x-0 top-0 mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.14)]"
    >
      <SlideFace slide={slide} />
    </motion.article>
  );
}

function FlipDeck({
  progress,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  return (
    <div className="relative mx-auto h-[520px] w-full max-w-md md:h-[600px]">
      {SLIDES.map((slide, index) => (
        <FlipPage
          key={slide.number}
          slide={slide}
          index={index}
          progress={progress}
        />
      ))}
    </div>
  );
}

export default function ChapterUseful() {
  const { reducedMotion } = useReducedMotion();
  const deckRef = useRef<HTMLDivElement>(null);
  const creativeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: deckRef,
    // Align progress 0 with sticky engagement (~10–12vh), progress 1 with
    // track release — keeps the sequence inside the visible deck section.
    offset: ["start 0.1", "end end"],
  });
  const { scrollYProgress: creativeProgress } = useScroll({
    target: creativeRef,
    offset: ["start 0.85", "start 0.28"],
  });

  const strategyOpacity = useTransform(creativeProgress, [0, 0.45, 0.7], [1, 0.55, 0.15]);
  const strategyY = useTransform(creativeProgress, [0, 0.7], [0, -12]);
  const visualOpacity = useTransform(creativeProgress, [0.35, 0.65, 1], [0, 0.7, 1]);
  const visualY = useTransform(creativeProgress, [0.35, 0.75], [16, 0]);
  const imageReveal = useTransform(creativeProgress, [0.4, 0.85], [0.9, 1]);
  const imageScale = useTransform(creativeProgress, [0.4, 0.85], [1.06, 1]);

  return (
    <section
      id="make-it-useful"
      className="scroll-mt-chapter lg:scroll-mt-0 border-t border-black/5 bg-bs-offwhite"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          04 · Make it useful
        </p>
        <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
          Strategy shouldn’t disappear into a presentation.
        </h2>
        <p className="mt-5 max-w-2xl font-serif text-2xl italic leading-snug text-neutral-600 md:text-3xl">
          It should become something your business can actually use.
        </p>

        <figure className="group relative mt-16 overflow-hidden md:mt-20">
          <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-[21/9]">
            <Image
              src="/images/brand-strategy-architectural-order.avif"
              alt="Curved architectural forms creating a sense of order and structure"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="100vw"
            />
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1.5 bg-bs-pink opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            <div
              aria-hidden="true"
              className="absolute top-4 right-4 bg-black px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white"
            >
              04.1 · Order
            </div>
          </div>
          <figcaption className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <p className="font-serif text-3xl italic text-black md:text-4xl">
              Clarity before creativity.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
              Structure first
            </p>
          </figcaption>
        </figure>

        {reducedMotion ? (
          <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SLIDES.map((slide) => (
              <div key={slide.number} className="aspect-[3/4] overflow-hidden shadow-sm">
                <SlideFace slide={slide} />
              </div>
            ))}
          </div>
        ) : (
          <div ref={deckRef} className="mt-20 md:mt-24">
            {/*
              Mobile track is longer so each card gets more physical scroll
              presence; desktop pacing stays as-is.
            */}
            <div className="relative h-[265vh] md:h-[190vh]">
              <div className="sticky top-[10vh] md:top-[12vh]">
                <FlipDeck progress={scrollYProgress} />
              </div>
            </div>
          </div>
        )}

        {/*
          Layout spacing after the sticky interaction releases — not an
          extension of the scroll track (avoids empty sticky dead space).
        */}
        <p className="mt-24 max-w-xl font-mono text-sm leading-relaxed text-neutral-500 md:mt-10">
          Deliverables vary depending on the scope and needs of each project.
        </p>

        {/* Intentional hard mask into off-white, not soft asset fade */}
        <div className="relative mt-20 h-44 overflow-hidden md:mt-20 md:h-56">
          <Image
            src="/images/brand-strategy-architectural-light.avif"
            alt=""
            fill
            className="object-cover object-[center_40%]"
            sizes="100vw"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-[42%] bg-bs-offwhite"
            style={{
              clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 100%)",
            }}
          />
        </div>

        <div
          ref={creativeRef}
          className="mt-16 grid items-center gap-12 md:mt-20 md:grid-cols-12 md:gap-10"
        >
          <div className="md:col-span-5">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Strategy → creative direction
            </p>
            <h3 className="font-serif text-3xl leading-snug text-black md:text-4xl">
              Strategy gives creativity something to respond to.
            </h3>

            <motion.ul
              style={
                reducedMotion
                  ? undefined
                  : { opacity: strategyOpacity, y: strategyY }
              }
              className="mt-8 space-y-2"
            >
              {["Positioning", "Personality", "Message", "Direction"].map(
                (word) => (
                  <li
                    key={word}
                    className="font-serif text-2xl text-neutral-500 md:text-3xl"
                  >
                    {word}
                  </li>
                ),
              )}
            </motion.ul>

            <motion.ul
              style={
                reducedMotion
                  ? undefined
                  : { opacity: visualOpacity, y: visualY }
              }
              className="mt-8 space-y-2"
            >
              {["Colour", "Type", "Image", "Form"].map((word, i) => (
                <li
                  key={word}
                  className="font-serif text-2xl md:text-3xl"
                  style={{ color: ["#4b4ae4", "#ff2791", "#111111", "#111111"][i] }}
                >
                  {word}
                </li>
              ))}
            </motion.ul>

            <p className="mt-10 font-mono text-xs uppercase tracking-[0.14em] text-neutral-400">
              Explore Brand Identity →
              <span className="sr-only"> (page coming soon)</span>
            </p>
          </div>

          <div className="md:col-span-7">
            <motion.div
              style={
                reducedMotion
                  ? undefined
                  : { scale: imageScale, opacity: imageReveal }
              }
              className="group relative aspect-[3/2] overflow-hidden bg-neutral-200"
            >
              <Image
                src="/images/brand-strategy-creative-direction.jpg"
                alt="Physical brand materials and typography samples arranged on a surface"
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-1 w-0 bg-bs-purple transition-[width] duration-500 group-hover:w-full"
              />
              <div
                aria-hidden="true"
                className="absolute top-4 left-4 bg-black px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white"
              >
                04.2 · Materials
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
