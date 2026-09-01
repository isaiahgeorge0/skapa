"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { key: "", label: "Overview" },
  { key: "tasks", label: "Tasks" },
  { key: "documents", label: "Documents" },
  { key: "messages", label: "Messages" },
  { key: "notes", label: "Notes" },
];

export default function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/admin/projects/${projectId}`;

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-neutral-200">
      {TABS.map((tab) => {
        const href = tab.key ? `${base}/${tab.key}` : base;
        const active = pathname === href;
        return (
          <Link
            key={tab.key}
            href={href}
            className={`shrink-0 border-b-2 px-4 py-3 font-mono text-xs uppercase tracking-[0.08em] transition-colors ${
              active
                ? "border-black text-black"
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
