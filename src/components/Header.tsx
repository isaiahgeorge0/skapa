"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/what-we-do", label: "What We Do" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

const SCROLL_THRESHOLD = 80;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const isScrolled = window.scrollY > SCROLL_THRESHOLD;
        setScrolled(isScrolled);
        if (!isScrolled) setMenuOpen(false);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Full header bar — visible only at the top of the page */}
      <header
        className={`sticky top-0 z-50 w-full border-b border-neutral-200 bg-white transition-opacity duration-300 ease-out ${
          scrolled ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-hidden={scrolled}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-6 md:px-10">
          <Link href="/" className="font-serif text-2xl tracking-tight text-black">
            skapa <span className="italic text-brand-pink">Creative</span>
          </Link>
          <nav aria-label="Primary">
            <ul className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 whitespace-nowrap">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-700 transition-colors hover:text-black"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Floating logo — independent element, only visible once scrolled */}
      <Link
        href="/"
        onClick={() => setMenuOpen(false)}
        className={`fixed left-4 top-4 z-50 rounded-full bg-white/90 px-4 py-2 font-serif text-lg tracking-tight text-black shadow-sm backdrop-blur transition-opacity duration-300 ease-out md:left-6 md:top-6 ${
          scrolled ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!scrolled}
      >
        skapa <span className="italic text-brand-pink">Creative</span>
      </Link>

      {/* Floating menu toggle — independent element, only visible once scrolled */}
      <div
        className={`fixed right-4 top-4 z-50 md:right-6 md:top-6 transition-opacity duration-300 ease-out ${
          scrolled ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!scrolled}
      >
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="relative flex h-11 w-11 items-center justify-center gap-[5px] rounded-full bg-white/90 shadow-sm backdrop-blur"
        >
          <span className="sr-only">Menu</span>
          <div className="flex flex-col items-center justify-center gap-[5px]">
            <span
              className={`block h-[1.5px] w-5 bg-black transition-transform duration-300 ease-out ${
                menuOpen ? "translate-y-[6.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] w-5 bg-black transition-transform duration-300 ease-out ${
                menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>

        <div
          className={`absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg transition-[max-height,opacity] duration-300 ease-out ${
            menuOpen ? "max-h-80 opacity-100" : "pointer-events-none max-h-0 opacity-0"
          }`}
        >
          <ul className="flex flex-col gap-1 p-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 font-mono text-xs uppercase tracking-[0.08em] text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
