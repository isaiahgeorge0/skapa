"use client";

import { useState } from "react";
import StudyMark, { StudyLockup } from "./StudyMark";
import { useReducedMotion } from "./useReducedMotion";

const TESTS = [
  { id: "tiny", label: "Tiny" },
  { id: "huge", label: "Huge" },
  { id: "colour", label: "Colour" },
  { id: "format", label: "Format" },
] as const;

type TestId = (typeof TESTS)[number]["id"];

export default function ChapterTest() {
  const { reducedMotion } = useReducedMotion();
  const [active, setActive] = useState<TestId>("tiny");

  return (
    <section
      id="the-test"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-2xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            05 · One mark. Every situation.
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            A logo has to survive the real world.
          </h2>
          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            The same resolved mark, tested against size, colour and format
            constraints. If it only works in ideal conditions, it isn&apos;t finished.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Stress tests">
          {TESTS.map((test) => {
            const selected = active === test.id;
            return (
              <button
                key={test.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(test.id)}
                className={`border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black ${
                  selected
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 text-neutral-600 hover:border-black hover:text-black"
                }`}
              >
                {test.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          className={`mt-8 overflow-hidden border border-black/10 transition-[min-height] duration-300 ${
            reducedMotion ? "" : ""
          }`}
        >
          {active === "tiny" && <TinyPanel />}
          {active === "huge" && <HugePanel />}
          {active === "colour" && <ColourPanel />}
          {active === "format" && <FormatPanel />}
        </div>
      </div>
    </section>
  );
}

function TinyPanel() {
  return (
    <div className="flex min-h-[18rem] flex-col items-center justify-center gap-8 bg-white p-10 md:min-h-[22rem]">
      <div className="flex items-end gap-10 md:gap-16">
        <div className="flex flex-col items-center gap-3">
          <StudyMark stage="resolve" className="h-4 w-4 text-black" fill="currentColor" />
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-400">
            16px
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <StudyMark stage="resolve" className="h-6 w-6 text-black" fill="currentColor" />
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-400">
            24px
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <StudyMark stage="resolve" className="h-8 w-8 text-black" fill="currentColor" />
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-neutral-400">
            32px
          </p>
        </div>
      </div>
      <p className="max-w-sm text-center font-mono text-xs leading-relaxed text-neutral-500">
        Favicon scale. If the mark collapses here, it needs more reduction.
      </p>
    </div>
  );
}

function HugePanel() {
  return (
    <div className="relative min-h-[18rem] overflow-hidden bg-bs-purple md:min-h-[22rem]">
      <StudyMark
        stage="resolve"
        className="absolute top-1/2 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-[42%] text-bs-offwhite md:h-[36rem] md:w-[36rem]"
        fill="currentColor"
      />
      <p className="absolute bottom-6 left-6 z-10 font-mono text-[10px] uppercase tracking-[0.16em] text-bs-offwhite/70">
        Oversized · cropped beyond the frame
      </p>
    </div>
  );
}

function ColourPanel() {
  const fields = [
    { bg: "bg-bs-purple", fg: "text-bs-offwhite", label: "On purple" },
    { bg: "bg-bs-pink", fg: "text-white", label: "On pink" },
    { bg: "bg-bs-yellow", fg: "text-black", label: "On yellow" },
    { bg: "bg-black", fg: "text-white", label: "On black" },
    { bg: "bg-white", fg: "text-black", label: "On white" },
    { bg: "bg-bs-offwhite", fg: "text-bs-purple", label: "Brand colour" },
  ] as const;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3">
      {fields.map((field) => (
        <div
          key={field.label}
          className={`flex min-h-[9rem] flex-col items-center justify-center gap-3 ${field.bg} ${field.fg} md:min-h-[11rem]`}
        >
          <StudyMark stage="resolve" className="h-12 w-12" fill="currentColor" />
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] opacity-70">
            {field.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function FormatPanel() {
  return (
    <div className="grid gap-px bg-black/10 md:grid-cols-2">
      <div className="flex min-h-[11rem] flex-col items-center justify-center gap-3 bg-white p-6">
        <StudyMark stage="resolve" className="h-16 w-16 text-black" fill="currentColor" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
          Symbol
        </p>
      </div>
      <div className="flex min-h-[11rem] flex-col items-center justify-center gap-3 bg-white p-6">
        <span className="flex flex-col gap-1.5 text-black">
          <span className="block h-2.5 w-28 bg-current" />
          <span className="block h-1.5 w-16 bg-current opacity-45" />
        </span>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
          Wordmark
        </p>
      </div>
      <div className="flex min-h-[11rem] flex-col items-center justify-center gap-3 bg-white p-6">
        <StudyLockup markClassName="h-12 w-12" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
          Horizontal lockup
        </p>
      </div>
      <div className="flex min-h-[11rem] flex-col items-center justify-center gap-3 bg-bs-offwhite p-6 text-black">
        <div className="flex flex-col items-center gap-2">
          <StudyMark stage="resolve" className="h-10 w-10" fill="currentColor" />
          <span className="block h-1 w-8 bg-current opacity-40" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
          Compact version
        </p>
      </div>
    </div>
  );
}
