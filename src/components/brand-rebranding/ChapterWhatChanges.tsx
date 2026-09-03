"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "./useReducedMotion";

const SCOPE = [
  {
    label: "STRATEGY",
    body: "Clarify the shift in positioning, audience, proposition or message before design decisions start hardening.",
    accent: "bg-bs-purple",
  },
  {
    label: "IDENTITY",
    body: "Update the visual system so typography, colour, graphic language and hierarchy feel relevant again.",
    accent: "bg-bs-pink",
  },
  {
    label: "VOICE",
    body: "Adjust how the brand sounds so the language matches the business you are now, not the version from years ago.",
    accent: "bg-bs-yellow",
  },
  {
    label: "DIGITAL",
    body: "Carry the rebrand into structure, interface and content direction so the website does not lag behind the new story.",
    accent: "bg-bs-purple",
  },
  {
    label: "ROLLOUT",
    body: "Plan the transition across launch assets, internal tools and the practical pieces people will actually have to use.",
    accent: "bg-bs-pink",
  },
] as const;

export default function ChapterWhatChanges() {
  const { reducedMotion } = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      id="what-changes"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              08 · What changes
            </p>
            <h2 className="max-w-lg font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
              Not every rebrand needs every part.
            </h2>
            <p className="mt-5 max-w-md font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
              Scope should follow the problem. Some projects need strategic clarity and
              digital rollout. Others mainly need the identity system refreshed and better
              explained. The point is to change what matters, not perform a full reset by
              default.
            </p>
          </div>

          <div className="lg:col-span-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 xl:gap-3 2xl:gap-4">
              {SCOPE.map((item, index) => {
                const active = index === activeIndex;
                return (
                  <motion.article
                    key={item.label}
                    initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                    whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocusCapture={() => setActiveIndex(index)}
                    tabIndex={0}
                    className={`group relative overflow-hidden border border-black/10 bg-white p-5 transition-all duration-300 ease-out md:p-6 xl:p-4 2xl:p-5 ${
                      active ? "md:-translate-y-1" : ""
                    }`}
                  >
                    <div
                      aria-hidden="true"
                      className={`absolute inset-x-0 top-0 h-1 ${item.accent} transition-transform duration-300 ${
                        active ? "scale-x-100" : "scale-x-0"
                      } origin-left`}
                    />
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute right-4 bottom-4 h-16 w-16 rounded-full border border-black/10 transition-all duration-300 ${
                        active ? "scale-100 opacity-100" : "scale-90 opacity-30"
                      }`}
                    />
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-5 font-serif text-[1.6rem] leading-[0.95] tracking-tight text-black xl:text-[1.3rem] 2xl:text-[1.5rem]">
                      {item.label}
                    </h3>
                    <p className="mt-3 font-mono text-[13px] leading-relaxed text-neutral-600 xl:text-[12px] 2xl:text-[13px]">
                      {item.body}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
