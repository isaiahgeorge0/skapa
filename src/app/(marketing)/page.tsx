import Image from "next/image";
import Link from "next/link";
import ConvergingCollage from "@/components/ConvergingCollage";
import FadeInOnLoad from "@/components/FadeInOnLoad";
import ParallaxImage from "@/components/ParallaxImage";
import Reveal from "@/components/Reveal";
import ScrollRevealText from "@/components/ScrollRevealText";

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
      <div className="hidden md:block">
      <section className="mx-auto flex max-w-6xl flex-col px-6 pt-8 pb-8 md:h-[calc(100vh-96px)] md:px-10 md:pt-10 md:pb-10">
        <FadeInOnLoad className="flex flex-1 flex-col gap-6 md:gap-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-16">
            <div className="max-w-3xl">
              <p className="mb-6 font-mono text-sm uppercase tracking-widest text-neutral-500">
                Creative &amp; digital agency
              </p>
              <h1 className="font-serif text-3xl leading-[1.05] tracking-tight text-black sm:text-4xl md:text-5xl lg:text-6xl">
                Brand, digital, and social
                <br />
                <span className="italic text-brand-pink">all under one roof.</span>
              </h1>
            </div>

            <div className="shrink-0 md:pt-2 md:text-right">
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

          <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:flex-1 md:min-h-[240px]">
            <ParallaxImage>
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

      <div className="overflow-x-hidden md:hidden">
        <section className="flex flex-col">
          <div
            className="relative h-[32vh] overflow-hidden"
            style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}
          >
            <ParallaxImage offset={["start end", "end -30%"]}>
              <Image
                src="/images/pexels-anastasia-shuraeva-7278565.jpg"
                alt="Two people collaborating on a laptop in a warm, plant-filled studio"
                fill
                className="object-cover object-[center_52%]"
                sizes="100vw"
                priority
              />
            </ParallaxImage>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 top-0 px-6 pt-6">
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-white/80">
                Creative &amp; digital agency
              </p>
              <h1 className="font-serif text-3xl leading-[1.05] text-white">
                Brand, digital, and social
                <br />
                <span className="italic text-brand-pink">all under one roof.</span>
              </h1>
            </div>
          </div>

          <FadeInOnLoad className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between gap-12 px-6 py-12">
            <div className="flex flex-col items-start gap-6">
              <p className="max-w-md font-serif text-xl italic leading-snug text-black">
                Kickstart your creative ideas now.
              </p>
              <Link
                href="/start"
                className="inline-block shrink-0 bg-black px-8 py-4 font-mono text-xs uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
              >
                Let&apos;s create something
              </Link>
            </div>
          </FadeInOnLoad>
        </section>
      </div>

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
