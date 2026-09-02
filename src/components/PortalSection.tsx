import PortalSectionHeading from "@/components/PortalSectionHeading";

/**
 * Portal content block with two-tier rhythm:
 * - Tight gap from heading → body (one connected unit)
 * - Large gap between sections comes from the parent `.portal-section-stack`
 */
export default function PortalSection({
  title,
  titleSize = "md",
  intro,
  children,
  className = "",
}: {
  title: string;
  titleSize?: "sm" | "md";
  intro?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <header className="mb-3 md:mb-3.5">
        <PortalSectionHeading size={titleSize}>{title}</PortalSectionHeading>
        {intro ? <div className="mt-1.5 pl-[22px]">{intro}</div> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}

/** Vertical stack: large gaps between sibling sections. */
export function PortalSectionStack({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-16 sm:gap-[4.5rem] md:gap-20 lg:gap-24 ${className}`}
    >
      {children}
    </div>
  );
}
