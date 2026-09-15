import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import FadeInOnLoad from "@/components/FadeInOnLoad";
import HomeWhatWeDo from "@/components/HomeWhatWeDo";
import ParallaxImage from "@/components/ParallaxImage";
import Reveal from "@/components/Reveal";
import ScrollRevealText from "@/components/ScrollRevealText";
import SkapaWordmarkStack from "@/components/SkapaWordmarkStack";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "skapa Creative",
  description:
    "Ipswich-based creative and digital agency working with businesses across Suffolk and the UK. Branding, bespoke web design, creative and social, all under one roof.",
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <div>
      {/* Desktop hero — pink / yellow / blue used together as one composition */}
      <div className="hidden md:block">
        <section className="mx-auto flex max-w-6xl flex-col px-6 pt-8 pb-0 md:h-[calc(100vh-96px)] md:px-10 md:pt-10">
          <FadeInOnLoad className="flex flex-1 flex-col gap-6 md:gap-8">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-12">
              <div className="max-w-3xl">
                <p className="mb-6 font-mono text-sm uppercase tracking-widest text-brand-blue">
                  Creative &amp; digital agency
                </p>
                <h1 className="font-serif text-3xl leading-[1.05] tracking-tight text-black sm:text-4xl md:text-5xl lg:text-6xl">
                  Brand, digital, and social
                  <br />
                  <span className="italic text-brand-pink">all under one roof.</span>
                </h1>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-6 bg-brand-blue px-6 py-6 md:min-w-[240px] md:items-end md:px-7 md:py-7">
                <SkapaWordmarkStack size="sm" className="md:text-right" />
                <div className="md:text-right">
                  <p className="mb-4 max-w-[260px] font-serif text-xl italic leading-snug text-brand-cream md:ml-auto md:text-2xl">
                    Kickstart your creative ideas now.
                  </p>
                  <Link
                    href="/start"
                    className="inline-block bg-brand-yellow px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-90"
                  >
                    Let&apos;s create something
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:flex-1 md:min-h-[240px]">
              <ParallaxImage offset={["start end", "end -50%"]}>
                <Image
                  src="/images/pexels-anastasia-shuraeva-7278565.jpg"
                  alt="Two people collaborating on a laptop in a warm, plant-filled studio"
                  fill
                  className="object-cover object-[center_60%]"
                  sizes="100vw"
                  priority
                />
              </ParallaxImage>
            </div>
          </FadeInOnLoad>
        </section>
      </div>

      {/* Mobile hero — same three-accent roles on the photo plane */}
      <div className="overflow-x-hidden md:hidden">
        <section className="mx-auto max-w-6xl px-6 pt-8 pb-8">
          <FadeInOnLoad className="flex flex-1 flex-col gap-6">
            <div className="relative h-[calc(32vh+220px)] overflow-hidden">
              <div className="absolute inset-0 left-1/2 w-screen -translate-x-1/2">
                <ParallaxImage offset={["start end", "end -50%"]} className="h-full">
                  <Image
                    src="/images/pexels-anastasia-shuraeva-7278565.jpg"
                    alt="Two people collaborating on a laptop in a warm, plant-filled studio"
                    fill
                    className="object-cover object-[center_52%]"
                    sizes="100vw"
                    priority
                  />
                </ParallaxImage>
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/75 via-black/20 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

              <div className="absolute inset-x-0 top-0 z-10 px-6 pt-6">
                <p className="mb-2 font-mono text-xs uppercase tracking-widest text-brand-yellow">
                  Creative &amp; digital agency
                </p>
                <h1 className="font-serif text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl">
                  Brand, digital, and social
                  <br />
                  <span className="italic text-brand-pink">all under one roof.</span>
                </h1>
              </div>

              <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-6">
                <p className="mb-4 max-w-xs font-serif text-lg italic leading-snug text-white">
                  Kickstart your creative ideas now.
                </p>
                <Link
                  href="/start"
                  className="inline-block bg-brand-blue px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
                >
                  Let&apos;s create something
                </Link>
              </div>
            </div>
          </FadeInOnLoad>
        </section>
      </div>

      <section className="bg-brand-cream">
        <div className="mx-auto max-w-4xl px-6 py-24 md:px-10 md:py-32">
          <ScrollRevealText
            text="Most creative agencies specialise in one thing and hand the rest off to freelancers who&apos;ve never met each other, let alone your brand."
            accentText="skapa keeps brand, digital, and marketing under one roof, with one team, one conversation, and one result you can actually rely on."
            className="font-serif text-3xl leading-snug md:text-4xl"
          />
        </div>
      </section>

      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 md:px-10 md:pt-28 md:pb-8">
          <div className="mb-10 flex items-end justify-between gap-6 md:mb-8">
            <Reveal>
              <p className="font-mono text-sm uppercase tracking-widest text-brand-blue">
                What we do
              </p>
            </Reveal>
            <Link
              href="/what-we-do"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500 underline-offset-4 hover:text-black hover:underline"
            >
              All services →
            </Link>
          </div>
          <HomeWhatWeDo />
        </div>
      </section>
    </div>
  );
}
