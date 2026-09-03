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
  { bg: "#4b4ae4", fg: "#efeeea", muted: "rgba(239,238,234,0.82)" },
  { bg: "#ff2791", fg: "#ffffff", muted: "rgba(255,255,255,0.86)" },
] as const;

const FAQS = [
  {
    q: "What are brand guidelines?",
    a: "Brand guidelines are the practical reference that explains how a brand should look and sound. They turn creative decisions into clear rules for logo, colour, type, imagery, tone of voice and application.",
  },
  {
    q: "What is included in brand guidelines?",
    a: "Typically: logo rules, colour specifications, typography, visual direction, graphic language, tone of voice, application examples and organised access to the files people need.",
  },
  {
    q: "Do I need brand guidelines?",
    a: "If more than one person is using the brand, guidelines quickly earn their place. They reduce inconsistency, speed up production and stop the identity depending on whoever happens to remember the original rules.",
  },
  {
    q: "Can you create guidelines for an existing brand?",
    a: "Yes. We regularly document identities we didn't originally design, clarifying what already works and filling the gaps so the system is usable.",
  },
  {
    q: "What's the difference between brand identity and brand guidelines?",
    a: "Brand identity creates the visual and verbal system. Brand guidelines document that system so other people can apply it consistently. One builds it. The other makes it usable.",
  },
  {
    q: "Can guidelines include tone of voice?",
    a: "Yes. How the brand speaks is part of consistency. Guidelines can cover tone, messaging principles and practical writing direction alongside the visual rules.",
  },
  {
    q: "Are brand guidelines useful for small businesses?",
    a: "Especially so. Smaller teams often share brand work across freelancers, partners and internal staff. A clear reference keeps everything coherent without constant oversight.",
  },
  {
    q: "How are the guidelines delivered?",
    a: "As a polished, usable document with the specifications, examples and asset organisation your team needs. Format follows what will actually get used, not what looks impressive once and then gets ignored.",
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

    document.getElementById(`guidelines-faq-${nextIndex}`)?.focus();
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
      className="scroll-mt-chapter border-t border-black/5 bg-white lg:scroll-mt-0"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <div className="max-w-3xl">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            10 · Questions
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            Practical questions before you begin.
          </h2>
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
                    id={`guidelines-faq-${index}`}
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
                      className="mt-1 font-mono text-sm"
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
                        className="max-w-3xl px-0 pb-6 font-mono text-sm leading-relaxed md:px-5 md:text-base"
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
