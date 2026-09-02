"use client";

import { useEffect, useState } from "react";
import { CHAPTERS, type ChapterId } from "./chapters";
import { useReducedMotion } from "./useReducedMotion";

export default function ChapterNav() {
  const { reducedMotion } = useReducedMotion();
  const [activeId, setActiveId] = useState<ChapterId>(CHAPTERS[0].id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
                              color: isActive
                                ? chapter.accent
                                : undefined,
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

      <div className="sticky top-0 z-40 border-b border-black/10 bg-bs-offwhite/95 backdrop-blur lg:hidden">
        <button
          type="button"
          aria-expanded={drawerOpen}
          aria-controls="chapter-drawer"
          onClick={() => setDrawerOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 px-6 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black"
        >
          <span
            className="font-mono text-[10px] tracking-[0.16em]"
            style={{ color: active.accent }}
          >
            {active.number} / 06
          </span>
          <span className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-black">
            {active.label}
          </span>
          <span
            aria-hidden="true"
            className={`font-mono text-xs text-neutral-500 transition-transform duration-300 ${
              drawerOpen ? "rotate-180" : ""
            }`}
          >
            ↓
          </span>
        </button>

        <div
          id="chapter-drawer"
          hidden={!drawerOpen}
          className="border-t border-black/10 bg-bs-offwhite"
        >
          <ol className="px-2 py-2">
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
                    className={`flex items-center gap-4 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black ${
                      isActive ? "bg-white" : ""
                    }`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span
                      className="font-mono text-[10px] tracking-[0.16em]"
                      style={{ color: isActive ? chapter.accent : "#737373" }}
                    >
                      {chapter.number}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.12em] text-black">
                      {chapter.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </>
  );
}
