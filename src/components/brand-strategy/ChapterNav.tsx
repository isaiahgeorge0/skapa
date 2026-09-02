"use client";

import { useEffect, useRef, useState } from "react";
import { CHAPTERS, type ChapterId } from "./chapters";
import { useReducedMotion } from "./useReducedMotion";

export default function ChapterNav() {
  const { reducedMotion } = useReducedMotion();
  const [activeId, setActiveId] = useState<ChapterId>(CHAPTERS[0].id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = CHAPTERS.map((chapter) =>
      document.getElementById(chapter.id),
    ).filter(Boolean) as HTMLElement[];

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id as ChapterId);
        }
      },
      {
        rootMargin: "-20% 0px -45% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    const onPointer = (event: MouseEvent | TouchEvent) => {
      const root = mobileRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("touchstart", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("touchstart", onPointer);
    };
  }, [drawerOpen]);

  const activeIndex = CHAPTERS.findIndex((chapter) => chapter.id === activeId);
  const active = CHAPTERS[activeIndex] ?? CHAPTERS[0];
  const progress = (activeIndex + 1) / CHAPTERS.length;

  function goTo(id: ChapterId) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
    setDrawerOpen(false);
  }

  return (
    <>
      <nav
        aria-label="Page chapters"
        className="pointer-events-none fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 lg:block xl:right-8"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={`pointer-events-auto relative transition-[width,padding] duration-300 ease-out ${
            hovered ? "w-[220px] py-2" : "w-10 py-1"
          }`}
        >
          {/* Progress as typographic rule, not boxed UI chrome */}
          <div
            className="absolute top-3 bottom-3 left-[11px] w-px bg-black/10"
            aria-hidden="true"
          >
            <div
              className="origin-top transition-[height,background-color,width] duration-500 ease-out"
              style={{
                height: `${progress * 100}%`,
                background: active.accent,
                width: hovered ? 2 : 1,
              }}
            />
          </div>

          {hovered && (
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-full bg-bs-offwhite/95"
            />
          )}

          <ol className="relative space-y-4">
            {CHAPTERS.map((chapter, index) => {
              const isActive = chapter.id === activeId;
              return (
                <li key={chapter.id}>
                  <a
                    href={`#${chapter.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      goTo(chapter.id);
                    }}
                    className="group/item flex items-baseline gap-3 outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                    aria-current={isActive ? "true" : undefined}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.setProperty(
                        "--row-accent",
                        chapter.accent,
                      );
                    }}
                  >
                    <span
                      className={`w-6 font-mono text-[10px] tracking-[0.18em] transition-all duration-300 ${
                        isActive
                          ? "translate-x-0.5"
                          : "text-neutral-400 group-hover/item:text-neutral-700"
                      }`}
                      style={
                        isActive || hovered
                          ? {
                              color: isActive ? chapter.accent : undefined,
                            }
                          : undefined
                      }
                    >
                      <span className="group-hover/item:text-[color:var(--row-accent,#111)]">
                        {chapter.number}
                      </span>
                    </span>
                    <span
                      className={`overflow-hidden whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] transition-all duration-300 ${
                        hovered
                          ? "max-w-[160px] translate-x-0 opacity-100"
                          : "max-w-0 -translate-x-3 opacity-0"
                      } ${isActive ? "text-black" : "text-neutral-500"}`}
                    >
                      — {chapter.label}
                    </span>
                    <span className="sr-only">
                      {isActive
                        ? `, chapter ${index + 1} of ${CHAPTERS.length}, current`
                        : `, chapter ${index + 1} of ${CHAPTERS.length}`}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      {/*
        Mobile/tablet — compact centred pill under site chrome.
        Fixed (not full-width sticky) so it stays secondary to nav + hero.
      */}
      <div
        ref={mobileRef}
        className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 lg:hidden"
        style={{
          top: "calc(var(--skapa-site-chrome-height) + 0.5rem)",
        }}
      >
        <div className="pointer-events-auto relative">
          <button
            type="button"
            aria-expanded={drawerOpen}
            aria-controls="chapter-drawer"
            aria-label={`Chapter ${active.number} of ${CHAPTERS.length}: ${active.label}`}
            onClick={() => setDrawerOpen((open) => !open)}
            className="inline-flex max-w-[min(18.5rem,calc(100vw-5.5rem))] items-center gap-2 rounded-full border border-black/10 bg-bs-offwhite/95 py-2 pr-3 pl-3.5 shadow-sm backdrop-blur outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <span
              className="font-mono text-[10px] tracking-[0.16em]"
              style={{ color: active.accent }}
            >
              {active.number}
            </span>
            <span aria-hidden="true" className="font-mono text-[10px] text-black/25">
              /
            </span>
            <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-black">
              {active.short}
            </span>
            <span
              aria-hidden="true"
              className={`ml-0.5 font-mono text-[10px] text-neutral-500 transition-transform duration-300 ${
                drawerOpen ? "rotate-180" : ""
              }`}
            >
              ↓
            </span>
          </button>

          <div
            id="chapter-drawer"
            hidden={!drawerOpen}
            className="absolute top-full left-1/2 z-50 mt-2 w-[min(16.5rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-black/10 bg-bs-offwhite shadow-lg"
          >
            <ol className="py-1.5">
              {CHAPTERS.map((chapter) => {
                const isActive = chapter.id === activeId;
                return (
                  <li key={chapter.id}>
                    <a
                      href={`#${chapter.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        goTo(chapter.id);
                      }}
                      className={`flex items-center gap-3 px-3.5 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black ${
                        isActive ? "bg-white" : ""
                      }`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <span
                        className="w-5 font-mono text-[10px] tracking-[0.16em]"
                        style={{
                          color: isActive ? chapter.accent : "#737373",
                        }}
                      >
                        {chapter.number}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-black">
                        {chapter.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
