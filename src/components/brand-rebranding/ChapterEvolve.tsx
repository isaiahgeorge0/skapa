"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "./useReducedMotion";

const PATHS = [
  {
    id: "evolve",
    label: "EVOLVE",
    accent: "bg-bs-purple",
    ring: "#4b4ae4",
    intro:
      "The fundamentals are still doing useful work. The brand needs refinement, alignment and more room to perform.",
    areas: [
      "Clarify the existing system",
      "Refresh typography and colour use",
      "Tighten tone of voice and messaging",
      "Improve digital consistency",
      "Update key applications without starting over",
    ],
  },
  {
    id: "transform",
    label: "TRANSFORM",
    accent: "bg-bs-pink",
    ring: "#ff2791",
    intro:
      "The business has moved far enough that the current brand is now limiting understanding, confidence or growth.",
    areas: [
      "Reposition the business more clearly",
      "Rebuild the identity system",
      "Reset how the brand sounds",
      "Rethink digital expression and structure",
      "Roll out a more complete transition plan",
    ],
  },
] as const;

type PathId = (typeof PATHS)[number]["id"];

export default function ChapterEvolve() {
  const { reducedMotion } = useReducedMotion();
  const [activeId, setActiveId] = useState<PathId>("evolve");
  const baseId = useId();
  const active = PATHS.find((path) => path.id === activeId) ?? PATHS[0];

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      nextIndex = (index + 1) % PATHS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      nextIndex = (index - 1 + PATHS.length) % PATHS.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = PATHS.length - 1;
    } else {
      return;
    }

    const next = PATHS[nextIndex];
    setActiveId(next.id);
    document.getElementById(`${baseId}-tab-${next.id}`)?.focus();
  }

  return (
    <section
      id="evolve-or-transform"
      className="scroll-mt-chapter border-t border-black/5 bg-white lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          07 · Evolve or transform
        </p>
        <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
          Not every brand needs starting again.
        </h2>
        <p className="mt-5 max-w-2xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
          Some brands need an intelligent evolution. Others need a more substantial
          reset. The useful question is which kind of change will actually help the
          business move forward.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8">
          <div
            role="tablist"
            aria-label="Rebrand approach"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"
          >
            {PATHS.map((path, index) => {
              const selected = path.id === activeId;
              return (
                <button
                  key={path.id}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${path.id}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel-${path.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveId(path.id)}
                  onFocus={() => setActiveId(path.id)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className={`relative overflow-hidden border p-6 text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 md:p-7 ${
                    selected
                      ? "border-black bg-bs-offwhite"
                      : "border-black/10 bg-white hover:border-black/30"
                  }`}
                  style={selected ? { boxShadow: `inset 0 0 0 1px ${path.ring}` } : undefined}
                >
                  <div
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-1 ${path.accent} transition-opacity duration-300 ${
                      selected ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <p
                    className="font-mono text-[10px] tracking-[0.18em] text-neutral-400"
                    style={selected ? { color: path.ring } : undefined}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 font-serif text-3xl tracking-tight text-black">
                    {path.label}
                  </h3>
                  <p className="mt-4 max-w-[30ch] font-mono text-sm leading-relaxed text-neutral-600">
                    {path.intro}
                  </p>
                </button>
              );
            })}
          </div>

          <div
            id={`${baseId}-panel-${active.id}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${active.id}`}
            className="relative overflow-hidden border border-black/10 bg-bs-offwhite p-6 md:p-8"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 rounded-full ${
                      active.id === "evolve" ? "bg-bs-purple" : "bg-bs-pink"
                    }`}
                  />
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    What that usually involves
                  </p>
                </div>

                <ul className="mt-8 grid gap-4 md:grid-cols-2">
                  {active.areas.map((area) => (
                    <li key={area} className="border-t border-black/10 pt-4">
                      <p className="font-mono text-sm leading-relaxed text-neutral-700">
                        {area}
                      </p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-10 max-w-2xl font-serif text-2xl leading-snug text-black md:text-3xl">
          We&apos;ll help work out which one you actually need.
        </p>
      </div>
    </section>
  );
}
