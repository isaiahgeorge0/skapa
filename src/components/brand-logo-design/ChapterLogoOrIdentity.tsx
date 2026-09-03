import Link from "next/link";
import LogoDesignButton from "./LogoDesignButton";

export default function ChapterLogoOrIdentity() {
  return (
    <section
      id="logo-or-identity"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-2xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            07 · A logo is part of the picture
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Sometimes you need a logo.
            <br />
            Sometimes you need the whole identity.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <article className="border border-black/10 bg-white p-6 md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bs-purple">
              Logo design
            </p>
            <h3 className="mt-4 font-serif text-2xl tracking-tight text-black md:text-3xl">
              A distinctive mark
            </h3>
            <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
              For businesses that already know who they are and need a
              distinctive mark to represent it.
            </p>
          </article>

          <article className="border border-black bg-black p-6 text-bs-offwhite md:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bs-yellow">
              Brand identity
            </p>
            <h3 className="mt-4 font-serif text-2xl tracking-tight md:text-3xl">
              The wider system
            </h3>
            <p className="mt-4 font-mono text-sm leading-relaxed text-bs-offwhite/80 md:text-base">
              For businesses that need the wider visual system too: typography,
              colour, imagery, graphic language and application.
            </p>
            <div className="mt-8">
              <LogoDesignButton href="/what-we-do/brand/brand-identity" variant="on-colour">
                Explore brand identity
              </LogoDesignButton>
            </div>
          </article>
        </div>

        <p className="mt-10 font-mono text-sm text-neutral-600 md:text-base">
          Still working out what the brand should stand for?{" "}
          <Link
            href="/what-we-do/brand/brand-strategy"
            className="text-black underline decoration-dotted underline-offset-4 transition-colors hover:text-bs-purple"
          >
            Explore brand strategy
          </Link>
        </p>
      </div>
    </section>
  );
}
