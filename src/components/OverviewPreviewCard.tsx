import Link from "next/link";

export type OverviewPreviewItem = {
  id: string;
  title: string;
  meta?: string | null;
};

export default function OverviewPreviewCard({
  title,
  countLabel,
  href,
  items,
  empty,
  tone = "admin",
}: {
  title: string;
  countLabel: string;
  href: string;
  items: OverviewPreviewItem[];
  empty: string;
  tone?: "admin" | "portal";
}) {
  const viewClass =
    tone === "portal"
      ? "font-mono text-[11px] uppercase tracking-[0.14em] text-portal-accent transition-opacity hover:opacity-80"
      : "font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-600 underline decoration-dotted hover:text-black";

  return (
    <section className="surface-raised">
      <div className="flex items-baseline justify-between gap-3 border-b border-black/[0.04] px-6 py-5 md:px-7 md:py-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
            {title}
          </p>
          <p className="mt-1.5 font-serif text-xl tracking-tight text-black">
            {countLabel}
          </p>
        </div>
        <Link href={href} className={viewClass}>
          View →
        </Link>
      </div>
      <div className="px-6 py-5 md:px-7 md:py-6">
        {items.length === 0 ? (
          <p className="font-mono text-sm text-neutral-400">{empty}</p>
        ) : (
          <ul className="divide-y divide-black/[0.04]">
            {items.map((item) => (
              <li key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                <p className="font-serif text-base text-black">{item.title}</p>
                {item.meta ? (
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-400">
                    {item.meta}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
