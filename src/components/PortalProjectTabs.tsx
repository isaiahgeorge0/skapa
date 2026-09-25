"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const scrollerRef = useRef<HTMLElement>(null);
  const [canScrollEnd, setCanScrollEnd] = useState(false);
  const [canScrollStart, setCanScrollStart] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function update() {
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      setCanScrollStart(el.scrollLeft > 2);
      setCanScrollEnd(max > 2 && el.scrollLeft < max - 2);
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return (
    <div className="relative -mx-5 px-5 sm:mx-0 sm:px-0">
      <nav
        ref={scrollerRef}
        aria-label="Project sections"
        className="flex gap-0.5 overflow-x-auto overscroll-x-contain border-b border-neutral-200 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-1"
      >
        {TABS.map((tab) => {
          const href = tab.key ? `${base}/${tab.key}` : base;
          const active = pathname === href;
          return (
            <Link
              key={tab.key || "overview"}
              href={href}
              className={`shrink-0 border-b-2 px-2.5 py-3 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors sm:px-4 sm:text-xs ${
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

      {/* Scroll affordance — only when more tabs exist off-screen */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-brand-cream to-transparent transition-opacity sm:hidden ${
          canScrollStart ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-brand-cream to-transparent transition-opacity sm:hidden ${
          canScrollEnd ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
