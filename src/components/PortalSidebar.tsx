"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = (
    <>
      <Link
        href="/portal"
        onClick={() => setMenuOpen(false)}
        className={`mb-6 flex items-center gap-2.5 font-serif text-lg transition-colors md:mb-8 ${
          pathname === "/portal" ? "text-black" : "text-neutral-400 hover:text-black"
        }`}
      >
        {pathname === "/portal" && (
          <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-portal-accent" />
        )}
        Overview
      </Link>

      {projects.length > 0 && (
        <nav className="space-y-1">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
            Projects
          </p>
          {projects.map((p) => {
            const href = `/portal/projects/${p.id}`;
            const active = pathname === href;
            return (
              <Link
                key={p.id}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2.5 truncate py-1.5 font-serif text-base transition-colors ${
                  active ? "text-black" : "text-neutral-500 hover:text-black"
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-portal-accent"
                  />
                )}
                {p.name}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );

  const account = (
    <div>
      <p className="mb-2 truncate font-mono text-xs text-neutral-500">{clientName}</p>
      <form action={logout}>
        <button className="font-mono text-xs text-neutral-400 transition-colors hover:text-black">
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-4 md:hidden">
        <Link href="/portal" className="font-serif text-lg text-black">
          skapa <span className="italic text-brand-pink">Creative</span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="font-mono text-xs text-neutral-600"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-white px-5 pb-8 pt-20 md:hidden">
          {nav}
          <div className="mt-10">{account}</div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-neutral-200 px-5 py-8 md:flex lg:w-64">
        <div>
          <Link href="/portal" className="mb-1 block font-serif text-xl text-black">
            skapa <span className="italic text-brand-pink">Creative</span>
          </Link>
          <p className="mb-10 font-mono text-[11px] text-neutral-400">Client portal</p>
          {nav}
        </div>
        {account}
      </aside>
    </>
  );
}
