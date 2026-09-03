"use client";

import Link from "next/link";
import RebrandingButton from "./RebrandingButton";

export default function ChapterReady() {
  return (
    <section
      id="ready-for-whats-next"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-purple lg:scroll-mt-0"
    >
      <div className="relative overflow-hidden">
        {/* Distinct from Identity CTA: hard horizontal colour bands, not corner blades */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-full w-[38%] bg-bs-pink md:w-[32%]" />
          <div className="absolute bottom-0 left-0 h-[18%] w-[46%] bg-bs-yellow md:h-[22%] md:w-[34%]" />
          <div className="absolute top-[18%] left-[8%] hidden h-24 w-24 border border-bs-offwhite/25 md:block" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-chapter-safe pb-20 md:px-10 md:py-32 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-bs-yellow">
            READY FOR WHAT&apos;S NEXT?
          </p>
          <h2 className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight text-bs-offwhite md:text-6xl">
            Make the brand match the ambition.
          </h2>
          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-bs-offwhite/85 md:text-base">
            If the business has moved on, the brand can catch up. We&apos;ll help
            you decide how much needs to change, and what still deserves to stay.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <RebrandingButton href="/start" variant="on-colour">
              Start a project
            </RebrandingButton>
            <Link
              href="/what-we-do/brand/brand-strategy"
              className="inline-flex w-fit border border-bs-offwhite/25 px-5 py-4 font-mono text-xs uppercase tracking-[0.14em] text-bs-offwhite transition-colors hover:border-bs-offwhite hover:bg-bs-offwhite hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bs-offwhite focus-visible:ring-offset-2 focus-visible:ring-offset-bs-purple"
            >
              Explore brand strategy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
