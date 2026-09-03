"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "./useReducedMotion";

const AREAS = [
  {
    id: "positioning",
    label: "Positioning",
    body: "Where the brand should sit in the market and the space it can credibly own.",
    accent: "#4b4ae4",
    visual: "positioning",
  },
  {
    id: "audience",
    label: "Audience",
    body: "Who the brand needs to matter to and what those people actually care about.",
    accent: "#4b4ae4",
    visual: "audience",
  },
  {
    id: "difference",
    label: "Difference",
    body: "The credible reason somebody should choose the business instead of the alternatives.",
    accent: "#ff2791",
    visual: "difference",
  },
  {
    id: "personality",
    label: "Personality",
    body: "How the brand should behave, communicate and make people feel.",
    accent: "#ff2791",
    visual: "personality",
  },
  {
    id: "message",
    label: "Message",
    body: "What needs to be communicated, in what order, and why it should matter.",
    accent: "#4b4ae4",
    visual: "message",
  },
] as const;

const PROCESS = [
  { name: "Discover", body: "Business, ambitions, market and perception." },
  { name: "Understand", body: "Audience, competitors, opportunities." },
  { name: "Define", body: "Position, difference, personality, message." },
  { name: "Build", body: "A usable strategic framework." },
  { name: "Apply", body: "Identity, website, content, marketing." },
] as const;

const CAPABILITIES = [
  "Research & discovery",
  "Purpose, mission & values",
  "Brand architecture",
  "Tone of voice direction",
  "Value proposition",
  "Strategic creative direction",
] as const;

