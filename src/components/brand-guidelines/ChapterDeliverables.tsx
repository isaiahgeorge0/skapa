import GuideMark from "./GuideMark";

const DELIVERABLES = [
  {
    title: "Brand guidelines",
    body: "The complete reference for your visual and verbal identity.",
  },
  {
    title: "Logo rules",
    body: "Clear usage, spacing, sizing and variation guidance.",
  },
  {
    title: "Colour specifications",
    body: "Accurate digital and print values.",
  },
  {
    title: "Typography system",
    body: "Hierarchy and practical type guidance.",
  },
  {
    title: "Visual direction",
    body: "Rules for imagery, graphics and layout.",
  },
  {
    title: "Tone of voice",
    body: "Practical direction for how the brand communicates.",
  },
  {
    title: "Application examples",
    body: "Examples showing the system working in context.",
  },
  {
    title: "Asset organisation",
    body: "Clear access to the files people actually need.",
  },
] as const;

export default function ChapterDeliverables() {
  return (
    <section
      id="what-you-get"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-2xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            07 · What you get
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            A reference built to be used.
          </h2>
        </div>

        <div className="mt-10 overflow-hidden border border-black/10 bg-white md:mt-14">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-2.5 md:px-8 md:py-4">
            <div className="flex items-center gap-3">
              <GuideMark className="h-5 w-5 md:h-6 md:w-6" color="#4b4ae4" />
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-500">
                Brand guidelines · Deliverable
              </p>
            </div>
            <p className="hidden font-mono text-[10px] tracking-[0.14em] text-neutral-400 sm:block">
              01 / 08
            </p>
          </div>

          <ol className="grid grid-cols-1 divide-y divide-black/10 sm:grid-cols-2 sm:divide-y-0">
            {DELIVERABLES.map((item, index) => (
              <li
                key={item.title}
                className="border-black/10 px-4 py-3.5 sm:border-t sm:odd:border-r sm:px-6 sm:py-5 md:px-8 md:py-6"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] tracking-[0.14em] text-neutral-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-xl tracking-tight text-black md:text-3xl">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-1.5 font-mono text-sm leading-snug text-neutral-600 md:mt-2 md:text-base md:leading-relaxed">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
