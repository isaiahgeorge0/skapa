"use client";

import {
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useRef,
} from "react";
import Link from "next/link";
import IdentityButton from "./IdentityButton";
import { useReducedMotion } from "./useReducedMotion";

const FAQ_ACCENTS = [
  { bg: "#4b4ae4", fg: "#efeeea", muted: "rgba(239,238,234,0.8)" },
  { bg: "#ff2791", fg: "#ffffff", muted: "rgba(255,255,255,0.85)" },
  { bg: "#fff1a7", fg: "#111111", muted: "rgba(17,17,17,0.7)" },
  { bg: "#4b4ae4", fg: "#efeeea", muted: "rgba(239,238,234,0.8)" },
  { bg: "#ff2791", fg: "#ffffff", muted: "rgba(255,255,255,0.85)" },
  { bg: "#fff1a7", fg: "#111111", muted: "rgba(17,17,17,0.7)" },
] as const;

const FAQS = [
  {
    q: "Is brand identity more than a logo?",
    a: "Yes. A logo is one ingredient. Brand identity is the full visual system: typography, colour, imagery, graphic language, motion where useful, and how those elements behave across applications.",
  },
  {
    q: "How does Brand Strategy feed into Brand Identity?",
    a: "Strategy decides what the brand should mean, who it is for, and how it should communicate. Identity turns that direction into recognisable visual expression. Strategy provides the brief; identity gives it form.",
  },
  {
    q: "Can skapa work with an existing logo or brand?",
    a: "Yes. Sometimes the mark is strong and the system around it needs building. Sometimes both need evolving. We start from what already exists and decide what should stay, change or be replaced.",
  },
  {
    q: "What do I receive at the end?",
    a: "A usable visual identity system tailored to the project. Typically this covers logo/mark usage, typography, colour, graphic language and application direction. Brand guidelines can be included or developed as a next step.",
  },
  {
    q: "Does the identity work across digital and print?",
    a: "That is the point of a system. We design for the contexts the brand actually needs (website, social, presentations, print, signage and beyond), so recognition holds wherever it appears.",
  },
  {
    q: "Can skapa create the website and other applications afterwards?",
    a: "Yes. Identity often leads into website, social, campaign and wider creative work, so the thinking and the making stay connected.",
  },
] as const;

const RELATED = [
  {
    title: "Brand Strategy",
    body: "Clarify what the brand should mean before it gets a look.",
    href: "/what-we-do/brand/brand-strategy" as string | null,
  },
  {
    title: "Logo Design",
    body: "Go deeper into marks, wordmarks, lockups and versatility.",
    href: "/what-we-do/brand/logo-design" as string | null,
  },
  {
    title: "Brand Guidelines",
    body: "Document the system so teams and suppliers can use it consistently.",
    href: "/what-we-do/brand/brand-guidelines" as string | null,
  },
  {
    title: "Rebranding",
    body: "When the business has moved on and the identity needs to catch up.",
    href: "/what-we-do/brand/rebranding" as string | null,
  },
] as const;

