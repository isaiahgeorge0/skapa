import Link from "next/link";
import type { ProjectAlert } from "@/lib/project-alerts";

export default function ProjectAlertsRow({
  alerts,
}: {
  alerts: ProjectAlert[];
}) {
  if (alerts.length === 0) {
    return (
      <div className="surface-raised-soft px-6 py-5 md:px-7 md:py-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
          Needs attention
        </p>
        <p className="mt-2 font-serif text-lg text-black">All quiet on this project.</p>
        <p className="mt-1 text-sm text-neutral-500">
          Requests, unviewed documents and approaching targets will show here.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-raised">
      <div className="border-b border-black/[0.04] px-6 py-4 md:px-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
          Needs attention
        </p>
      </div>
      <ul className="divide-y divide-black/[0.04]">
        {alerts.map((alert) => (
          <li key={alert.id}>
            <Link
              href={alert.href}
              className="flex items-baseline justify-between gap-4 px-6 py-4 transition-colors hover:bg-black/[0.02] md:px-7"
            >
              <span className="font-serif text-base text-black">{alert.text}</span>
              <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                Open →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