function StrategyVisual({
  kind,
  accent,
  overlay = false,
}: {
  kind: (typeof AREAS)[number]["visual"];
  accent: string;
  overlay?: boolean;
}) {
  const frame = overlay
    ? "relative h-full min-h-[340px] overflow-hidden border border-black/10 bg-white"
    : "relative h-full min-h-[260px] border border-black/10 bg-white p-6";

  if (kind === "positioning") {
    return (
      <div className={frame}>
        <div
          className={`absolute grid grid-cols-4 grid-rows-4 gap-px bg-black/10 ${
            overlay ? "inset-4 left-[18%]" : "inset-6"
          }`}
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="bg-bs-offwhite"
              style={i === 10 ? { background: accent } : undefined}
            />
          ))}
        </div>
        <p
          className={`absolute font-mono text-[9px] tracking-[0.16em] text-neutral-400 ${
            overlay ? "top-3 right-4" : "top-4 left-6"
          }`}
        >
          C2
        </p>
        <p
          className={`absolute font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 ${
            overlay ? "right-4 bottom-3" : "bottom-4 left-6"
          }`}
        >
          Owned territory
        </p>
      </div>
    );
  }

  if (kind === "audience") {
    return (
      <div
        className={`relative flex h-full items-center justify-center border border-black/10 bg-white ${
          overlay ? "min-h-[340px] pl-[12%]" : "min-h-[260px]"
        }`}
      >
        <div className="absolute h-36 w-36 rounded-full border-2 border-bs-purple" />
        <div className="absolute h-20 w-20 rounded-full bg-bs-purple" />
        <div className="relative h-6 w-6 rounded-full bg-bs-offwhite" />
        <div className="absolute top-[28%] right-[18%] flex gap-1">
          <span className="h-2 w-2 rounded-full bg-bs-purple" />
          <span className="h-2 w-2 rounded-full border border-bs-purple" />
          <span className="h-2 w-2 rounded-full bg-black/15" />
        </div>
        <p
          className={`absolute font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 ${
            overlay ? "right-4 bottom-3" : "bottom-4 left-6"
          }`}
        >
          Focal grouping
        </p>
      </div>
    );
  }

  if (kind === "difference") {
    return (
      <div
        className={`relative flex h-full items-end gap-2 border border-black/10 bg-white ${
          overlay ? "min-h-[340px] py-5 pr-4 pl-[22%]" : "min-h-[260px] gap-3 p-6"
        }`}
      >
        {[0.4, 0.4, 0.4, 1, 0.4].map((scale, i) => (
          <div
            key={i}
            className="flex-1"
            style={{
              height: `${scale * 100}%`,
              background: scale === 1 ? accent : "#e8e7e3",
            }}
          />
        ))}
        <p
          className={`absolute font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 ${
            overlay ? "top-3 right-4" : "top-4 left-6"
          }`}
        >
          One clear difference
        </p>
      </div>
    );
  }

  if (kind === "personality") {
    return (
      <div
        className={`relative flex h-full flex-col justify-between overflow-hidden border border-black/10 bg-white ${
          overlay ? "min-h-[340px] py-5 pr-5 pl-[20%]" : "min-h-[260px] p-6"
        }`}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
          Expression
        </p>
        <p
          className={`font-serif italic leading-none ${
            overlay ? "text-4xl" : "text-5xl md:text-6xl"
          }`}
          style={{ color: accent }}
        >
          Behave.
        </p>
        <div className="flex gap-2">
          <span className="h-2 w-10" style={{ background: accent }} />
          <span className="h-2 w-4 bg-black/15" />
          <span className="h-2 w-7 bg-black/15" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-full flex-col justify-between border border-black/10 bg-white ${
        overlay ? "min-h-[340px] py-5 pr-5 pl-[18%]" : "min-h-[260px] p-6"
      }`}
    >
      <p className="font-serif text-2xl text-black/20 line-through md:text-3xl">
        Everything
      </p>
      <p className="font-serif text-2xl text-black/35 md:text-3xl">Most things</p>
      <p
        className={`font-serif ${overlay ? "text-3xl" : "text-4xl"}`}
        style={{ color: accent }}
      >
        What matters
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
        Hierarchy of meaning
      </p>
    </div>
  );
}

type AreaId = (typeof AREAS)[number]["id"];

function StrategyTab({
  area,
  index,
  selected,
  preview,
  baseId,
  panelId,
  onSelect,
  onPreview,
  onClearPreview,
  onKeyDown,
  compact,
}: {
  area: (typeof AREAS)[number];
  index: number;
  selected: boolean;
  preview: boolean;
  baseId: string;
  panelId: string;
  onSelect: () => void;
  onPreview: () => void;
  onClearPreview: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${area.id}`}
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onMouseEnter={onPreview}
      onMouseLeave={onClearPreview}
      onFocus={onPreview}
      onBlur={onClearPreview}
      onKeyDown={onKeyDown}
      className={`group flex w-full items-center text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
        compact
          ? // Generous hit area; label type can stay small inside it
            "min-h-11 gap-2 py-2.5"
          : "justify-between gap-4 border-b border-black/10 py-5"
      } ${selected ? "text-black" : "text-neutral-400 hover:text-neutral-700"}`}
    >
      {compact && (
        <span
          className={`shrink-0 font-mono tracking-[0.14em] transition-[color,font-size,opacity] duration-300 ease-out ${
            selected
              ? "text-[9px] opacity-100"
              : "text-[8px] text-neutral-500 opacity-90 group-hover:text-neutral-700"
          }`}
          style={selected ? { color: area.accent } : undefined}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <span className="relative min-w-0 flex-1">
        <span
          className={`inline-block origin-left font-serif tracking-tight transition-[color,transform,opacity] duration-300 ease-out ${
            compact
              ? // Shared base size; scale creates the inactive→active grow
                `text-[1.15rem] leading-none ${
                  selected
                    ? "translate-x-0.5 scale-100 opacity-100"
                    : "scale-[0.78] text-neutral-600 opacity-85 group-hover:text-neutral-800 group-hover:opacity-100"
                }`
              : "text-3xl"
          } ${!compact && selected ? "translate-x-0.5" : ""} ${
            !compact && !selected ? "group-hover:translate-x-0.5" : ""
          }`}
          style={selected ? { color: area.accent } : undefined}
        >
          {area.label}
        </span>
        {compact && (
          <span
            aria-hidden="true"
            className="mt-1 block h-px origin-left transition-transform duration-300 ease-out"
            style={{
              background: area.accent,
              transform: selected ? "scaleX(1)" : "scaleX(0)",
              width: "2.25rem",
            }}
          />
        )}
      </span>
      {/* Desktop only — mobile relies on label colour / rule / scale */}
      {!compact && (
        <span
          className="h-2 w-2 shrink-0 rounded-full border transition-all duration-300"
          style={{
            borderColor: area.accent,
            background: selected || preview ? area.accent : "transparent",
            opacity: selected || preview ? 1 : 0,
          }}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

export default function ChapterStrategy() {
  const { reducedMotion } = useReducedMotion();
  const [activeId, setActiveId] = useState<AreaId>("positioning");
  const [previewId, setPreviewId] = useState<AreaId | null>(null);
  const baseId = useId();
  const mobileBaseId = `${baseId}-m`;
  const desktopBaseId = `${baseId}-d`;
  const shownId = previewId ?? activeId;
  const active = AREAS.find((area) => area.id === shownId) ?? AREAS[0];

  function onTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentId: AreaId,
    idPrefix: string,
  ) {
    const currentIndex = AREAS.findIndex((item) => item.id === currentId);
    let nextIndex = currentIndex;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % AREAS.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + AREAS.length) % AREAS.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = AREAS.length - 1;
    } else {
      return;
    }
    const next = AREAS[nextIndex];
    setActiveId(next.id);
    document.getElementById(`${idPrefix}-tab-${next.id}`)?.focus();
  }

  return (
    <section
      id="build-the-strategy"
      className="relative scroll-mt-chapter lg:scroll-mt-0 border-t border-black/5 bg-bs-offwhite"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-1 w-24 bg-bs-purple md:w-40"
      />

      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          03 · Build the strategy
        </p>
        <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
          So what does brand strategy actually mean?
        </h2>
        <p className="mt-5 max-w-2xl font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
          Deciding what the brand stands for, who it is for, and how it should
          show up, before design begins.
        </p>

        {/* ——— Mobile: one layered composition ——— */}
        <div className="mt-12 md:hidden">
          <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-black">
            Tap a focus to explore
          </p>

          <div className="relative min-h-[340px] overflow-hidden">
            {/* Central / right-weighted diagram stage */}
            <div
              id={`${mobileBaseId}-stage`}
              role="tabpanel"
              aria-labelledby={`${mobileBaseId}-tab-${active.id}`}
              className="absolute inset-y-0 right-0 left-[22%] overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={
                    reducedMotion ? false : { opacity: 0, scale: 0.985, x: 14 }
                  }
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={
                    reducedMotion
                      ? undefined
                      : { opacity: 0, scale: 0.99, x: -10 }
                  }
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="h-full"
                >
                  <StrategyVisual
                    kind={active.visual}
                    accent={active.accent}
                    overlay
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Soft veil so left labels stay readable over the diagram */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[52%] bg-gradient-to-r from-bs-offwhite from-45% via-bs-offwhite/75 to-transparent"
            />

            {/* Selector overlays the left of the same visual territory */}
            <div
              role="tablist"
              aria-label="Brand strategy areas"
              aria-orientation="vertical"
              className="relative z-[2] flex w-[56%] max-w-[15rem] flex-col justify-center py-2"
            >
              {AREAS.map((area, index) => (
                <StrategyTab
                  key={area.id}
                  area={area}
                  index={index}
                  selected={area.id === activeId}
                  preview={previewId === area.id}
                  baseId={mobileBaseId}
                  panelId={`${mobileBaseId}-stage`}
                  compact
                  onSelect={() => setActiveId(area.id)}
                  onPreview={() => setPreviewId(area.id)}
                  onClearPreview={() => setPreviewId(null)}
                  onKeyDown={(event) =>
                    onTabKeyDown(event, area.id, mobileBaseId)
                  }
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={active.id}
              data-strategy-body
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="mt-5 max-w-[34ch] font-serif text-lg leading-snug text-black"
            >
              {active.body}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ——— Desktop: side-by-side (unchanged concept) ——— */}
        <div className="mt-16 hidden md:grid md:grid-cols-12 md:gap-8">
          <div
            role="tablist"
            aria-label="Brand strategy areas"
            aria-orientation="vertical"
            className="md:col-span-5"
          >
            {AREAS.map((area, index) => (
              <StrategyTab
                key={area.id}
                area={area}
                index={index}
                selected={area.id === activeId}
                preview={previewId === area.id}
                baseId={desktopBaseId}
                panelId={`${desktopBaseId}-stage`}
                onSelect={() => setActiveId(area.id)}
                onPreview={() => setPreviewId(area.id)}
                onClearPreview={() => setPreviewId(null)}
                onKeyDown={(event) =>
                  onTabKeyDown(event, area.id, desktopBaseId)
                }
              />
            ))}
          </div>

          <div
            id={`${desktopBaseId}-stage`}
            role="tabpanel"
            aria-labelledby={`${desktopBaseId}-tab-${active.id}`}
            className="md:col-span-7"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                <StrategyVisual kind={active.visual} accent={active.accent} />
                <p
                  data-strategy-body
                  className="mt-6 font-serif text-3xl leading-snug text-black"
                >
                  {active.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="sr-only">
          {AREAS.map((area) => (
            <div key={area.id}>
              <h3>{area.label}</h3>
              <p>{area.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 border-t border-black/10 pt-12 md:mt-24">
          <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            The pathway
          </p>
          <div
            className="relative mb-8 hidden h-px w-full bg-black/10 md:block"
            aria-hidden="true"
          >
            <div className="absolute inset-y-0 left-0 w-full">
              <div className="flex h-full">
                <span className="h-full flex-1 bg-neutral-300" />
                <span className="h-full flex-1 bg-bs-purple" />
                <span className="h-full flex-1 bg-bs-purple" />
                <span className="h-full flex-1 bg-bs-pink" />
                <span className="h-full flex-1 bg-bs-yellow" />
              </div>
            </div>
          </div>
          <ol className="grid gap-0 md:grid-cols-5">
            {PROCESS.map((stage, index) => {
              const colours = [
                "#d4d4d4",
                "#4b4ae4",
                "#4b4ae4",
                "#ff2791",
                "#fff1a7",
              ];
              return (
                <li
                  key={stage.name}
                  className="relative border-l border-black/10 py-4 pl-5 md:border-l-0 md:pl-0 md:pr-4"
                >
                  <span
                    className="mb-3 block h-1 w-10 md:hidden"
                    style={{ background: colours[index] }}
                    aria-hidden="true"
                  />
                  <p className="font-mono text-[10px] tracking-[0.16em] text-neutral-400">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-serif text-xl text-black">
                    {stage.name}
                  </h3>
                  <p className="mt-2 font-mono text-xs leading-relaxed text-neutral-600">
                    {stage.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-14 border-t border-black/10 pt-10">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Also part of the work
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {CAPABILITIES.map((item) => (
              <li key={item} className="font-mono text-sm text-neutral-700">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
