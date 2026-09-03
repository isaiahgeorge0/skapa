"use client";

import { useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

type Study = {
  id: string;
  label: string;
  approach: string;
  render: (active: boolean) => React.ReactNode;
};

const STUDIES: Study[] = [
  {
    id: "geometric",
    label: "01",
    approach: "Geometric",
    render: (active) => (
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
        <circle
          cx="40"
          cy="40"
          r="28"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 3.5 : 2}
        />
        <rect x="34" y="22" width="12" height="36" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "typographic",
    label: "02",
    approach: "Typographic",
    render: () => (
      <div className="flex h-full items-center justify-center font-serif text-4xl tracking-tight md:text-5xl">
        Aa
      </div>
    ),
  },
  {
    id: "monogram",
    label: "03",
    approach: "Monogram",
    render: () => (
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
        <path
          d="M22 58 V22 L40 48 L58 22 V58"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "negative",
    label: "04",
    approach: "Negative space",
    render: () => (
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
        <circle cx="40" cy="40" r="28" fill="currentColor" />
        <rect x="34" y="24" width="12" height="32" fill="#efeeea" />
        <rect x="46" y="36" width="12" height="12" fill="#efeeea" />
      </svg>
    ),
  },
  {
    id: "symbol",
    label: "05",
    approach: "Symbol",
    render: () => (
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
        <path
          d="M40 14 L66 58 H14 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <circle cx="40" cy="44" r="6" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "abstract",
    label: "06",
    approach: "Abstract",
    render: () => (
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
        <path
          d="M18 50 C18 28 32 18 40 18 C52 18 62 30 62 42 C62 58 48 66 40 66 C28 66 18 56 18 50 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path d="M40 18 V66" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "structured",
    label: "07",
    approach: "Structured",
    render: () => (
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
        <rect
          x="16"
          y="16"
          width="48"
          height="48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line x1="40" y1="16" x2="40" y2="64" stroke="currentColor" strokeWidth="2" />
        <line x1="16" y1="40" x2="64" y2="40" stroke="currentColor" strokeWidth="2" />
        <rect x="40" y="40" width="24" height="24" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "expressive",
    label: "08",
    approach: "Expressive",
    render: () => (
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
        <path
          d="M20 55 Q28 20 40 28 Q52 36 48 55 Q44 68 40 62 Q36 68 32 55 Q28 42 20 55"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    id: "minimal",
    label: "09",
    approach: "Minimal",
    render: (active) => (
      <svg viewBox="0 0 80 80" className="h-full w-full" aria-hidden="true">
        <circle
          cx="40"
          cy="40"
          r="26"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2.5 : 1.5}
        />
        <rect x="36.5" y="28" width="7" height="24" fill="currentColor" />
      </svg>
    ),
  },
];

export default function ChapterPossibilities() {
  const { reducedMotion } = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);

  function canHover() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches
    );
  }

  return (
    <section
      id="possibilities"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-3xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            02 · Before there&apos;s a logo
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            First, there are possibilities.
          </h2>
          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            We explore different ways an idea could take shape before deciding
            which direction deserves to go further.
          </p>
        </div>

        {/* Desktop exploration sheet */}
        <div className="mt-14 hidden border border-black/10 bg-white p-6 md:block md:p-8">
          <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-black/5 pb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
              Exploration sheet · Study marks
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
              {active
                ? STUDIES.find((s) => s.id === active)?.approach
                : "Hover to isolate"}
            </p>
          </div>
          <ul className="grid grid-cols-3 gap-3 lg:grid-cols-9 lg:gap-2">
            {STUDIES.map((study) => {
              const isActive = active === study.id;
              const dimmed = active !== null && !isActive && !reducedMotion;
              return (
                <li key={study.id}>
                  <button
                    type="button"
                    onMouseEnter={() => {
                      if (canHover() && !reducedMotion) setActive(study.id);
                    }}
                    onMouseLeave={() => {
                      if (canHover()) setActive(null);
                    }}
                    onFocus={() => setActive(study.id)}
                    onBlur={() => setActive(null)}
                    onClick={() =>
                      setActive((current) =>
                        current === study.id ? null : study.id,
                      )
                    }
                    className={`group flex aspect-square w-full flex-col items-center justify-center border outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-black ${
                      isActive
                        ? "border-bs-purple bg-bs-offwhite text-bs-purple"
                        : "border-black/8 text-black hover:border-black/25"
                    } ${dimmed ? "opacity-25" : "opacity-100"}`}
                    aria-pressed={isActive}
                    aria-label={`${study.approach} study`}
                  >
                    <div className="h-[55%] w-[55%]">{study.render(isActive)}</div>
                    <span className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-400 group-hover:text-neutral-600">
                      {study.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile: art-directed vertical sheet, not shrunk desktop */}
        <div className="mt-12 md:hidden">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
            Exploration sheet
          </p>
          <ul className="grid grid-cols-3 gap-px bg-black/10">
            {STUDIES.map((study) => (
              <li
                key={study.id}
                className="aspect-square bg-bs-offwhite p-4 text-black"
              >
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="h-[60%] w-[60%]">{study.render(false)}</div>
                  <span className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-neutral-400">
                    {study.approach}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
