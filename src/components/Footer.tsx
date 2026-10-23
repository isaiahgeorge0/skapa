import Image from "next/image";
import Link from "next/link";
import { SkapaSignature } from "@/components/brand/Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/what-we-do", label: "What We Do" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="bg-brand-blue">
        <div className="site-container flex flex-col gap-10 py-12 md:flex-row md:items-end md:justify-between md:gap-16 md:py-14">
          <div>
            <Link href="/" aria-label="Skapa Creative, home" className="inline-flex">
              <SkapaSignature tone="cream" alt="" className="h-16" />
            </Link>
            <Image
              src="/brand/name-location/skapa-name-location-cream.svg"
              alt="Skapa Creative, Ipswich, UK"
              width={3398}
              height={980}
              unoptimized
              className="mt-4 h-10 w-auto"
            />
          </div>
          <div className="flex flex-col gap-6 md:items-end">
            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-cream transition-opacity hover:opacity-70"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-brand-cream/70">
              © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
