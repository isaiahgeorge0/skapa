import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "What We Do",
  description:
    "Brand strategy, creative, bespoke web design and development, and social media for businesses in Ipswich, Suffolk and across the UK.",
  path: "/what-we-do",
});

type ServiceItem = {
  label: string;
  href?: string;
};

const pillars: {
  name: string;
  services: ServiceItem[];
}[] = [
  {
    name: "Brand",
    services: [
      { label: "Brand strategy", href: "/what-we-do/brand/brand-strategy" },
      { label: "Brand identity", href: "/what-we-do/brand/brand-identity" },
      { label: "Brand development" },
      { label: "Logos & visual identities" },
      { label: "Brand guidelines" },
      { label: "Brand decks" },
    ],
  },
  {
    name: "Creative",
    services: [
      { label: "Graphic design" },
      { label: "3D design" },
      { label: "Artworking" },
      { label: "Campaign creative" },
      { label: "Print & digital design" },
      { label: "Marketing materials" },
    ],
  },
  {
    name: "Digital",
    services: [
      { label: "Website design" },
      { label: "Website development" },
      { label: "UI/UX" },
      { label: "Landing pages" },
      { label: "Digital experiences" },
    ],
  },
  {
    name: "Social",
    services: [
      { label: "Social media management" },
      { label: "Content creation" },
      { label: "Social strategy" },
      { label: "Campaigns" },
      { label: "Creative direction" },
      { label: "Ongoing brand content" },
    ],
  },
];

export default function WhatWeDoPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
      <p className="mb-8 font-mono text-sm uppercase tracking-widest text-brand-blue">
        What we do
      </p>
      <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight md:text-7xl">
        Good design gets attention.{" "}
        <span className="italic text-brand-pink">Great design has a reason.</span>
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
                  key={service.label}
                  className="font-mono text-sm leading-relaxed text-neutral-700"
                >
                  {service.href ? (
                    <Link
                      href={service.href}
                      className="underline-offset-4 transition-colors hover:text-black hover:underline"
                    >
                      {service.label}
                    </Link>
                  ) : (
                    service.label
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
