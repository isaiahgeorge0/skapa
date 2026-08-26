import type { Metadata } from "next";
import Link from "next/link";
import ProjectTile from "@/components/ProjectTile";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Work",
};

export default function WorkPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
      <Reveal>
        <p className="mb-8 font-mono text-sm uppercase tracking-widest text-neutral-500">
          Work
        </p>
        <h1 className="max-w-3xl font-serif text-6xl leading-[0.95] tracking-tight md:text-8xl">
          In <span className="italic text-brand-pink">progress.</span>
        </h1>
      </Reveal>

      <Reveal className="mt-16 max-w-xl md:mt-24">
        <div className="-rotate-2">
          <ProjectTile
            headline="Building"
            italic="forward."
            label="Residential & small-commercial — in progress"
            accent="pink"
          />
        </div>
      </Reveal>

      <Reveal className="mt-16 max-w-prose md:mt-20">
        <p className="font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
          More case studies landing as projects complete. Currently working in
          residential and small-commercial building — check back soon, or get
          in touch if you&apos;d rather start the conversation now.
        </p>
        <Link
          href="/contact"
          className="mt-10 inline-block border border-black px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-black transition-colors hover:bg-black hover:text-white"
        >
          Get in touch
        </Link>
      </Reveal>
    </div>
  );
}
