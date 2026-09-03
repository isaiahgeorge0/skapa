import Link from "next/link";
import StudyMark from "./StudyMark";
import LogoDesignButton from "./LogoDesignButton";

export default function ChapterReady() {
  return (
    <section
      id="ready-to-start"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-purple lg:scroll-mt-0"
    >
      <div className="relative overflow-hidden">
        {/* Construction-inspired CTA: precise fields, not blade corners */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-full w-[30%] bg-bs-pink md:w-[26%]" />
          <div className="absolute bottom-0 left-0 h-[14%] w-full bg-bs-yellow" />
          <div className="absolute top-[22%] left-[10%] hidden h-px w-24 bg-bs-offwhite/25 md:block" />
          <div className="absolute top-[22%] left-[10%] hidden h-24 w-px bg-bs-offwhite/25 md:block" />
          <StudyMark
            stage="resolve"
            className="absolute right-[8%] bottom-[22%] hidden h-28 w-28 text-bs-offwhite/15 md:block"
            fill="currentColor"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-chapter-safe pb-24 md:px-10 md:py-32 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-bs-yellow">
            READY TO START?
          </p>
          <h2 className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight text-bs-offwhite md:text-6xl">
            Reduce the noise.
            <br />
            Keep the mark.
          </h2>
          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-bs-offwhite/85 md:text-base">
            If you need a logo that stays clear under pressure, we&apos;ll explore
            the possibilities and refine until the right one remains.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <LogoDesignButton href="/start" variant="on-colour">
              Start a project
            </LogoDesignButton>
            <Link
              href="/what-we-do/brand/brand-identity"
              className="inline-flex w-fit border border-bs-offwhite/25 px-5 py-4 font-mono text-xs uppercase tracking-[0.14em] text-bs-offwhite transition-colors hover:border-bs-offwhite hover:bg-bs-offwhite hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bs-offwhite focus-visible:ring-offset-2 focus-visible:ring-offset-bs-purple"
            >
              Or explore brand identity
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
