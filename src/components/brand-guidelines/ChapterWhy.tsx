"use client";

import { useEffect, useState } from "react";
import GuideMark from "./GuideMark";
import { useReducedMotion } from "./useReducedMotion";

const VARIANTS = [
  { id: "a", label: "Off", mark: "#4b4ae4", type: "font-serif text-lg", bg: "bg-white", pad: "items-start" },
  { id: "b", label: "Off", mark: "#ff2791", type: "font-mono text-xs uppercase", bg: "bg-neutral-100", pad: "items-center" },
  { id: "c", label: "Off", mark: "#111111", type: "font-serif text-sm italic", bg: "bg-bs-yellow/40", pad: "items-end" },
  { id: "d", label: "Off", mark: "#737373", type: "font-mono text-base", bg: "bg-white", pad: "items-center justify-between" },
] as const;

export default function ChapterWhy() {
  const { reducedMotion } = useReducedMotion();
  const [aligned, setAligned] = useState(false);

  useEffect(() => {
    if (reducedMotion) setAligned(true);
  }, [reducedMotion]);

  // Auto-align on view for reduced motion / as progressive enhancement via toggle on desktop
  return (
    <section
      id="why-guidelines"
      className="scroll-mt-chapter border-t border-black/5 bg-white lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-2xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            02 · Why guidelines
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Consistency shouldn&apos;t rely on memory.
          </h2>
          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            As more people work with a brand, small inconsistencies start to
            appear. Different colours. Different type. Different logo treatments.
            Different ways of speaking.
          </p>
          <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            Guidelines give everyone the same reference point.
          </p>
        </div>

        <div className="mt-12">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
              {aligned ? "One coherent system" : "Same asset, different habits"}
            </p>
            {!reducedMotion && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAligned((v) => !v)}
                  className="border border-black/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-600 outline-none transition-colors hover:border-black hover:text-black focus-visible:ring-2 focus-visible:ring-black"
                >
                  {aligned ? "Show drift" : "Apply guidelines"}
                </button>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                  Try it →
                </span>
              </div>
            )}
          </div>

          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {VARIANTS.map((variant, index) => (
              <li
                key={variant.id}
                className={`flex min-h-[9rem] flex-col border border-black/10 p-4 transition-all duration-500 md:min-h-[11rem] ${
                  aligned
                    ? "items-start justify-between bg-bs-offwhite"
                    : `${variant.bg} ${variant.pad}`
                }`}
                style={{
                  transitionDelay: reducedMotion ? "0ms" : `${index * 40}ms`,
                }}
              >
                <GuideMark
                  className="h-8 w-8 transition-colors duration-500"
                  color={aligned ? "#4b4ae4" : variant.mark}
                />
                <p
                  className={`mt-4 transition-all duration-500 ${
                    aligned
                      ? "font-mono text-[11px] uppercase tracking-[0.14em] text-black"
                      : `${variant.type} text-neutral-700`
                  }`}
                >
                  {aligned ? "Brand name" : "Brand name"}
                </p>
                <p className="mt-auto pt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-400">
                  {aligned ? "Aligned" : variant.label}
                </p>
              </li>
            ))}
          </ul>

          {reducedMotion && (
            <p className="mt-4 font-mono text-xs text-neutral-500">
              Without a shared reference, the same identity drifts. Guidelines pull
              it back into one system.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
