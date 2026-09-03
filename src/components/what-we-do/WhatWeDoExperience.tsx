"use client";

import Link from "next/link";
import { useEffect, useState, type FocusEvent } from "react";
import {
  SERVICE_GROUPS,
  type ServiceGroup,
} from "@/lib/service-groups";

const PANEL: Record<
  ServiceGroup["id"],
  { field: string; ink: string; muted: string }
> = {
  brand: {
    field: "bg-bs-offwhite",
    ink: "text-black",
    muted: "text-neutral-500",
  },
  creative: {
    field: "bg-bs-pink",
    ink: "text-white",
    muted: "text-white/70",
  },
  digital: {
    field: "bg-bs-purple",
    ink: "text-bs-offwhite",
    muted: "text-bs-offwhite/70",
  },
  social: {
    field: "bg-bs-yellow",
    ink: "text-black",
    muted: "text-black/55",
  },
};

export default function WhatWeDoExperience() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <>
      <DesktopDirectory reducedMotion={reducedMotion} />
      <MobileDirectory reducedMotion={reducedMotion} />
    </>
  );
}

function DesktopDirectory({ reducedMotion }: { reducedMotion: boolean }) {
  const [active, setActive] = useState<string | null>(null);

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setActive(null);
    }
  }

  return (
    <div
      className="hidden h-[calc(100svh-var(--skapa-site-chrome-height))] md:flex"
      onMouseLeave={() => setActive(null)}
      onBlur={handleBlur}
    >
      {SERVICE_GROUPS.map((group) => {
        const open = active === group.id;
        const compressed = active !== null && !open;
        const tone = PANEL[group.id];
        return (
          <section
            key={group.id}
            className={`relative flex min-w-0 flex-col overflow-hidden ${tone.field} ${tone.ink} ${
              reducedMotion ? "" : "transition-[flex] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            }`}
            style={{ flex: open ? 2.7 : compressed ? 0.58 : 1 }}
            onMouseEnter={() => setActive(group.id)}
            onFocusCapture={() => setActive(group.id)}
          >
            <div className="flex h-full min-h-0 flex-col px-7 py-9 lg:px-9 lg:py-10">
              <p className={`font-mono text-[11px] uppercase tracking-[0.22em] ${tone.muted}`}>
                {group.number}
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-none tracking-tight lg:text-5xl">
                {group.name}
              </h2>
              <p
                className={`mt-5 max-w-[22ch] font-mono text-sm leading-relaxed ${tone.muted} ${
                  compressed ? "lg:hidden" : ""
                }`}
              >
                {group.proposition}
              </p>

              <div className="relative mt-8 min-h-[5.5rem] flex-1">
                <PanelMark id={group.id} quiet={open} />
              </div>

              <div
                className={`mt-auto min-h-0 ${
                  open
                    ? reducedMotion
                      ? "block"
                      : "block opacity-100"
                    : "pointer-events-none h-0 overflow-hidden opacity-0"
                } ${reducedMotion ? "" : "transition-opacity duration-300"}`}
                aria-hidden={!open}
              >
                <ul className="space-y-2.5 border-t border-current/15 pt-5">
                  {group.capabilities.map((item) => (
                    <li key={item.label}>
                      {item.href && open ? (
                        <Link
                          href={item.href}
                          className="font-mono text-[12px] uppercase tracking-[0.12em] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span
                          className={`font-mono text-[12px] uppercase tracking-[0.12em] ${
                            item.href ? "" : "text-current/80"
                          }`}
                        >
                          {item.label}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {group.href ? (
                    <Link
                      href={group.href}
                      tabIndex={open ? 0 : -1}
                      className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                    >
                      Explore {group.name} <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <p className={`font-mono text-[11px] uppercase tracking-[0.16em] ${tone.muted}`}>
                      Explore {group.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function MobileDirectory({ reducedMotion }: { reducedMotion: boolean }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="md:hidden">
      <div className="bg-bs-offwhite px-8 pb-10 pt-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          What we do
        </p>
        <p className="mt-4 max-w-[14ch] font-serif text-[2.15rem] leading-[1.08] tracking-tight text-black">
          Four disciplines. One studio.
        </p>
      </div>
      {SERVICE_GROUPS.map((group) => {
        const open = openId === group.id;
        const tone = PANEL[group.id];
        const panelId = `service-${group.id}`;
        return (
          <section key={group.id} className={`border-t border-black/10 ${tone.field} ${tone.ink}`}>
            <h2>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : group.id)}
                className="flex w-full items-baseline justify-between gap-4 px-8 py-7 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-current"
              >
                <span className="flex min-w-0 flex-col gap-2">
                  <span className={`font-mono text-[11px] uppercase tracking-[0.2em] ${tone.muted}`}>
                    {group.number}
                  </span>
                  <span className="font-serif text-4xl leading-none tracking-tight">
                    {group.name}
                  </span>
                </span>
                <span className={`font-mono text-[11px] uppercase tracking-[0.16em] ${tone.muted}`}>
                  {open ? "Close" : "Open"}
                </span>
              </button>
            </h2>
            <div
              id={panelId}
              className={`grid ${
                reducedMotion
                  ? open
                    ? "grid-rows-[1fr]"
                    : "grid-rows-[0fr]"
                  : `transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="px-8 pb-9">
                  <p className={`max-w-[34ch] font-mono text-sm leading-relaxed ${tone.muted}`}>
                    {group.proposition}
                  </p>
                  <div className="mt-6 h-16">
                    <PanelMark id={group.id} quiet={false} />
                  </div>
                  <ul className="mt-6 space-y-3 border-t border-current/15 pt-5">
                    {group.capabilities.map((item) => (
                      <li key={item.label}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="font-mono text-[12px] uppercase tracking-[0.12em] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <span className="font-mono text-[12px] uppercase tracking-[0.12em]">
                            {item.label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    {group.href ? (
                      <Link
                        href={group.href}
                        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
                      >
                        Explore {group.name} <span aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      <p className={`font-mono text-[11px] uppercase tracking-[0.16em] ${tone.muted}`}>
                        Explore {group.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function PanelMark({
  id,
  quiet,
}: {
  id: ServiceGroup["id"];
  quiet: boolean;
}) {
  const opacity = quiet ? "opacity-30" : "opacity-100";
  if (id === "brand") {
    return (
      <div className={`flex h-full max-h-28 flex-col justify-end gap-2 ${opacity}`}>
        <span className="block h-px w-full bg-current" />
        <span className="block h-px w-[72%] bg-current" />
        <span className="block h-px w-[44%] bg-current" />
      </div>
    );
  }
  if (id === "creative") {
    return (
      <div className={`relative h-24 w-24 ${opacity}`}>
        <span className="absolute left-0 top-3 h-16 w-16 rotate-[-8deg] bg-white/35" />
        <span className="absolute left-7 top-0 h-16 w-16 rotate-[10deg] border border-white/80" />
      </div>
    );
  }
  if (id === "digital") {
    return (
      <div className={`grid h-20 w-20 grid-cols-4 gap-1.5 ${opacity}`}>
        {Array.from({ length: 16 }, (_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 ${i % 5 === 0 ? "bg-bs-yellow" : "bg-current/35"}`}
          />
        ))}
      </div>
    );
  }
  return (
    <div className={`flex h-20 items-end gap-1.5 ${opacity}`}>
      {[40, 70, 52, 88, 34, 64].map((h, i) => (
        <span
          key={i}
          className="w-2 bg-black/80"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
