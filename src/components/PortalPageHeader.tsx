/**
 * Page-level heading for portal project tabs (not the overview, whose hero is its header).
 * Sits under the project <h1>, so the title is an <h2>.
 */
export default function PortalPageHeader({
  eyebrow,
  title,
  intro,
  meta,
  action,
}: {
  eyebrow?: string;
  title: string;
  intro?: React.ReactNode;
  /** Short facts under the intro, e.g. "3 requests". */
  meta?: React.ReactNode;
  /** Right-aligned on sm+, full width below the intro on mobile. */
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 border-b border-black/[0.06] pb-6 sm:mb-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-portal-accent">
              {eyebrow}
            </p>
          ) : null}
          <h2
            className={`text-balance break-words font-serif text-3xl leading-[1.05] tracking-tight text-black sm:text-4xl ${
              eyebrow ? "mt-2" : ""
            }`}
          >
            {title}
          </h2>
          <span aria-hidden="true" className="mt-4 block h-[3px] w-10 rounded-full bg-portal-accent" />
          {intro ? (
            <div className="mt-4 max-w-prose text-base leading-relaxed text-neutral-600">{intro}</div>
          ) : null}
          {meta ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">
              {meta}
            </div>
          ) : null}
        </div>
        {action ? (
          <div className="w-full sm:w-auto sm:shrink-0 [&>a]:block [&>a]:w-full [&>a]:text-center [&>button]:w-full sm:[&>a]:w-auto sm:[&>button]:w-auto">
            {action}
          </div>
        ) : null}
      </div>
    </header>
  );
}
