const USERS = [
  "Internal team",
  "Designers",
  "Marketers",
  "Developers",
  "Social teams",
  "Printers",
  "Partners",
  "Agencies",
] as const;

export default function ChapterUsers() {
  return (
    <section
      id="who-uses-them"
      className="scroll-mt-chapter border-t border-black/5 bg-white lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-2xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            06 · Who uses them
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Made for everyone who touches the brand.
          </h2>
          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            The identity should not depend on the original designer being there to
            explain it.
          </p>
        </div>

        <ul className="mt-14 columns-1 gap-x-12 sm:columns-2 md:columns-2">
          {USERS.map((user, index) => (
            <li
              key={user}
              className="mb-0 flex items-baseline justify-between gap-6 border-t border-black/10 py-4"
            >
              <span className="font-serif text-2xl tracking-tight text-black md:text-3xl">
                {user}
              </span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-neutral-400">
                {String(index + 1).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
