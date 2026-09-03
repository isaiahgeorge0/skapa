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
    q: "How do I know if I need a rebrand?",
    a: "A rebrand becomes worth considering when the business has changed more than the brand has. That might mean a new audience, a broader offer, a different level of ambition, or an identity that now creates friction rather than confidence.",
  },
  {
    q: "What's the difference between a brand refresh and a rebrand?",
    a: "A refresh improves and sharpens what is already there. A rebrand changes more fundamental parts of how the business is presented, and sometimes how it is positioned. The right route depends on how far the company has moved.",
  },
  {
    q: "Do we have to change our logo?",
    a: "Not always. Sometimes the mark still has equity and the wider system needs reworking around it. Sometimes the logo is part of the problem. We assess it as one part of the whole, not as an automatic replacement.",
  },
  {
    q: "Can we keep parts of our existing identity?",
    a: "Yes. Good rebrands usually keep what is still useful. That might be recognition, a colour relationship, a tone of voice trait, or a visual habit people already trust. The aim is progress, not reinvention for its own sake.",
  },
  {
    q: "Does a rebrand include Brand Strategy?",
    a: "It often does, because strategy helps decide what should actually change and why. Some businesses need a full strategic reset. Others need lighter strategic clarity to guide the design work. Scope should fit the decision.",
  },
  {
    q: "Can Skapa redesign our website as part of the rebrand?",
    a: "Yes. Rebranding often carries directly into website structure, interface, content direction and launch materials. Keeping that work connected usually makes the transition clearer and more consistent.",
  },
  {
    q: "What happens to our existing brand assets?",
    a: "We review what still has value, what needs adaptation and what should be retired. Existing assets can often be phased, updated or repurposed so the rollout feels managed rather than abrupt.",
  },
  {
    q: "How long does a rebrand take?",
    a: "The timescale depends on the depth of change, the number of stakeholders, and how much rollout support is needed. A focused evolution moves differently from a broader transformation, so we scope timing around the actual job rather than a universal template.",
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

    document.getElementById(`rebrand-faq-${nextIndex}`)?.focus();
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
            10 · Questions
          </p>
          <h2 className="font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            The practical questions usually come next.
          </h2>
          <p className="mt-5 font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            A credible rebrand needs commercial judgment as well as design judgment. These
            are the questions we are usually helping teams work through early.
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
            const accent = FAQ_ACCENTS[index];
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
                    id={`rebrand-faq-${index}`}
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
