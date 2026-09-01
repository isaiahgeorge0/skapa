"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

type Project = { id: string; name: string };

export default function PortalSidebar({
  clientName,
  projects,
}: {
  clientName: string;
  projects: Project[];
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between border-r border-neutral-200 px-5 py-8">
      <div>
        <Link href="/portal" className="mb-1 block font-serif text-xl text-black">
          skapa <span className="italic text-brand-pink">Creative</span>
        </Link>
        <p className="mb-8 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
          Client Portal
        </p>

        <Link
          href="/portal"
          className={`mb-6 block rounded-lg px-3 py-2 font-mono text-xs uppercase tracking-[0.08em] transition-colors ${
            pathname === "/portal"
              ? "bg-black text-white"
              : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
          }`}
        >
          Overview
        </Link>

        {projects.length > 0 && (
          <>
            <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              Your projects
            </p>
            <nav className="space-y-1">
              {projects.map((p) => {
                const href = `/portal/projects/${p.id}`;
                const active = pathname === href;
                return (
                  <Link
                    key={p.id}
                    href={href}
                    className={`block truncate rounded-lg px-3 py-2 font-sans text-sm transition-colors ${
                      active
                        ? "bg-black text-white"
                        : "text-neutral-700 hover:bg-neutral-100 hover:text-black"
                    }`}
                  >
                    {p.name}
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </div>

      <div>
        <p className="mb-2 truncate font-mono text-xs text-neutral-500">{clientName}</p>
        <form action={logout}>
          <button className="font-mono text-xs uppercase tracking-widest text-neutral-400 transition-colors hover:text-black">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
