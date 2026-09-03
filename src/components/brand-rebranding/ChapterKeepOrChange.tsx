"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useReducedMotion } from "./useReducedMotion";

const TOKENS = [
  {
    key: "logo",
    label: "LOGO",
    note: "Keep the equity if the symbol still carries recognition.",
  },
  {
    key: "colour",
    label: "COLOUR",
    note: "Shift tone and contrast before replacing everything.",
  },
  {
    key: "type",
    label: "TYPE",
    note: "Typography often does more repositioning than a new mark.",
  },
  {
    key: "voice",
    label: "VOICE",
    note: "Language can mature without sounding unfamiliar.",
  },
  {
    key: "imagery",
    label: "IMAGERY",
    note: "Art direction usually reveals the new ambition first.",
  },
  {
    key: "positioning",
    label: "POSITIONING",
    note: "Some shifts are strategic, not visual.",
  },
  {
    key: "messaging",
    label: "MESSAGING",
    note: "Clarify the offer before polishing the headline.",
  },
  {
    key: "digital",
    label: "DIGITAL",
    note: "The website and product layer prove the system in use.",
  },
] as const;

const STATES = [
  {
    key: "keep",
    label: "KEEP",
    description: "Keep what still holds value and recognition.",
    chipClass: "border-neutral-300 bg-bs-offwhite text-black",
  },
  {
    key: "evolve",
    label: "EVOLVE",
    description: "Refine it so the business can grow without losing continuity.",
    chipClass: "border-bs-yellow bg-bs-yellow text-black",
  },
  {
    key: "rethink",
    label: "RETHINK",
    description: "Reconsider it fully when it points in the wrong direction.",
    chipClass: "border-bs-pink bg-bs-pink text-white",
  },
] as const;

type StateKey = (typeof STATES)[number]["key"];
type TokenKey = (typeof TOKENS)[number]["key"];

const DEFAULT_ASSIGNMENT: Record<TokenKey, StateKey> = {
  logo: "keep",
  colour: "evolve",
  type: "evolve",
  voice: "evolve",
  imagery: "rethink",
  positioning: "rethink",
  messaging: "evolve",
  digital: "rethink",
};

function getStateMeta(key: StateKey) {
  return STATES.find((state) => state.key === key)!;
}

function getCount(assignment: Record<TokenKey, StateKey>, key: StateKey) {
  return Object.values(assignment).filter((value) => value === key).length;
}

/* ─── accent colour for mobile card edges ─── */
function stateAccent(key: StateKey): string {
  if (key === "evolve") return "border-l-bs-yellow";
  if (key === "rethink") return "border-l-bs-pink";
  return "border-l-neutral-300";
}

