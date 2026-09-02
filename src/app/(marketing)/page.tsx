import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ConvergingCollage from "@/components/ConvergingCollage";
import FadeInOnLoad from "@/components/FadeInOnLoad";
import ParallaxImage from "@/components/ParallaxImage";
import Reveal from "@/components/Reveal";
import ScrollRevealText from "@/components/ScrollRevealText";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "skapa Creative",
  description:
    "Ipswich-based creative and digital agency working with businesses across Suffolk and the UK. Branding, bespoke web design, creative and social, all under one roof.",
  path: "/",
  absoluteTitle: true,
});

const pillars = [
  {
    name: "Brand",
    line: "Strategy, identity, and the systems that hold it together.",
  },
  {
    name: "Creative",
    line: "Campaigns, craft, and work that earns a second look.",
  },
  {
    name: "Digital",
    line: "Sites and experiences built to convert, not just impress.",
  },
  {
    name: "Social",
    line: "Content with a point of view, and a plan behind it.",
  },
] as const;

export default function HomePage() {
  return (
    <div>
      <section className="overflow-x-hidden md:overflow-visible mx-auto max-w-6xl px-6 pt-8 pb-8 md:h-[calc(100vh-96px)] md:px-10 md:pt-10 md:pb-10">
        <FadeInOnLoad className="flex flex-1 flex-col gap-6 md:gap-8">
          <div className="grid md:grid-cols-[1fr_auto] md:items-start md:gap-x-16 md:gap-y-8">
            <div className="relative col-span-full row-start-1 max-md:h-[calc(32vh+196px)] max-md:overflow-hidden md:col-span-full md:row-start-2 md:aspect-auto md:min-h-[240px] md:flex-1">
              <div
                className="absolute inset-0 max-md:left-1/2 max-md:w-screen max-md:-translate-x-1/2"
              >
                <ParallaxImage offset={["start end", "end -50%"]} className="h-full">
                  <Image
                    src="/images/pexels-anastasia-shuraeva-7278565.jpg"
                    alt="Two people collaborating on a laptop in a warm, plant-filled studio"
                    fill
                    className="object-cover object-[center_60%] max-md:object-[center_52%]"
                    sizes="100vw"
                    priority
                  />
                </ParallaxImage>
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/75 via-black/20 to-transparent md:hidden" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 via-black/20 to-transparent md:hidden" />

              <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-6 md:hidden">
                <p className="mb-4 max-w-xs font-serif text-lg italic leading-snug text-white">
                  Kickstart your creative ideas now.
                </p>
                <Link
                  href="/start"
                  className="inline-block bg-white px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-80"
                >
                  Let&apos;s create something
                </Link>
              </div>
            </div>

            <div className="z-10 col-span-full row-start-1 max-md:absolute max-md:inset-x-0 max-md:top-0 max-md:px-6 max-md:pt-6 md:col-span-1 md:static md:max-w-3xl md:px-0 md:pt-0">
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-white/80 md:mb-6 md:text-sm md:text-neutral-500">
                Creative &amp; digital agency
              </p>
              <h1 className="font-serif text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl md:text-black lg:text-6xl">
                Brand, digital, and social
                <br />
                <span className="italic text-brand-pink">all under one roof.</span>
              </h1>
            </div>

            <div className="z-10 hidden shrink-0 md:col-start-2 md:row-start-1 md:block md:pt-2 md:text-right">
              <p className="mb-5 max-w-[300px] font-serif text-2xl italic leading-snug text-black md:ml-auto md:text-3xl">
                Kickstart your creative ideas now.
              </p>
              <Link
                href="/start"
                className="inline-block bg-black px-8 py-4 font-mono text-xs uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
              >
                Let&apos;s create something
              </Link>
            </div>
          </div>
        </FadeInOnLoad>
      </section>

      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-4xl px-6 py-24 md:px-10 md:py-32">
          <ScrollRevealText
            text="Most creative agencies specialise in one thing and hand the rest off to freelancers who&apos;ve never met each other, let alone your brand."
            accentText="skapa keeps brand, digital, and marketing under one roof, with one team, one conversation, and one result you can actually rely on."
            className="font-serif text-3xl leading-snug md:text-4xl"
          />
        </div>
      </section>

      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
          <Reveal>
            <p className="mb-14 hidden font-mono text-sm uppercase tracking-widest text-neutral-500 md:block">
              What that looks like
            </p>
          </Reveal>

          <ConvergingCollage />
        </div>
      </section>

      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
          <Reveal>
            <p className="mb-14 font-mono text-sm uppercase tracking-widest text-neutral-500">
              What we do
            </p>
          </Reveal>
          <Reveal className="grid gap-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {pillars.map((pillar) => (
              <div key={pillar.name}>
                <h2 className="font-serif text-3xl text-black">{pillar.name}</h2>
                <p className="mt-4 max-w-prose font-mono text-sm leading-relaxed text-neutral-600">
                  {pillar.line}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
