import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import WorkCapture from "@/components/WorkCapture";
import { clientFontClass } from "@/app/(marketing)/work/fonts";
import { pageMetadata } from "@/lib/seo";
import { caseStudies } from "@/lib/work";

export const metadata: Metadata = pageMetadata({
  title: "Work",
  description: "Selected work from a small studio in Ipswich.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <div className="site-container py-24 md:py-32">
      <Reveal>
        <p className="mb-8 font-mono text-sm uppercase tracking-widest text-brand-blue">Work</p>
        <h1 className="max-w-4xl font-display text-6xl font-medium leading-[0.95] tracking-tight md:text-8xl">
          Selected <span className="italic text-brand-pink">work.</span>
        </h1>
      </Reveal>

      <div className="mt-16 flex flex-col gap-8 md:mt-24">
        {caseStudies.map((study) => {
          const fonts = clientFontClass[study.slug];
          const line = study.voice?.approved ? study.voice.headline : study.summary;
          return (
            <Reveal key={study.slug}>
              <Link
                href={`/work/${study.slug}`}
                className="group relative block overflow-hidden"
                style={{ backgroundColor: study.theme.bg, color: study.theme.fg }}
              >
                <div className="px-8 py-10 md:px-12 md:py-14">
                  <div className="mb-6 flex flex-wrap gap-3">
                    {study.availability === "launching-soon" ? (
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-70">
                        Launching soon
                      </span>
                    ) : null}
                    {study.ownProduct ? (
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-70">
                        Our own product
                      </span>
                    ) : null}
                  </div>
                  <h2
                    className={`${fonts?.display ?? "font-display"} text-4xl font-semibold tracking-tight md:text-6xl`}
                  >
                    {study.client}
                  </h2>
                  <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] opacity-70">
                    {study.sector} · {study.location}
                  </p>
                  <p className={`${fonts?.body ?? "font-display"} mt-6 max-w-2xl text-lg leading-relaxed md:text-xl`}>
                    {line}
                  </p>
                </div>
                <WorkCapture
                  study={study}
                  className="mx-8 h-48 md:mx-12 md:h-72"
                  sizes="(min-width: 768px) 80vw, 100vw"
                />
              </Link>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-20 max-w-xl md:mt-28">
        <p className="font-display text-2xl font-medium tracking-tight md:text-3xl">
          More projects landing soon. Got something in mind?
        </p>
        <Link
          href="/start"
          className="mt-8 inline-block bg-brand-yellow px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-90"
        >
          Let&apos;s create something
        </Link>
      </Reveal>
    </div>
  );
}
