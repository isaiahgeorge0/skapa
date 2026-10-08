/**
 * Portal content block with two-tier rhythm:
 * - Tight gap from heading → body (one connected unit)
 * - Large gap between sections comes from the parent `PortalSectionStack`
 *
 * `tier` sets visual weight (heading rank follows it):
 * - 1 (action): tinted accent card, the only tinted block on a page. Children
 *   render edge to edge inside it, so rows own their horizontal padding.
 * - 2 (status): serif heading with accent rule, white raised card around the children.
 * - 3 (reference): flat block, small mono label, hairline above, no card.
 * - default: the tier 2 heading without the card.
 */
export default function PortalSection({
  title,
  intro,
  children,
  className = "",
  tier,
  count,
  action,
}: {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  tier?: 1 | 2 | 3;
  /** Tier 1 header badge. */
  count?: number;
  /** Tier 3 header link (e.g. "View all →"). */
  action?: React.ReactNode;
}) {
  if (tier === 1) {
    return (
      <section
        className={`surface-radius overflow-hidden border-l-[3px] border-portal-accent bg-portal-tint ${className}`}
      >
        <header className="px-4 pb-3 pt-4 sm:px-6 sm:pt-5">
          <div className="flex items-center gap-3">
            <h2 className="text-balance font-serif text-xl tracking-tight text-black sm:text-2xl">
              {title}
            </h2>
            {count !== undefined ? (
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-portal-accent px-2 font-mono text-[11px] tabular-nums text-white">
                {count}
              </span>
            ) : null}
          </div>
          {intro ? <div className="mt-1 text-sm text-neutral-600">{intro}</div> : null}
        </header>
        <div>{children}</div>
      </section>
    );
  }

  if (tier === 3) {
    return (
      <section className={`border-t border-black/[0.06] pt-4 ${className}`}>
        <header className="mb-1 flex items-center justify-between gap-3">
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-600">
            {title}
          </h2>
          {action}
        </header>
        {intro ? <div className="mb-2 text-sm text-neutral-600">{intro}</div> : null}
        <div>{children}</div>
      </section>
    );
  }

  return (
    <section className={className}>
      <header className="mb-4">
        <h2 className="text-balance font-serif text-2xl tracking-tight text-black md:text-[1.75rem]">
          {title}
        </h2>
        <span aria-hidden="true" className="mt-2.5 block h-[2px] w-8 bg-portal-accent" />
        {intro ? <div className="mt-3 text-sm text-neutral-600">{intro}</div> : null}
      </header>
      {tier === 2 ? (
        <div className="surface-raised px-4 py-4 sm:px-6 sm:py-5">{children}</div>
      ) : (
        <div>{children}</div>
      )}
    </section>
  );
}

/** Vertical stack: large gaps between sibling sections (tighter on mobile). */
export function PortalSectionStack({
  children,
  className = "",
  density = "default",
}: {
  children: React.ReactNode;
  className?: string;
  /** "compact" tightens the rhythm for pages with many short sections. */
  density?: "default" | "compact";
}) {
  const gap =
    density === "compact"
      ? "gap-8 sm:gap-10 md:gap-14 lg:gap-20"
      : "gap-10 sm:gap-14 md:gap-20 lg:gap-24";
  return <div className={`flex flex-col ${gap} ${className}`}>{children}</div>;
}
