import GuideMark from "./GuideMark";

const RULES = [
  {
    title: "Logo clear space",
    doLabel: "Do",
    dontLabel: "Don\u2019t",
    do: (
      <div className="relative flex h-28 items-center justify-center">
        <div className="absolute inset-4 border border-dashed border-bs-purple/40" />
        <GuideMark className="h-12 w-12" color="#4b4ae4" />
      </div>
    ),
    dont: (
      <div className="relative flex h-28 items-center justify-center overflow-hidden">
        <GuideMark className="h-20 w-20" color="#4b4ae4" />
        <div className="absolute inset-x-3 top-3 h-6 bg-neutral-300" />
      </div>
    ),
  },
  {
    title: "Minimum size",
    doLabel: "Do",
    dontLabel: "Don\u2019t",
    do: (
      <div className="flex h-28 items-center justify-center gap-6">
        <GuideMark className="h-10 w-10" color="#111111" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
          24px+
        </p>
      </div>
    ),
    dont: (
      <div className="flex h-28 items-center justify-center gap-6 opacity-50">
        <GuideMark className="h-3 w-3" color="#111111" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
          Too small
        </p>
      </div>
    ),
  },
  {
    title: "Colour use",
    doLabel: "Do",
    dontLabel: "Don\u2019t",
    do: (
      <div className="flex h-28 items-center justify-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center bg-bs-purple">
          <GuideMark className="h-7 w-7" color="#efeeea" />
        </span>
        <span className="flex h-14 w-14 items-center justify-center bg-bs-offwhite">
          <GuideMark className="h-7 w-7" color="#4b4ae4" />
        </span>
      </div>
    ),
    dont: (
      <div className="flex h-28 items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center bg-[#7dd3fc]">
          <GuideMark className="h-7 w-7" color="#fb923c" />
        </span>
      </div>
    ),
  },
  {
    title: "Typography hierarchy",
    doLabel: "Do",
    dontLabel: "Don\u2019t",
    do: (
      <div className="flex h-28 flex-col justify-center gap-2 px-4">
        <p className="font-serif text-2xl text-black">Headline</p>
        <p className="font-mono text-xs text-neutral-500">Supporting line</p>
      </div>
    ),
    dont: (
      <div className="flex h-28 flex-col justify-center gap-1 px-4">
        <p className="font-mono text-sm font-bold uppercase text-black">Headline</p>
        <p className="font-serif text-lg italic text-black">Supporting line</p>
      </div>
    ),
  },
] as const;

export default function ChapterRules() {
  return (
    <section
      id="the-rules"
      className="scroll-mt-chapter border-t border-black/5 bg-white lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-2xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            04 · The rules
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Clear enough to follow.
            <br />
            Flexible enough to use.
          </h2>
          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            Guidelines are not about making a brand rigid. They protect recognition
            while leaving room to work.
          </p>
        </div>

        <ul className="mt-14 space-y-8">
          {RULES.map((rule) => (
            <li key={rule.title} className="border border-black/10">
              <div className="border-b border-black/10 px-5 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                  {rule.title}
                </p>
              </div>
              <div className="grid md:grid-cols-2">
                <div className="border-b border-black/10 md:border-r md:border-b-0">
                  <p className="px-5 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-bs-purple">
                    {rule.doLabel}
                  </p>
                  {rule.do}
                </div>
                <div>
                  <p className="px-5 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                    {rule.dontLabel}
                  </p>
                  {rule.dont}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
