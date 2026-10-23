import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import FadeInOnLoad from "@/components/FadeInOnLoad";
import HomeWhatWeDo from "@/components/HomeWhatWeDo";
import ParallaxImage from "@/components/ParallaxImage";
import Reveal from "@/components/Reveal";
import ScrollRevealText from "@/components/ScrollRevealText";
import { SkapaMark } from "@/components/brand/Logo";
import { pageMetadata } from "@/lib/seo";
import { approvedTestimonials, caseStudies } from "@/lib/work";
import WorkCapture from "@/components/WorkCapture";

const steps = [
  {
    n: "01",
    title: "A chat",
    body: "Fifteen minutes, in person or on the phone. You tell me what's not working.",
  },
  {
    n: "02",
    title: "A plan",
    body: "A clear scope and a fixed price, in plain English, before anything starts.",
  },
  {
    n: "03",
    title: "The build",
    body: "You see progress as it happens and can change your mind along the way.",
  },
  {
    n: "04",
    title: "Launch and after",
    body: "We go live together, and I'm still here when you need something changed.",
  },
];

export const metadata: Metadata = pageMetadata({
  title: "skapa Creative",
  description:
    "A small studio in Ipswich making brands, websites and social for independent businesses.",
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <div>
      {/* Desktop hero. Headline and blue box across the top, photo below. */}
      <div className="hidden md:block">
        <section className="site-container flex flex-col pt-8 pb-0 md:h-[calc(100vh-var(--skapa-site-chrome-height))] md:pt-10">
          <FadeInOnLoad className="flex flex-1 flex-col gap-6 md:gap-8">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-12">
              <div className="max-w-3xl 2xl:max-w-4xl">
                <p className="mb-6 font-mono text-sm uppercase tracking-widest text-brand-blue">
                  Creative studio · Ipswich
                </p>
                <h1 className="font-display font-medium text-3xl leading-[1.05] tracking-tight text-black sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl">
                  Brand, digital and social for independent businesses.
                  <br />
                  <span className="italic text-brand-pink">Made in Ipswich.</span>
                </h1>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-6 bg-brand-blue px-6 py-6 md:min-w-[15rem] md:items-end md:px-7 md:py-7">
                <SkapaMark tone="cream" className="h-14 md:ml-auto" />
                <div className="md:text-right">
                  <p className="mb-4 max-w-[16.25rem] font-display font-medium tracking-tight text-xl italic leading-snug text-brand-cream md:ml-auto md:text-2xl">
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

      {/* Mobile hero. Same three-accent roles on the photo plane. */}
      <div className="overflow-x-hidden md:hidden">
        <section className="site-container pt-8 pb-8">
          <FadeInOnLoad className="flex flex-1 flex-col gap-6">
            <div className="relative h-[calc(32vh+13.75rem)] overflow-hidden">
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
                  Creative studio · Ipswich
                </p>
                <h1 className="font-display font-medium text-3xl leading-[1.05] tracking-tight text-white sm:text-4xl">
                  Brand, digital and social for independent businesses.
                  <br />
                  <span className="italic text-brand-pink">Made in Ipswich.</span>
                </h1>
              </div>

              <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-6">
                <p className="mb-4 max-w-xs font-display font-medium text-lg italic leading-snug text-white">
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
        <div className="site-container-narrow py-24 md:py-32">
          <ScrollRevealText
            text="Most creative agencies specialise in one thing and hand the rest off to freelancers who've never met each other, let alone your brand."
            accentText="skapa keeps brand, digital and marketing in one studio, with one conversation and one result you can rely on."
            className="font-display font-medium tracking-tight text-3xl leading-snug md:text-4xl"
          />
        </div>
      </section>

      <section className="border-t border-neutral-200">
        <p className="site-container py-8 text-center font-mono text-xs uppercase tracking-[0.16em] text-neutral-500 md:py-10">
          <span className="whitespace-nowrap">Yard Kitchen</span>
          <span className="px-[0.45em]">·</span>
          <span className="whitespace-nowrap">Flowers Kitchen</span>
          <span className="px-[0.45em] max-md:hidden">·</span>
          <br className="md:hidden" />
          <span className="whitespace-nowrap">Blue Peak</span>
          <span className="px-[0.45em]">·</span>
          <span className="whitespace-nowrap">Wisk</span>
        </p>
      </section>

      <section className="border-t border-neutral-200">
        <div className="site-container pt-20 pb-16 md:pt-28 md:pb-8">
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

      <section className="border-t border-neutral-200">
        <div className="site-container py-20 md:py-28">
          <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
            <Reveal>
              <p className="font-mono text-sm uppercase tracking-widest text-brand-blue">
                Selected work
              </p>
            </Reveal>
            <Link
              href="/work"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500 underline-offset-4 hover:text-black hover:underline"
            >
              See all work →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-16">
            {caseStudies.map((study) => (
              <Reveal key={study.slug}>
                <Link href={`/work/${study.slug}`} className="group block">
                  <div style={{ backgroundColor: study.theme.bg }}>
                    <WorkCapture
                      study={study}
                      className="aspect-[16/10]"
                      sizes="(min-width: 768px) 50vw, 100vw"
                    />
                    <div className="h-1.5 w-full" style={{ backgroundColor: study.theme.accent }} />
                  </div>
                  <p className="mt-5 font-display text-2xl font-medium tracking-tight text-black">
                    {study.client}
                  </p>
                  <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-neutral-500">
                    {study.sector} · {study.location}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {approvedTestimonials[0]?.testimonial ? (
        <section className="border-t border-neutral-200">
          <div className="site-container-narrow py-20 md:py-28">
            <Reveal>
              <blockquote>
                <p className="font-display text-3xl font-medium leading-snug tracking-tight text-black md:text-5xl">
                  <span className="text-brand-pink" aria-hidden="true">
                    “
                  </span>
                  {approvedTestimonials[0].testimonial.quote}
                </p>
                <footer className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-neutral-500">
                  {approvedTestimonials[0].testimonial.name}
                  <span className="mx-2">·</span>
                  {approvedTestimonials[0].testimonial.role}
                </footer>
              </blockquote>
              <Link
                href={`/work/${approvedTestimonials[0].slug}`}
                className="mt-8 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500 underline-offset-4 hover:text-black hover:underline"
              >
                See the project →
              </Link>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="border-t border-neutral-200">
        <div className="site-container py-20 md:py-28">
          <Reveal>
            <p className="mb-12 font-mono text-sm uppercase tracking-widest text-brand-blue md:mb-16">
              How it works
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
            {steps.map((step) => (
              <Reveal key={step.n}>
                <div>
                  <p className="font-mono text-sm tracking-widest text-brand-blue">{step.n}</p>
                  <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-black">
                    {step.title}
                  </h2>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-600">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200">
        <div className="site-container py-20 md:py-28">
          <div className="mx-auto grid max-w-5xl items-center gap-16 md:grid-cols-2">
          <Reveal>
            <Image
              src="/brand/oval-seal/skapa-oval-seal-ink.svg"
              alt="Skapa. Swedish, to create, to make."
              width={3260}
              height={2220}
              unoptimized
              className="h-auto w-[min(100%,280px)]"
            />
          </Reveal>
          <Reveal>
            <p className="mb-6 font-mono text-sm uppercase tracking-widest text-brand-blue">
              The studio
            </p>
            <p className="max-w-xl text-lg leading-relaxed text-neutral-700 md:text-xl">
              Skapa is Swedish for to create. It&apos;s a small studio in Ipswich making brands,
              websites and apps for independent businesses, the kind you walk past every day. You
              deal with the person doing the work, from the first chat to the day it goes live.
            </p>
            {/* Founder photo slot. Not rendered until a portrait is ready. */}
          </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200">
        <div className="site-container flex flex-col items-center py-16 text-center md:py-24">
          <p className="font-display text-3xl font-medium tracking-tight text-black md:text-5xl">
            Got something in mind?
          </p>
          <Link
            href="/start"
            className="mt-8 inline-block bg-brand-yellow px-7 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-90"
          >
            Let&apos;s create something
          </Link>
        </div>
      </section>
    </div>
  );
}