export default function ChapterImagine() {
  const { reducedMotion } = useReducedMotion();
  // Hover preview vs click/keyboard pin — so desktop hover never fights click.
  const [hoveredFaq, setHoveredFaq] = useState<number | null>(null);
  const [pinnedFaq, setPinnedFaq] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  function canHover() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches
    );
  }

  function isFaqOpen(index: number) {
    if (hoveredFaq !== null) return hoveredFaq === index;
    return pinnedFaq === index;
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    if (event.pointerType !== "mouse") return;
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  }

  function onPointerLeave() {
    const el = heroRef.current;
    if (!el) return;
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
  }

  function pinFaq(index: number) {
    setPinnedFaq((current) => (current === index ? null : index));
  }

  function onFaqKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pinFaq(index);
    }
  }

  return (
    <section
      id="now-imagine-yours"
      className="scroll-mt-chapter lg:scroll-mt-0"
    >
      <div
        ref={heroRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative overflow-hidden bg-bs-purple"
        style={
          {
            "--mx": "0px",
            "--my": "0px",
          } as CSSProperties
        }
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute top-0 right-0 h-full w-[32%] bg-bs-pink transition-transform duration-500 ease-out"
            style={{
              transform: reducedMotion
                ? undefined
                : "translate3d(var(--mx), var(--my), 0)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 h-[22%] w-[40%] bg-bs-yellow transition-transform duration-500 ease-out md:h-[26%] md:w-[36%]"
            style={{
              transform: reducedMotion
                ? undefined
                : "translate3d(calc(var(--mx) * -0.5), calc(var(--my) * -0.4), 0)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-chapter-safe pb-20 md:px-10 md:py-32 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-bs-yellow">
            07 · Now imagine yours
          </p>
          <h2 className="max-w-3xl font-serif text-4xl leading-snug tracking-tight text-bs-offwhite md:text-6xl">
            Yours shouldn&apos;t look like ours.
          </h2>
          {/* Body stays on purple; CTAs may sit near yellow and use high-contrast treatments */}
          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-bs-offwhite/85 md:text-base">
            It should feel just as considered. Just as recognisable. Built for
            your business, not a house style applied to every client.
          </p>
          <div className="relative z-10 mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <IdentityButton href="/start" variant="on-colour">
              Start a project
            </IdentityButton>
            <Link
              href="/what-we-do/brand/brand-strategy"
              className="inline-flex w-fit bg-black px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-bs-offwhite transition-colors hover:bg-bs-offwhite hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-bs-yellow"
            >
              Or begin with Brand Strategy
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-black/5 bg-bs-offwhite">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            What you get
          </p>
          <h3 className="max-w-2xl font-serif text-3xl leading-snug text-black md:text-4xl">
            A complete visual identity system, not a logo file and a hope.
          </h3>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              "Logo / mark development and usage",
              "Typography system",
              "Colour system",
              "Graphic language",
              "Imagery / art direction principles",
              "Application direction across key contexts",
              "Optional brand guidelines",
              "A clear path into website, social and wider creative",
            ].map((item) => (
              <li
                key={item}
                className="border-t border-black/10 pt-4 font-mono text-sm text-neutral-700"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-20 border-t border-black/10 pt-14">
            <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Questions
            </p>
            <div
              onMouseLeave={() => {
                if (canHover()) setHoveredFaq(null);
              }}
            >
              {FAQS.map((faq, index) => {
                const open = isFaqOpen(index);
                const accent = FAQ_ACCENTS[index];
                return (
                  <div
                    key={faq.q}
                    className="border-t border-black/10"
                    onMouseEnter={() => {
                      if (canHover()) setHoveredFaq(index);
                    }}
                  >
                    {/*
                      Colour field and answer share one height animation so the
                      expansion reads as a single composed reveal, not a bg flash.
                    */}
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
                        type="button"
                        aria-expanded={open}
                        onClick={() => pinFaq(index)}
                        onKeyDown={(event) => onFaqKeyDown(event, index)}
                        className="relative z-10 flex w-full items-start justify-between gap-6 px-0 py-6 text-left outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 md:px-5"
                        style={{ color: open ? accent.fg : "#111111" }}
                      >
                        <span className="font-serif text-xl md:text-2xl">
                          {faq.q}
                        </span>
                        <span
                          className="mt-1 font-mono text-sm transition-opacity duration-300"
                          style={{ opacity: open ? 0.7 : 0.45 }}
                          aria-hidden="true"
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
                            className="max-w-2xl px-0 pb-6 font-mono text-sm leading-relaxed transition-opacity duration-300 md:px-5"
                            style={{
                              color: accent.muted,
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
            </div>
          </div>

          <div className="mt-20 border-t border-black/10 pt-14">
            <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Related
            </p>
            <ul className="grid gap-6 md:grid-cols-2">
              {RELATED.map((item) => (
                <li key={item.title} className="border border-black/10 p-6">
                  {item.href ? (
                    <Link href={item.href} className="group block outline-none">
                      <h3 className="font-serif text-2xl text-black transition-colors group-hover:text-bs-purple">
                        {item.title}
                      </h3>
                      <p className="mt-3 font-mono text-sm leading-relaxed text-neutral-600">
                        {item.body}
                      </p>
                      <span className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400 group-hover:text-black">
                        Explore →
                      </span>
                    </Link>
                  ) : (
                    <div>
                      <h3 className="font-serif text-2xl text-black">
                        {item.title}
                      </h3>
                      <p className="mt-3 font-mono text-sm leading-relaxed text-neutral-600">
                        {item.body}
                      </p>
                      <span className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400">
                        Coming soon
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
