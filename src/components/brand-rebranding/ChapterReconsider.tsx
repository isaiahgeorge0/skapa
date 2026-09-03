"use client";

import RebrandingButton from "./RebrandingButton";

const TOPICS = [
  {
    label: "POSITIONING",
    text: "What place should the brand occupy now that the business has changed?",
  },
  {
    label: "AUDIENCE",
    text: "Who needs to recognise themselves in the next version of the brand?",
  },
  {
    label: "PROPOSITION",
    text: "What are you actually offering people, beyond the old shorthand?",
  },
  {
    label: "PERSONALITY",
    text: "What should the brand feel like when the ambition is clearer?",
  },
  {
    label: "MESSAGE",
    text: "What deserves to be said plainly before design starts to speak for it?",
  },
] as const;

export default function ChapterReconsider() {
  return (
    <section
      id="reconsider"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              04 · Reconsider
            </p>
            <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
              Changing how you look is easy. Changing what you mean takes more
              thought.
            </h2>
            <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
              The stronger rebrands are rarely surface updates. They begin by
              reconsidering what the business should stand for, who it needs to
              speak to, and what deserves more emphasis now.
            </p>

            <div className="mt-10">
              <RebrandingButton
                href="/what-we-do/brand/brand-strategy"
                variant="primary"
              >
                Explore Brand Strategy
              </RebrandingButton>
            </div>
          </div>

          <div className="border-t border-black/10 lg:border-t-0 lg:border-l lg:pl-10">
            <ul>
              {TOPICS.map((topic, index) => (
                <li
                  key={topic.label}
                  className={`${index === 0 ? "" : "border-t border-black/10"} py-6`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                    {topic.label}
                  </p>
                  <p className="mt-3 max-w-[28ch] font-serif text-[1.55rem] leading-snug tracking-tight text-black md:text-[1.9rem]">
                    {topic.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
