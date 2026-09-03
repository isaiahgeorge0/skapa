"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { useReducedMotion } from "./useReducedMotion";

const FAQ_ACCENTS = [
  { bg: "#4b4ae4", fg: "#efeeea", muted: "rgba(239,238,234,0.82)" },
  { bg: "#ff2791", fg: "#ffffff", muted: "rgba(255,255,255,0.86)" },
  { bg: "#fff1a7", fg: "#111111", muted: "rgba(17,17,17,0.7)" },
  { bg: "#4b4ae4", fg: "#efeeea", muted: "rgba(239,238,234,0.82)" },
  { bg: "#ff2791", fg: "#ffffff", muted: "rgba(255,255,255,0.86)" },
  { bg: "#fff1a7", fg: "#111111", muted: "rgba(17,17,17,0.7)" },
] as const;

const FAQS = [
  {
    q: "What's the difference between logo design and brand identity?",
    a: "Logo design focuses on the mark itself: symbol, wordmark, lockups and the files you need to use them. Brand identity covers the wider visual system around it, including typography, colour, imagery and graphic language.",
  },
  {
    q: "Can you improve an existing logo rather than starting again?",
    a: "Often yes. If the mark still has recognition and the idea is sound, refinement can be more valuable than reinvention. We assess what still works, what creates friction, and how much change is actually needed.",
  },
  {
    q: "What files do we get?",
    a: "Primary and secondary lockups, the logo mark, colour and black-and-white versions, plus digital and print-ready formats such as SVG, PDF and PNG, with clear usage guidance.",
  },
  {
    q: "Where can the logo be used?",
    a: "A well-built logo should work across digital, print, signage, social, packaging and small applications like favicons. We stress-test the mark against those conditions during the design process.",
  },
  {
    q: "How involved are we in the process?",
    a: "You're involved in the decisions that matter: direction, shortlisting and refinement. We handle the exploration and craft, then bring you clear options rather than an unfinished pile of sketches.",
  },
  {
    q: "What if we need wider branding afterwards?",
    a: "Logo design can stand alone, or sit as the starting point for a fuller brand identity. If the work expands into typography, colour systems and applications, we can continue into that next stage.",
  },
] as const;

export default function ChapterQuestions() {
  const { reducedMotion } = useReducedMotion();
  const [hoveredFaq, setHoveredFaq] = useState<number | null>(null);
  const [pinnedFaq, setPinnedFaq] = useState<number | null>(0);

  function canHover() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches
    );
  }

  function isOpen(index: number) {
    if (hoveredFaq !== null) return hoveredFaq === index;
    return pinnedFaq === index;
  }

  function pinFaq(index: number) {
    setPinnedFaq((current) => (current === index ? null : index));
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pinFaq(index);
      return;
    }

    let nextIndex = index;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      nextIndex = (index + 1) % FAQS.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      nextIndex = (index - 1 + FAQS.length) % FAQS.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = FAQS.length - 1;
    } else {
      return;
    }

    document.getElementById(`logo-faq-${nextIndex}`)?.focus();
    setPinnedFaq(nextIndex);
  }

  function onPointerEnter(event: PointerEvent<HTMLDivElement>, index: number) {
    if (reducedMotion) return;
    if (!canHover()) return;
    if (event.pointerType !== "mouse") return;
    setHoveredFaq(index);
  }

  return (
    <section
      id="questions"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-3xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            09 · Questions
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Practical questions before you begin.
          </h2>
          <p className="mt-5 font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            Logo design sits close to identity and strategy. These are the
            questions teams usually want answered early.
          </p>
        </div>

        <div
          className="mt-12"
          onMouseLeave={() => {
            if (canHover()) setHoveredFaq(null);
          }}
        >
          {FAQS.map((faq, index) => {
            const open = isOpen(index);
            const accent = FAQ_ACCENTS[index % FAQ_ACCENTS.length];
            return (
              <div
                key={faq.q}
                className="border-t border-black/10"
                onPointerEnter={(event) => onPointerEnter(event, index)}
              >
                <div className="relative overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 origin-top transition-transform duration-300 ease-out"
                    style={{
                      backgroundColor: accent.bg,
                      transform: open ? "scaleY(1)" : "scaleY(0)",
                    }}
                  />

                  <button
                    id={`logo-faq-${index}`}
                    type="button"
                    aria-expanded={open}
                    onClick={() => pinFaq(index)}
                    onFocus={() => setHoveredFaq(index)}
                    onBlur={() => setHoveredFaq(null)}
                    onKeyDown={(event) => onKeyDown(event, index)}
                    className="relative z-10 flex w-full items-start justify-between gap-6 px-0 py-6 text-left outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 md:px-5"
                    style={{ color: open ? accent.fg : "#111111" }}
                  >
                    <span className="font-serif text-xl md:text-2xl">{faq.q}</span>
                    <span
                      aria-hidden="true"
                      className="mt-1 font-mono text-sm transition-opacity duration-300"
                      style={{ opacity: open ? 0.72 : 0.45 }}
                    >
                      {open ? "−" : "+"}
                    </span>
                  </button>

                  <div
                    className={`relative z-10 grid transition-[grid-template-rows] duration-300 ease-out ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className="max-w-3xl px-0 pb-6 font-mono text-sm leading-relaxed transition-opacity duration-300 md:px-5 md:text-base"
                        style={{
                          color: open ? accent.muted : "#525252",
                          opacity: open ? 1 : 0,
                        }}
                      >
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="border-t border-black/10" />
        </div>
      </div>
    </section>
  );
}
