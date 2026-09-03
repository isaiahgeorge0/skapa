"use client";

import StudyMark, { StudyLockup } from "./StudyMark";

const DELIVERABLES = [
  {
    title: "Primary logo",
    body: "Your main brand signature.",
    visual: (
      <StudyLockup markClassName="h-12 w-12" className="text-black" />
    ),
  },
  {
    title: "Secondary lockup",
    body: "An alternative composition for different spaces.",
    visual: (
      <div className="flex flex-col items-center gap-2 text-black">
        <StudyMark stage="resolve" className="h-10 w-10" fill="currentColor" />
        <span className="block h-1.5 w-14 bg-current" />
      </div>
    ),
  },
  {
    title: "Logo mark",
    body: "A compact, recognisable symbol.",
    visual: (
      <StudyMark stage="resolve" className="h-14 w-14 text-bs-purple" fill="currentColor" />
    ),
  },
  {
    title: "Colour variations",
    body: "Versions designed for your brand palette.",
    visual: (
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center bg-bs-purple text-bs-offwhite">
          <StudyMark stage="resolve" className="h-7 w-7" fill="currentColor" />
        </span>
        <span className="flex h-11 w-11 items-center justify-center bg-bs-pink text-white">
          <StudyMark stage="resolve" className="h-7 w-7" fill="currentColor" />
        </span>
        <span className="flex h-11 w-11 items-center justify-center bg-bs-yellow text-black">
          <StudyMark stage="resolve" className="h-7 w-7" fill="currentColor" />
        </span>
      </div>
    ),
  },
  {
    title: "Black + white",
    body: "For environments where colour isn’t appropriate.",
    visual: (
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center bg-black text-white">
          <StudyMark stage="resolve" className="h-7 w-7" fill="currentColor" />
        </span>
        <span className="flex h-11 w-11 items-center justify-center border border-black/15 bg-white text-black">
          <StudyMark stage="resolve" className="h-7 w-7" fill="currentColor" />
        </span>
      </div>
    ),
  },
  {
    title: "Digital + print files",
    body: "SVG, PDF, PNG and appropriate working/export formats.",
    visual: (
      <div className="flex gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
        {["SVG", "PDF", "PNG"].map((ext) => (
          <span key={ext} className="border border-black/15 px-2 py-1">
            {ext}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: "Usage guidance",
    body: "The essentials for keeping the logo consistent.",
    visual: (
      <div className="relative h-14 w-14">
        <StudyMark
          stage="resolve"
          className="absolute inset-0 m-auto h-8 w-8 text-black"
          fill="currentColor"
        />
        <div className="absolute inset-0 border border-dashed border-black/25" />
      </div>
    ),
  },
] as const;

export default function ChapterDeliverables() {
  return (
    <section
      id="what-you-get"
      className="scroll-mt-chapter border-t border-black/5 bg-white lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-2xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            06 · The finished system
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Everything you need to actually use it.
          </h2>
        </div>

        <ul className="mt-14 divide-y divide-black/10 border-y border-black/10">
          {DELIVERABLES.map((item) => (
            <li
              key={item.title}
              className="grid items-center gap-6 py-8 md:grid-cols-12 md:gap-8"
            >
              <div className="md:col-span-5">
                <h3 className="font-serif text-2xl tracking-tight text-black md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-2 font-mono text-sm leading-relaxed text-neutral-600">
                  {item.body}
                </p>
              </div>
              <div className="flex md:col-span-7 md:justify-end">
                <div className="flex min-h-[5rem] w-full items-center justify-center border border-black/8 bg-bs-offwhite px-6 py-5 md:max-w-md">
                  {item.visual}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
