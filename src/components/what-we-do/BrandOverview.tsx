import Link from "next/link";
import DirectoryButton from "@/components/what-we-do/DirectoryButton";
import { BRAND_CAPABILITIES, BRAND_CHOICES } from "@/lib/service-groups";

export default function BrandOverview() {
  return (
    <div className="bg-bs-offwhite text-black">
      <Hero />
      <System />
      <Choose />
      <Connected />
      <Close />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-bs-purple text-bs-offwhite">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-full w-[28%] bg-bs-pink md:w-[22%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[18%] w-[42%] bg-bs-yellow md:h-[22%] md:w-[30%]"
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-[calc(var(--skapa-site-chrome-height)+1.5rem)] md:px-10 md:pb-28 md:pt-28">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-bs-yellow">
          Brand
        </p>
        <h1 className="max-w-[16ch] font-serif text-[2.35rem] leading-[1.06] tracking-tight md:text-6xl lg:text-[4rem]">
          Build a brand people know is yours.
        </h1>
        <p className="mt-6 max-w-[42ch] font-mono text-sm leading-relaxed text-bs-offwhite/85 md:text-base">
          Strategy, identity and the systems that hold it all together. We
          build brands with a clear idea behind them and a visual language
          people can recognise.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <DirectoryButton href="/start" variant="on-colour">
            Start a project
          </DirectoryButton>
          <DirectoryButton href="#brand-services" variant="ghost">
            Explore brand services
          </DirectoryButton>
        </div>
      </div>
    </section>
  );
}

function System() {
  return (
    <section
      id="brand-services"
      className="scroll-mt-24 border-t border-black/5"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          The brand system
        </p>
        <h2 className="mt-4 max-w-[18ch] font-serif text-3xl tracking-tight md:text-5xl">
          Think, define, create, refine, systemise.
        </h2>
        <p className="mt-5 max-w-[46ch] font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
          Five connected disciplines. Use one, or move through the sequence
          as the brand needs it.
        </p>
        <ol className="mt-14 space-y-0">
          {BRAND_CAPABILITIES.map((item, index) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`group grid gap-4 border-t border-black/10 py-8 outline-none transition-colors md:grid-cols-[7rem_8rem_1fr_auto] md:items-baseline md:gap-8 md:py-10 focus-visible:bg-black/[0.03] ${
                  index === BRAND_CAPABILITIES.length - 1 ? "border-b" : ""
                }`}
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                  {item.number} · {item.verb}
                </span>
                <SystemMark index={index} />
                <span>
                  <span className="block font-serif text-2xl tracking-tight text-black md:text-3xl">
                    {item.title}
                  </span>
                  <span className="mt-2 block max-w-[42ch] font-mono text-sm leading-relaxed text-neutral-600">
                    {item.body}
                  </span>
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-bs-purple">
                  View →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SystemMark({ index }: { index: number }) {
  if (index === 0) {
    return (
      <span aria-hidden="true" className="hidden h-8 items-end gap-1 md:flex">
        <span className="h-3 w-1.5 bg-black" />
        <span className="h-6 w-1.5 bg-black" />
        <span className="h-4 w-1.5 bg-black" />
      </span>
    );
  }
  if (index === 1) {
    return (
      <span aria-hidden="true" className="hidden gap-1 md:flex">
        <span className="h-6 w-6 bg-bs-purple" />
        <span className="h-6 w-6 bg-bs-pink" />
        <span className="h-6 w-6 bg-bs-yellow" />
      </span>
    );
  }
  if (index === 2) {
    return (
      <span
        aria-hidden="true"
        className="hidden font-serif text-lg italic text-neutral-400 md:block"
      >
        was → is
      </span>
    );
  }
  if (index === 3) {
    return (
      <span
        aria-hidden="true"
        className="hidden h-8 w-8 bg-bs-purple md:block"
      />
    );
  }
  return (
    <span aria-hidden="true" className="hidden flex-col justify-center gap-1 md:flex">
      <span className="h-px w-10 bg-black" />
      <span className="h-px w-7 bg-black" />
      <span className="h-px w-10 bg-black" />
    </span>
  );
}

function Choose() {
  return (
    <section className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          Help me choose
        </p>
        <h2 className="mt-4 max-w-[16ch] font-serif text-3xl tracking-tight md:text-5xl">
          Start from where the brand is now.
        </h2>
        <ul className="mt-12 divide-y divide-black/10 border-y border-black/10">
          {BRAND_CHOICES.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex flex-col gap-3 py-6 outline-none transition-colors md:flex-row md:items-baseline md:justify-between md:gap-10 md:py-7 focus-visible:bg-black/[0.03]"
              >
                <p className="max-w-[38ch] font-serif text-xl leading-snug tracking-tight text-black md:text-2xl">
                  {item.need}
                </p>
                <p className="shrink-0 font-mono text-[12px] uppercase tracking-[0.14em] text-bs-purple">
                  {item.title}{" "}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Connected() {
  return (
    <section className="border-t border-black/5">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-12 md:gap-12 md:px-10 md:py-28">
        <div className="md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Connected, not packaged
          </p>
          <h2 className="mt-4 font-serif text-3xl tracking-tight md:text-4xl">
            Use what you need. Keep the thinking joined up.
          </h2>
        </div>
        <div className="space-y-5 font-mono text-sm leading-relaxed text-neutral-600 md:col-span-6 md:col-start-7 md:text-base">
          <p>
            Some clients only need a logo, or a set of guidelines the team
            can actually follow. Others need the longer path: strategy into
            identity into a system people can use.
          </p>
          <p>
            A rebrand often draws on several of these disciplines at once.
            We start from the brand as it stands, then decide what should
            stay, change, or be built for the first time.
          </p>
          <p>
            Based in Ipswich, we work with businesses across Suffolk and the
            UK. The work is the same either way: a brand with a reason, and
            the tools to keep it consistent.
          </p>
        </div>
      </div>
    </section>
  );
}

function Close() {
  return (
    <section className="bg-black text-bs-offwhite">
      <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bs-yellow">
          Next
        </p>
        <h2 className="mt-4 max-w-[16ch] font-serif text-4xl tracking-tight md:text-6xl">
          Not sure where to start?
        </h2>
        <p className="mt-6 max-w-[36ch] font-mono text-sm leading-relaxed text-bs-offwhite/80 md:text-base">
          Tell us where the brand is now. We&apos;ll work out what it needs
          next.
        </p>
        <div className="mt-10">
          <DirectoryButton href="/start" variant="on-colour">
            Start a project
          </DirectoryButton>
        </div>
      </div>
    </section>
  );
}
