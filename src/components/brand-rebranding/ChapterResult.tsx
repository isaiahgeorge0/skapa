"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "./useReducedMotion";

const SYSTEM_PANELS = [
  { label: "Core mark", tone: "bg-white", text: "text-black", detail: "Aa" },
  {
    label: "Editorial rhythm",
    tone: "bg-bs-offwhite",
    text: "text-black",
    detail: "Clearer hierarchy",
  },
  { label: "Campaign frame", tone: "bg-bs-purple", text: "text-bs-offwhite", detail: "Room to lead" },
  {
    label: "Digital module",
    tone: "bg-bs-yellow",
    text: "text-black",
    detail: "Useful navigation",
  },
  { label: "Internal deck", tone: "bg-white", text: "text-black", detail: "Confident consistency" },
] as const;

export default function ChapterResult() {
  const { reducedMotion } = useReducedMotion();

  return (
    <section
      id="result"
      className="scroll-mt-chapter border-t border-black/5 bg-white lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-bs-purple">
              09 · Result
            </p>
            <h2 className="max-w-2xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
              A brand ready for the business you&apos;re becoming.
            </h2>
            <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
              Not change for the sake of change. A clearer, more relevant and more
              useful expression of who your business is now, with room for where it
              goes next.
            </p>
          </div>

          <div className="lg:col-span-7">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative overflow-hidden border border-black/10 bg-bs-offwhite p-4 md:p-6"
            >
              <div aria-hidden="true" className="absolute inset-0">
                <div className="absolute left-[8%] top-[10%] h-px w-[26%] bg-black/10" />
                <div className="absolute right-[10%] top-[12%] h-px w-[18%] bg-black/10" />
                <div className="absolute bottom-[10%] left-[14%] h-px w-[22%] bg-black/10" />
              </div>

              <div className="relative grid gap-4 md:grid-cols-6 md:grid-rows-2">
                {SYSTEM_PANELS.map((panel, index) => (
                  <motion.div
                    key={panel.label}
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
                    whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
                    className={`relative min-h-[9rem] overflow-hidden border border-black/10 p-4 ${
                      panel.tone
                    } ${panel.text} ${
                      index === 0
                        ? "md:col-span-2"
                        : index === 1
                          ? "md:col-span-2"
                          : index === 2
                            ? "md:col-span-2"
                            : index === 3
                              ? "md:col-span-3"
                              : "md:col-span-3"
                    }`}
                  >
                    <div className="absolute inset-0">
                      <div className="absolute inset-x-4 top-4 h-px bg-current/15" />
                      <div className="absolute right-4 bottom-4 h-6 w-6 border border-current/20" />
                    </div>
                    <div className="relative flex h-full flex-col justify-between">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] opacity-65">
                        {panel.label}
                      </p>
                      <div>
                        <p className="font-serif text-2xl leading-none md:text-3xl">
                          {panel.detail}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
