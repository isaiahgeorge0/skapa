import GuideMark from "./GuideMark";

const APPLICATIONS = [
  {
    label: "Website",
    className: "sm:col-span-2 bg-bs-purple text-bs-offwhite",
    content: (
      <>
        <div className="flex items-center justify-between gap-3">
          <GuideMark className="h-7 w-7 shrink-0" color="#efeeea" />
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] opacity-60">
            Nav
          </span>
        </div>
        <div className="mt-6 min-w-0">
          <p className="font-serif text-2xl tracking-tight md:text-3xl">
            Clear by design.
          </p>
          <div className="mt-4 h-8 w-28 max-w-full bg-bs-offwhite/20" />
        </div>
      </>
    ),
  },
  {
    label: "Social",
    className: "bg-bs-pink text-white",
    content: (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
        <GuideMark className="h-12 w-12 shrink-0" color="#ffffff" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-70">
          Post
        </p>
      </div>
    ),
  },
  {
    label: "Presentation",
    className: "bg-white text-black",
    content: (
      <>
        <GuideMark className="h-6 w-6 shrink-0" color="#4b4ae4" />
        <p className="mt-5 font-serif text-2xl tracking-tight">Quarterly</p>
        <div className="mt-4 space-y-2">
          <div className="h-1.5 w-full bg-neutral-200" />
          <div className="h-1.5 w-[80%] bg-neutral-200" />
          <div className="h-1.5 w-[60%] bg-neutral-200" />
        </div>
      </>
    ),
  },
  {
    label: "Campaign",
    className: "bg-bs-yellow text-black sm:col-span-2",
    content: (
      <div className="flex min-h-0 flex-1 items-end justify-between gap-3">
        <p className="min-w-0 flex-1 font-serif text-2xl leading-tight tracking-tight md:text-3xl">
          Same brand. New format.
        </p>
        <GuideMark className="h-9 w-9 shrink-0" color="#111111" />
      </div>
    ),
  },
  {
    label: "Print",
    className: "bg-white text-black",
    content: (
      <div className="flex min-h-0 flex-1 flex-col justify-between">
        <GuideMark className="h-8 w-8 shrink-0" color="#111111" />
        <div className="min-w-0 pt-6">
          <p className="font-serif text-xl">Letterhead</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500">
            A4 · Print
          </p>
        </div>
      </div>
    ),
  },
] as const;

export default function ChapterFlex() {
  return (
    <section
      id="built-to-flex"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-2xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            05 · Built to flex
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Consistency doesn&apos;t mean everything looks the same.
          </h2>
          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            Good guidelines define enough structure for recognition while leaving
            room for different formats, audiences and creative applications.
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
          {APPLICATIONS.map((app) => (
            <li
              key={app.label}
              className={`flex min-h-[12rem] min-w-0 flex-col overflow-hidden border border-black/10 p-5 md:min-h-[14rem] ${app.className}`}
            >
              <p className="mb-3 shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] opacity-60">
                {app.label}
              </p>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                {app.content}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
