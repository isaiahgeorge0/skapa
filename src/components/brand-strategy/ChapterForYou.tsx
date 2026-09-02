"use client";

import { useState } from "react";

const SITUATIONS = [
  {
    title: "We’re starting something new.",
    body: "Get the foundation right before designing the identity.",
  },
  {
    title: "We’ve outgrown our existing brand.",
    body: "Make sure the brand still represents the business you’ve become.",
  },
  {
    title: "We’re preparing to rebrand.",
    body: "Work out what actually needs to change — and what doesn’t.",
  },
  {
    title: "We don’t know what makes us different.",
    body: "Find a more meaningful point of difference.",
  },
] as const;

const FAQS = [
  {
    question: "What’s the difference between brand strategy and brand identity?",
    answer:
      "Brand strategy decides what the brand stands for, who it is for, and how it should communicate. Brand identity turns that thinking into the visual and verbal system people recognise.",
  },
  {
    question: "Do I need brand strategy before a rebrand?",
    answer:
      "Not always, but it usually helps. Strategy clarifies what should change, what should stay, and why — so a rebrand is purposeful rather than cosmetic.",
  },
  {
    question: "What will I receive at the end?",
    answer:
      "A usable strategic framework covering the decisions your brand needs to move forward. Exact deliverables depend on scope, but typically include positioning, audience, differentiation, personality and messaging direction.",
  },
  {
    question: "Can skapa create the identity afterwards?",
    answer:
      "Yes. Strategy often leads into brand identity, guidelines and wider creative or digital work, so the thinking and the making stay connected.",
  },
] as const;

const RELATED = [
  {
    title: "Brand Identity",
    body: "Turn the thinking into something people recognise.",
    href: null as string | null,
  },
  {
    title: "Rebranding",
    body: "When the business has moved forward but the brand hasn’t.",
    href: null as string | null,
  },
  {
    title: "Brand Guidelines",
    body: "Make the brand easier to use consistently.",
    href: null as string | null,
  },
] as const;

export default function ChapterForYou() {
  const [openSituation, setOpenSituation] = useState(0);

  return (
    <section
      id="is-it-for-you"
      className="scroll-mt-chapter lg:scroll-mt-0 border-t border-black/5 bg-bs-offwhite"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:pr-24">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
          05 · Is it for you?
        </p>
        <h2 className="max-w-3xl font-serif text-3xl leading-snug tracking-tight text-black md:text-5xl">
          Built for moments when the brand needs clearer thinking.
        </h2>

        <div className="mt-14 md:mt-16">
          {SITUATIONS.map((situation, index) => {
            const open = openSituation === index;
            return (
              <div key={situation.title} className="border-t border-black/10">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenSituation(open ? -1 : index)}
                  className="group flex w-full items-start justify-between gap-6 py-7 text-left outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 md:py-8"
                >
                  <span className="flex min-w-0 items-baseline gap-5">
                    <span
                      className="font-mono text-[11px] tracking-[0.16em] transition-colors duration-200 group-hover:text-bs-pink"
                      style={{ color: open ? "#ff2791" : undefined }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="relative">
                      <span
                        aria-hidden="true"
                        className={`absolute -left-4 top-1/2 h-px origin-left bg-bs-pink transition-all duration-200 ${
                          open
                            ? "w-3 -translate-y-1/2 opacity-100"
                            : "w-0 -translate-y-1/2 opacity-0 group-hover:w-3 group-hover:opacity-100"
                        }`}
                      />
                      <span
                        className={`font-serif text-2xl tracking-tight transition-transform duration-200 md:text-3xl ${
                          open
                            ? "translate-x-1 text-black"
                            : "text-neutral-700 group-hover:translate-x-1 group-hover:text-black"
                        }`}
                      >
                        {situation.title}
                      </span>
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`mt-2 shrink-0 font-mono text-sm transition-all duration-200 ${
                      open
                        ? "rotate-45 text-bs-pink"
                        : "text-neutral-400 group-hover:translate-x-0.5 group-hover:text-bs-pink"
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-8 pl-12 font-mono text-sm leading-relaxed text-neutral-600 md:pl-14 md:text-base">
                      {situation.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="border-t border-black/10" />
        </div>

        <div className="mt-20 md:mt-24">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            FAQs
          </p>
          <h3 className="font-serif text-2xl text-black md:text-3xl">
            Questions worth answering early.
          </h3>
          <div className="mt-10 max-w-3xl">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group border-t border-black/10 py-5 last:border-b"
              >
                <summary className="cursor-pointer list-none font-serif text-xl text-black outline-none marker:content-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 md:text-2xl [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-6">
                    <span className="transition-colors group-open:text-bs-purple">
                      {faq.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-1 shrink-0 font-mono text-sm text-neutral-400 transition-transform group-open:rotate-45 group-open:text-bs-purple"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 max-w-prose font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-20 border-t border-black/10 pt-12 md:mt-24">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Related services
          </p>
          <ul className="grid gap-8 md:grid-cols-3 md:gap-10">
            {RELATED.map((service) => (
              <li key={service.title}>
                <h3 className="font-serif text-2xl text-black">{service.title}</h3>
                <p className="mt-3 font-mono text-sm leading-relaxed text-neutral-600">
                  {service.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
