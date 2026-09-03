import Link from "next/link";
import GuidelinesButton from "./GuidelinesButton";

export default function ChapterExisting() {
  return (
    <section
      id="existing-brand"
      className="scroll-mt-chapter border-t border-black/5 bg-white lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-2xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            08 · Existing brand
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Already have the identity?
          </h2>
          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            We can create or improve guidelines for an existing brand, not only
            identities designed by skapa. If the identity itself needs work, or the
            business has moved on, the right next step may be different.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <article className="border border-black/10 bg-bs-offwhite p-6 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bs-purple">
              Brand identity
            </p>
            <h3 className="mt-4 font-serif text-2xl tracking-tight text-black md:text-3xl">
              The identity needs work
            </h3>
            <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
              When logo, colour, type and visual language still need defining before
              they can be documented.
            </p>
            <div className="mt-8">
              <GuidelinesButton href="/what-we-do/brand/brand-identity">
                Explore brand identity
              </GuidelinesButton>
            </div>
          </article>

          <article className="border border-black bg-black p-6 text-bs-offwhite md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bs-yellow">
              Rebranding
            </p>
            <h3 className="mt-4 font-serif text-2xl tracking-tight md:text-3xl">
              The brand no longer fits
            </h3>
            <p className="mt-4 font-mono text-sm leading-relaxed text-bs-offwhite/80 md:text-base">
              When the business has changed significantly and the existing brand
              needs more than a cleaner rulebook.
            </p>
            <div className="mt-8">
              <Link
                href="/what-we-do/brand/rebranding"
                className="inline-flex border border-bs-offwhite/30 px-5 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-bs-offwhite transition-colors hover:border-bs-offwhite hover:bg-bs-offwhite hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bs-offwhite"
              >
                Explore rebranding
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