/* ─── mobile scroll-driven card ─── */
function MobileCard({
  token,
  assignment,
  index,
  progress,
}: {
  token: (typeof TOKENS)[number];
  assignment: StateKey;
  index: number;
  progress: MotionValue<number>;
}) {
  const state = getStateMeta(assignment);
  // Each card occupies a slice of the scroll range (0.08 - 0.88)
  const totalCards = TOKENS.length;
  const sliceSize = 0.78 / totalCards; // ~0.0975 per card
  const enter = 0.08 + index * sliceSize;
  const holdStart = enter + sliceSize * 0.2;
  const holdEnd = enter + sliceSize * 0.75;
  const exit = enter + sliceSize;

  const cardOp = useTransform(
    progress,
    [enter, holdStart, holdEnd, exit],
    [0, 1, 1, 0.35],
  );
  const cardY = useTransform(
    progress,
    [enter, holdStart, holdEnd, exit],
    [28, 0, 0, -8],
  );
  const cardScale = useTransform(
    progress,
    [holdEnd, exit],
    [1, 0.96],
  );

  const [isHidden, setIsHidden] = useState(true);
  useMotionValueEvent(cardOp, "change", (v) => setIsHidden(v < 0.06));

  return (
    <motion.div
      style={{ opacity: cardOp, y: cardY, scale: cardScale }}
      aria-hidden={isHidden}
      className={`absolute inset-x-0 top-0 border-l-[3px] border border-black/10 bg-white p-5 ${stateAccent(assignment)} ${
        isHidden ? "invisible pointer-events-none" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
          {token.label}
        </p>
        <span
          className={`inline-flex border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${state.chipClass}`}
        >
          {state.label}
        </span>
      </div>
      <p className="mt-4 max-w-[22ch] font-serif text-[1.55rem] leading-snug tracking-tight text-black">
        {token.note}
      </p>
      <p className="mt-3 font-mono text-[13px] leading-relaxed text-neutral-600">
        {state.description}
      </p>
    </motion.div>
  );
}

/* ─── mobile scroll-driven deck ─── */
function MobileDeck({
  assignment,
}: {
  assignment: Record<TokenKey, StateKey>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Heading: stays fully visible throughout the section (not part of the card state machine)
  const headingOp = useTransform(scrollYProgress, [0, 1], [1, 1]);
  const headingY = useTransform(scrollYProgress, [0, 1], [0, 0]);

  // Summary: visible at the end
  const summaryOp = useTransform(scrollYProgress, [0.88, 0.94, 1], [0, 1, 1]);
  const summaryY = useTransform(scrollYProgress, [0.88, 0.94], [18, 0]);

  const keepCount = getCount(assignment, "keep");
  const evolveCount = getCount(assignment, "evolve");
  const rethinkCount = getCount(assignment, "rethink");

  return (
    <div ref={trackRef} className="relative h-[520vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="flex h-full flex-col px-8 pt-[calc(var(--skapa-site-chrome-height)+var(--skapa-chapter-pill-clearance)+1.5rem)] sm:px-10">
          {/* Heading */}
          <motion.div style={{ opacity: headingOp, y: headingY }}>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              03 · Keep or change
            </p>
            <h2 className="max-w-[16ch] font-serif text-[2rem] leading-[1.08] tracking-tight text-black">
              A rebrand doesn&apos;t mean throwing everything away.
            </h2>
          </motion.div>

          {/* Card area */}
          <div className="relative mt-6 flex-1">
            {TOKENS.map((token, index) => (
              <MobileCard
                key={token.key}
                token={token}
                assignment={assignment[token.key]}
                index={index}
                progress={scrollYProgress}
              />
            ))}

            {/* End summary */}
            <motion.div
              style={{ opacity: summaryOp, y: summaryY }}
              className="absolute inset-x-0 top-0"
            >
              <div className="border border-black/10 bg-[#f7f5f1] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Evaluation summary
                </p>
                <div className="mt-5 grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                      Keep
                    </span>
                    <span className="font-mono text-[11px] text-black">{keepCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                      Evolve
                    </span>
                    <span className="font-mono text-[11px] text-black">{evolveCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                      Rethink
                    </span>
                    <span className="font-mono text-[11px] text-black">{rethinkCount}</span>
                  </div>
                </div>
                <p className="mt-5 font-mono text-sm leading-relaxed text-neutral-600">
                  Rebranding is an evaluation, not a bonfire. Some parts still
                  carry recognition. Some need refinement. Some need a more
                  honest answer.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChapterKeepOrChange() {
  const { reducedMotion } = useReducedMotion();
  const [assignment, setAssignment] =
    useState<Record<TokenKey, StateKey>>(DEFAULT_ASSIGNMENT);
  const [selected, setSelected] = useState<TokenKey>("logo");

  const selectedToken = TOKENS.find((token) => token.key === selected) ?? TOKENS[0];
  const selectedState = getStateMeta(assignment[selectedToken.key]);

  const counts = useMemo(
    () =>
      STATES.map((state) => ({
        ...state,
        count: getCount(assignment, state.key),
      })),
    [assignment],
  );

  function cycleState(token: TokenKey) {
    const current = assignment[token];
    const currentIndex = STATES.findIndex((state) => state.key === current);
    const next = STATES[(currentIndex + 1) % STATES.length];
    setAssignment((prev) => ({ ...prev, [token]: next.key }));
  }

  function onWorkbenchKeyDown(event: KeyboardEvent<HTMLButtonElement>, token: TokenKey) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      cycleState(token);
      return;
    }

    const index = TOKENS.findIndex((item) => item.key === token);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setSelected(TOKENS[(index + 1) % TOKENS.length].key);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setSelected(TOKENS[(index - 1 + TOKENS.length) % TOKENS.length].key);
    }
  }

  function setTokenState(token: TokenKey, nextState: StateKey) {
    setAssignment((prev) => ({ ...prev, [token]: nextState }));
  }

  if (reducedMotion) {
    return (
      <section
        id="keep-or-change"
        className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            03 · Keep or change
          </p>
          <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
            A rebrand doesn&apos;t mean throwing everything away.
          </h2>
          <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
            The job is to annotate the system honestly: keep what still works,
            evolve what can stretch, and rethink what points the business in the
            wrong direction.
          </p>

          <ul className="mt-12 space-y-5">
            {TOKENS.map((token) => {
              const state = getStateMeta(DEFAULT_ASSIGNMENT[token.key]);
              return (
                <li
                  key={token.key}
                  className="grid gap-3 border-t border-black/10 py-5 md:grid-cols-[150px_120px_1fr]"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-black">
                    {token.label}
                  </p>
                  <p
                    className={`inline-flex w-fit items-center border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] ${state.chipClass}`}
                  >
                    {state.label}
                  </p>
                  <p className="font-mono text-sm leading-relaxed text-neutral-600">
                    {token.note}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section
      id="keep-or-change"
      className="scroll-mt-chapter border-t border-black/5 bg-bs-offwhite lg:scroll-mt-0"
    >
      {/* ─── Desktop: interactive workbench (unchanged) ─── */}
      <div className="hidden md:block">
        <div className="mx-auto max-w-6xl px-10 py-28 lg:pr-24">
          <div className="max-w-3xl">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              03 · Keep or change
            </p>
            <h2 className="font-serif text-5xl leading-snug tracking-tight text-black">
              A rebrand doesn&apos;t mean throwing everything away.
            </h2>
            <p className="mt-6 max-w-2xl font-mono text-base leading-relaxed text-neutral-600">
              Rebranding is an evaluation, not a bonfire. Some parts still carry
              recognition. Some need refinement. Some need a more honest answer.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] items-start gap-10">
            <div className="border border-black/10 bg-white/60 p-6">
              <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Workbench
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                  Click or press space to cycle state
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {TOKENS.map((token) => {
                  const state = getStateMeta(assignment[token.key]);
                  const active = selected === token.key;

                  return (
                    <button
                      key={token.key}
                      type="button"
                      onClick={() => {
                        setSelected(token.key);
                        cycleState(token.key);
                      }}
                      onFocus={() => setSelected(token.key)}
                      onKeyDown={(event) => onWorkbenchKeyDown(event, token.key)}
                      className={`group min-h-[144px] border p-5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                        active
                          ? "border-black bg-black text-bs-offwhite"
                          : "border-black/10 bg-bs-offwhite hover:border-black/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`font-mono text-[11px] uppercase tracking-[0.18em] ${
                            active ? "text-bs-yellow" : "text-neutral-500"
                          }`}
                        >
                          {token.label}
                        </span>
                        <span
                          className={`inline-flex border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
                            active ? "border-bs-offwhite/20 bg-bs-purple text-bs-offwhite" : state.chipClass
                          }`}
                        >
                          {state.label}
                        </span>
                      </div>
                      <p
                        className={`mt-6 max-w-[24ch] font-serif text-2xl leading-snug tracking-tight ${
                          active ? "text-bs-offwhite" : "text-black"
                        }`}
                      >
                        {token.note}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="sticky top-[calc(var(--skapa-site-chrome-height)+2rem)]">
              <div className="flex max-h-[calc(100svh-var(--skapa-site-chrome-height)-4rem)] flex-col justify-between overflow-hidden border border-black/10 bg-[#f7f5f1] p-6">
                <div className="overflow-y-auto pr-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                    Current decision
                  </p>
                  <h3 className="mt-4 font-serif text-[2.55rem] leading-none tracking-tight text-black">
                    {selectedToken.label}
                  </h3>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {STATES.map((state) => {
                      const active = assignment[selectedToken.key] === state.key;
                      return (
                        <button
                          key={state.key}
                          type="button"
                          onClick={() => setTokenState(selectedToken.key, state.key)}
                          className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] outline-none transition focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                            active ? state.chipClass : "border-black/10 bg-white text-neutral-500"
                          }`}
                        >
                          {state.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-5 max-w-sm font-mono text-sm leading-relaxed text-neutral-600">
                    {selectedState.description} {selectedToken.note}
                  </p>
                </div>

                <div className="mt-8 border-t border-black/10 pt-6">
                  <div className="grid gap-3">
                    {counts.map((state) => (
                      <div key={state.key} className="flex items-center justify-between gap-4">
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                          {state.label}
                        </span>
                        <div className="flex min-w-[180px] items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden bg-black/5">
                            <motion.div
                              animate={{ width: `${(state.count / TOKENS.length) * 100}%` }}
                              transition={{ duration: 0.35, ease: "easeOut" }}
                              className={`h-full ${
                                state.key === "keep"
                                  ? "bg-black"
                                  : state.key === "evolve"
                                    ? "bg-bs-yellow"
                                    : "bg-bs-pink"
                              }`}
                            />
                          </div>
                          <span className="w-5 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-black">
                            {state.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ─── Mobile: scroll-driven card deck ─── */}
      <div className="md:hidden">
        <MobileDeck assignment={assignment} />
      </div>
    </section>
  );
}
