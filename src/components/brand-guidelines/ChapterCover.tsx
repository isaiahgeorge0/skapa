"use client";

import { useState } from "react";
import GuideMark from "./GuideMark";

const CHAPTERS = [
  {
    id: "logo",
    title: "Logo",
    body: "Usage, variations, clear space and minimum sizes.",
    page: "02",
    accent: "purple" as const,
  },
  {
    id: "colour",
    title: "Colour",
    body: "Primary and supporting palettes with digital and print values.",
    page: "08",
    accent: "pink" as const,
  },
  {
    id: "typography",
    title: "Typography",
    body: "Typefaces, hierarchy, sizing and application.",
    page: "14",
    accent: "yellow" as const,
  },
  {
    id: "imagery",
    title: "Imagery",
    body: "Photography, illustration and visual direction.",
    page: "22",
    accent: "purple" as const,
  },
  {
    id: "graphic",
    title: "Graphic language",
    body: "Shapes, patterns, layout principles and supporting elements.",
    page: "28",
    accent: "pink" as const,
  },
  {
    id: "voice",
    title: "Tone of voice",
    body: "How the brand sounds as well as how it looks.",
    page: "34",
    accent: "yellow" as const,
  },
  {
    id: "application",
    title: "Application",
    body: "How everything comes together across real touchpoints.",
    page: "40",
    accent: "purple" as const,
  },
] as const;

const ACCENT = {
  purple: {
    bar: "bg-bs-purple",
    plate: "bg-bs-purple",
    plateFg: "text-bs-offwhite",
    selected: "bg-bs-purple text-bs-offwhite",
    muted: "text-bs-offwhite/65",
    hex: "#4b4ae4",
  },
  pink: {
    bar: "bg-bs-pink",
    plate: "bg-bs-pink",
    plateFg: "text-white",
    selected: "bg-bs-pink text-white",
    muted: "text-white/70",
    hex: "#ff2791",
  },
  yellow: {
    bar: "bg-bs-yellow",
    plate: "bg-bs-yellow",
    plateFg: "text-black",
    selected: "bg-bs-yellow text-black",
    muted: "text-black/55",
    hex: "#111111",
  },
} as const;

