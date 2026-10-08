import Link from "next/link";
import PortalSection from "@/components/PortalSection";

export type PortalLatestItem = {
  id: string;
  title: string;
  meta: string;
  href: string;
};

export type PortalLatestGroup = {
  key: string;
  label: string;
  count: number;
  items: PortalLatestItem[];
  viewAllHref: string;
};

const MD_COLUMNS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

/** Flat "Latest" block on the portal overview; empty groups are dropped. */
export default function PortalLatest({ groups }: { groups: PortalLatestGroup[] }) {
  const visible = groups.filter((g) => g.count > 0 && g.items.length > 0);
  if (visible.length === 0) return null;

  return (
    <PortalSection tier={3} title="Latest">
      <div
        className={`divide-y divide-black/[0.06] md:grid md:gap-10 md:divide-y-0 ${
          MD_COLUMNS[visible.length] ?? "md:grid-cols-3"
        }`}
      >
        {visible.map((group) => (
          <div key={group.key} className="py-3 first:pt-0 last:pb-0 md:py-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-700">
                {group.label}
                <span className="text-neutral-400"> · {group.count}</span>
              </h3>
              <Link
                href={group.viewAllHref}
                className="inline-flex min-h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-portal-accent transition-opacity hover:opacity-80"
              >
                View all →
              </Link>
            </div>
            <ul className="divide-y divide-black/[0.04]">
              {group.items.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="group flex min-h-11 flex-col justify-center py-2.5"
                  >
                    <span className="line-clamp-2 break-words font-serif text-base leading-snug text-black group-hover:underline group-hover:decoration-dotted group-hover:underline-offset-4">
                      {item.title}
                    </span>
                    <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-400">
                      {item.meta}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PortalSection>
  );
}
