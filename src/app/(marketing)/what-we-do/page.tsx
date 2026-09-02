import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "What We Do",
  description:
    "Brand strategy, creative, bespoke web design and development, and social media for businesses in Ipswich, Suffolk and across the UK.",
  path: "/what-we-do",
});

const pillars = [
  {
    name: "Brand",
    services: [
      "Brand strategy",
      "Brand identity",
      "Brand development",
      "Logos & visual identities",
      "Brand guidelines",
      "Brand decks",
    ],
  },
  {
    name: "Creative",
    services: [
      "Graphic design",
      "3D design",
      "Artworking",
      "Campaign creative",
      "Print & digital design",
      "Marketing materials",
    ],
  },
  {
    name: "Digital",
    services: [
      "Website design",
      "Website development",
      "UI/UX",
      "Landing pages",
      "Digital experiences",
    ],
  },
  {
    name: "Social",
    services: [
      "Social media management",
      "Content creation",
      "Social strategy",
      "Campaigns",
      "Creative direction",
      "Ongoing brand content",
    ],
  },
] as const;

export default function WhatWeDoPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
      <p className="mb-8 font-mono text-sm uppercase tracking-widest text-neutral-500">
        What we do
      </p>
      <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight md:text-7xl">
        Good design gets attention.{" "}
        <span className="italic text-brand-yellow">Great design has a reason.</span>
      </h1>

      <div className="mt-24 grid gap-16 md:grid-cols-2 md:gap-x-12 md:gap-y-20">
        {pillars.map((pillar) => (
          <section key={pillar.name}>
            <h2 className="font-serif text-3xl text-black md:text-4xl">
              {pillar.name}
            </h2>
            <ul className="mt-6 space-y-3 border-t border-neutral-200 pt-6">
              {pillar.services.map((service) => (
                <li
                  key={service}
                  className="font-mono text-sm leading-relaxed text-neutral-700"
                >
                  {service}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
