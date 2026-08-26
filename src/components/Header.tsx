import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/what-we-do", label: "What We Do" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export default function Header() {
  return (
    <header className="w-full border-b border-neutral-200">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-8 px-6 py-6 md:px-10">
        <Link href="/" className="font-serif text-2xl tracking-tight text-black">
          skapa{" "}
          <span className="italic text-brand-pink">Creative</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-700 transition-colors hover:text-black"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
