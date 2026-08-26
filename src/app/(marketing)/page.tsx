import Image from "next/image";
import Link from "next/link";
import ConvergingCollage from "@/components/ConvergingCollage";
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
      <section className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
        <Reveal className="grid items-end gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
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
            <Link
              href="/contact"
              className="mt-12 inline-block bg-black px-6 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-80"
            >
              Let&apos;s create something
            </Link>
          </div>

          <div className="md:col-span-5">
            {/* Placeholder Unsplash image — replace with commissioned/licensed photography before public launch. */}
            <Image
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80"
              alt="Someone working at a laptop in a warm, candid workspace"
              width={1200}
              height={1500}
              className="h-auto w-full object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
            />
          </div>
        </Reveal>
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
