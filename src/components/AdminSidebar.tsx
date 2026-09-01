"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import GlobalSearch from "@/components/GlobalSearch";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/projects", label: "Projects" },
];

export default function AdminSidebar({
  adminName,
}: {
  adminName?: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col justify-between border-r border-neutral-200 px-5 py-8">
      <div>
        <Link
          href="/admin"
          className="mb-8 block font-serif text-xl text-black"
        >
          skapa <span className="italic text-brand-pink">Creative</span>
        </Link>

        <div className="mb-6">
          <GlobalSearch />
        </div>

        <nav className="space-y-1">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 font-mono text-xs uppercase tracking-[0.08em] transition-colors ${
                  active
                    ? "bg-black text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        {adminName && (
          <p className="mb-2 font-mono text-xs text-neutral-500">{adminName}</p>
        )}
        <form action={logout}>
          <button className="font-mono text-xs uppercase tracking-widest text-neutral-400 transition-colors hover:text-black">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