export default function ChapterCover() {
  const [active, setActive] = useState(0);
  const current = CHAPTERS[active];
  const tone = ACCENT[current.accent];

  return (
    <section
      id="what-they-cover"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-2xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            03 · What they cover
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            One place for the decisions that matter.
          </h2>
        </div>

        {/* Mobile: chapter chips + plate immediately underneath */}
        <div className="mt-12 lg:hidden">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
            Select a chapter →
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CHAPTERS.map((chapter, index) => {
              const selected = index === active;
              const chip = ACCENT[chapter.accent];
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black ${
                    selected
                      ? `${chip.selected} border-transparent`
                      : "border-black/15 bg-white text-neutral-600"
                  }`}
                  aria-current={selected ? "true" : undefined}
                >
                  {chapter.title}
                </button>
              );
            })}
          </div>
          <CoverPlate current={current} tone={tone} compact />
        </div>

        {/* Desktop: contents rail + spread */}
        <div className="mt-12 hidden grid-cols-12 gap-8 lg:grid">
          <nav
            aria-label="Guideline chapters"
            className="col-span-5 border border-black/10 bg-white"
          >
            <div className="flex items-baseline justify-between border-b border-black/10 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                Contents
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                Select a chapter →
              </p>
            </div>
            <ol>
              {CHAPTERS.map((chapter, index) => {
                const selected = index === active;
                const chip = ACCENT[chapter.accent];
                return (
                  <li key={chapter.id} className="border-b border-black/8 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      className={`flex w-full items-baseline justify-between gap-4 px-4 py-3.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black ${
                        selected ? chip.selected : "hover:bg-bs-offwhite"
                      }`}
                      aria-current={selected ? "true" : undefined}
                    >
                      <span className="font-serif text-xl">{chapter.title}</span>
                      <span
                        className={`font-mono text-[10px] tracking-[0.14em] ${
                          selected ? chip.muted : "text-neutral-400"
                        }`}
                      >
                        {chapter.page}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="col-span-7">
            <CoverPlate current={current} tone={tone} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CoverPlate({
  current,
  tone,
  compact = false,
}: {
  current: (typeof CHAPTERS)[number];
  tone: (typeof ACCENT)[keyof typeof ACCENT];
  compact?: boolean;
}) {
  return (
    <div className={`border border-black/10 bg-white ${compact ? "mt-4" : ""}`}>
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
          Chapter {current.page}
        </p>
        <p className="font-mono text-[10px] tracking-[0.14em] text-neutral-400">
          p. {current.page}
        </p>
      </div>
      <div className={`grid gap-6 p-5 sm:grid-cols-2 ${compact ? "sm:p-6" : "md:gap-8 md:p-8"}`}>
        <div>
          <div className={`mb-4 h-1 w-10 ${tone.bar}`} />
          <h3 className="font-serif text-3xl tracking-tight text-black md:text-4xl">
            {current.title}
          </h3>
          <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            {current.body}
          </p>
        </div>
        {current.id === "application" ? (
          <ApplicationSample />
        ) : (
          <div
            className={`flex min-h-[9rem] flex-col justify-between p-5 ${tone.plate} ${tone.plateFg}`}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] opacity-70">
              Sample plate
            </p>
            <div className="flex flex-1 items-center justify-center py-5">
              <PlateVisual id={current.id} accent={current.accent} />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] opacity-70">
              Reference only
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Culmination plate: logo + type + colour + graphic language in one asset. */
function ApplicationSample() {
  return (
    <div className="relative min-h-[14rem] overflow-hidden bg-bs-purple text-bs-offwhite sm:min-h-[16rem]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-full w-[34%] bg-bs-pink" />
        <div className="absolute bottom-0 left-0 h-[18%] w-[55%] bg-bs-yellow" />
        <div className="absolute top-[14%] left-[10%] h-px w-12 bg-bs-offwhite/25" />
        <div className="absolute top-[14%] left-[10%] h-12 w-px bg-bs-offwhite/25" />
      </div>

      <div className="relative z-10 flex h-full min-h-[14rem] flex-col justify-between p-5 sm:min-h-[16rem] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <GuideMark className="h-8 w-8 shrink-0" color="#efeeea" />
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-bs-offwhite/65">
            Campaign · 01
          </p>
        </div>

        <div className="max-w-[16ch] pt-6">
          <p className="font-serif text-2xl leading-[1.05] tracking-tight sm:text-3xl">
            One system. Every touchpoint.
          </p>
          <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-[0.04em] text-bs-offwhite/75">
            Logo, colour, type and voice working as one.
          </p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 bg-bs-offwhite" />
            <span className="h-2.5 w-2.5 bg-bs-yellow" />
            <span className="h-2.5 w-2.5 bg-bs-pink" />
          </div>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-bs-offwhite/55">
            Approved application
          </p>
        </div>
      </div>
    </div>
  );
}

function PlateVisual({
  id,
  accent,
}: {
  id: (typeof CHAPTERS)[number]["id"];
  accent: (typeof CHAPTERS)[number]["accent"];
}) {
  if (id === "colour") {
    return (
      <div className="flex gap-2">
        <span className="h-10 w-10 bg-bs-offwhite" />
        <span className="h-10 w-10 bg-white" />
        <span className="h-10 w-10 bg-black" />
      </div>
    );
  }

  if (id === "typography") {
    return (
      <div className="text-center">
        <p className="font-serif text-4xl">Aa</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] opacity-70">
          Hierarchy
        </p>
      </div>
    );
  }

  if (id === "voice") {
    return (
      <p className="max-w-[14ch] text-center font-serif text-xl italic">
        Clear. Confident. Human.
      </p>
    );
  }

  if (id === "imagery") {
    return (
      <div className="grid w-full max-w-[7rem] grid-cols-2 gap-1.5">
        <span className="aspect-square bg-bs-offwhite/30" />
        <span className="aspect-square bg-bs-offwhite/55" />
        <span className="col-span-2 aspect-[2/1] bg-bs-offwhite/20" />
      </div>
    );
  }

  if (id === "graphic") {
    return (
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 border-2 border-current opacity-80" />
        <span className="absolute inset-3 bg-current opacity-25" />
        <span className="absolute right-0 bottom-0 h-5 w-5 bg-current" />
      </div>
    );
  }

  const markColor =
    accent === "yellow" ? "#111111" : accent === "pink" ? "#ffffff" : "#efeeea";

  return <GuideMark className="h-16 w-16" color={markColor} />;
}
