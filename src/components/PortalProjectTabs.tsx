"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { key: "", label: "Overview" },
  { key: "documents", label: "Documents" },
  { key: "messages", label: "Messages" },
  { key: "requests", label: "Requests" },
  { key: "details", label: "Details" },
];

export default function PortalProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/portal/projects/${projectId}`;

  return (
    <nav
      aria-label="Project sections"
      className="flex gap-1 overflow-x-auto border-b border-neutral-200 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((tab) => {
        const href = tab.key ? `${base}/${tab.key}` : base;
        const active = pathname === href;
        return (
          <Link
            key={tab.key || "overview"}
            href={href}
            className={`shrink-0 border-b-2 px-3 py-3 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors sm:px-4 sm:text-xs ${
              active
                ? "border-portal-accent text-black"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
