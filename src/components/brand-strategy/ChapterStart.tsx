"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";
import BrandStrategyButton from "./BrandStrategyButton";
import { useReducedMotion } from "./useReducedMotion";

export default function ChapterStart() {
  const { reducedMotion } = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (reducedMotion) return;
    if (event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  }

  function onPointerLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
  }

  return (
    <section
      id="start-somewhere"
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="scroll-mt-16 lg:scroll-mt-0"
      style={
        {
          "--mx": "0px",
          "--my": "0px",
        } as CSSProperties
      }
    >
      <div className="relative overflow-hidden bg-bs-purple">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute top-0 right-0 h-full w-[34%] bg-bs-pink transition-transform duration-500 ease-out"
            style={{
              transform: reducedMotion
                ? undefined
                : "translate3d(var(--mx), var(--my), 0)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 h-[28%] w-[42%] bg-bs-yellow transition-transform duration-500 ease-out"
            style={{
              transform: reducedMotion
                ? undefined
                : "translate3d(calc(var(--mx) * -0.6), calc(var(--my) * -0.5), 0)",
            }}
          />
          <div className="absolute top-[12%] left-[8%] hidden h-[18%] w-[12%] bg-bs-offwhite/15 md:block" />
          <div className="absolute inset-x-[10%] top-[42%] hidden h-px bg-bs-offwhite/20 md:block" />
          <div className="absolute inset-y-[18%] left-[48%] hidden w-px bg-bs-offwhite/15 md:block" />
          <div className="absolute right-[38%] bottom-[22%] font-serif text-[18vw] leading-none text-bs-offwhite/10 select-none md:text-[10vw]">
            B
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-bs-yellow">
            06 · Start somewhere
          </p>
          <h2 className="max-w-3xl font-serif text-4xl leading-snug tracking-tight text-bs-offwhite md:text-6xl">
            Know something needs to change, but not sure what yet?
          </h2>
          <div className="mt-10">
            <BrandStrategyButton href="/start" variant="on-colour">
              Let’s figure it out
            </BrandStrategyButton>
          </div>

          <ul
            aria-hidden="true"
            className="mt-16 hidden flex-wrap gap-3 md:flex"
          >
            {[
              "Audience",
              "Ambition",
              "Business",
              "Competition",
              "Perception",
              "Purpose",
            ].map((label, i) => (
              <li
                key={label}
                className="border border-bs-offwhite/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bs-offwhite/80"
                style={{
                  background:
                    i % 3 === 0 ? "rgba(255,39,145,0.25)" : "transparent",
                }}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
