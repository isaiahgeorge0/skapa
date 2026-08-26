import Image from "next/image";
import Link from "next/link";
import ConvergingCollage from "@/components/ConvergingCollage";
import FadeInOnLoad from "@/components/FadeInOnLoad";
import ParallaxImage from "@/components/ParallaxImage";
import Reveal from "@/components/Reveal";

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
    line: "Content with a point of view — and a plan behind it.",
  },
] as const;

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-24 md:px-10 md:pt-16 md:pb-32">
        <FadeInOnLoad className="grid items-center gap-16 md:grid-cols-12 lg:gap-24">
          <div className="md:col-span-6">
            <p className="mb-8 font-mono text-sm uppercase tracking-widest text-neutral-500">
              Creative &amp; digital agency
            </p>
            <h1 className="font-serif text-6xl leading-[0.95] tracking-tight text-black md:text-8xl">
              Everything under
              <br />
              <span className="italic text-brand-pink">one roof.</span>
            </h1>
            <p className="mt-10 max-w-prose font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
              skapa is a creative design and marketing agency built to create,
              shape and grow brands. We work with businesses at every stage —
              from the first idea on a blank page to established brands ready
              for their next chapter.
            </p>
          </div>

          <div className="relative md:col-span-6">
            <ParallaxImage className="relative aspect-[4/5] w-full">
              <Image
                src="/images/pexels-anastasia-shuraeva-7278565.jpg"
                alt="Couple on a green sofa with a laptop in a warm, candid studio setting"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 45vw"
                priority
              />
            </ParallaxImage>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <p className="max-w-xs font-serif text-2xl leading-tight tracking-tight text-white md:text-3xl">
                Kickstart your creative ideas{" "}
                <span className="italic">now.</span>
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-block bg-black px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
              >
                Let&apos;s create something
              </Link>
            </div>
          </div>
        </FadeInOnLoad>
      </section>

      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
          <Reveal>
            <p className="mb-14 font-mono text-sm uppercase tracking-widest text-neutral-500">
              In the studio
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
