import Link from "next/link";
import GuidelinesButton from "./GuidelinesButton";

export default function ChapterReady() {
  return (
    <section
      id="ready-to-start"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-purple lg:scroll-mt-0"
    >
      <div className="relative overflow-hidden">
        {/* Manual-inspired CTA: ruled bands and page markers, not corner blades */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 h-full w-[28%] bg-bs-pink md:w-[24%]" />
          <div className="absolute bottom-0 left-0 h-[12%] w-full bg-bs-yellow" />
          <div className="absolute top-[20%] left-[8%] hidden h-px w-32 bg-bs-offwhite/20 md:block" />
          <p className="absolute top-[18%] right-[8%] hidden font-mono text-[10px] tracking-[0.18em] text-bs-offwhite/35 md:block">
            48 / 48
          </p>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-chapter-safe pb-24 md:px-10 md:py-32 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-bs-yellow">
            READY TO START?
          </p>
          <h2 className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight text-bs-offwhite md:text-6xl">
            Put the rules in one place.
          </h2>
          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-bs-offwhite/85 md:text-base">
            If your brand needs a reference people can actually follow, we&apos;ll
            turn the identity into a clear, usable system.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <GuidelinesButton href="/start" variant="on-colour">
              Start a project
            </GuidelinesButton>
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
