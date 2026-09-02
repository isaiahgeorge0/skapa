import type { Metadata } from "next";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Skapa is an Ipswich creative and digital agency helping businesses across Suffolk and the UK build brands, websites and marketing that work.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="mx-auto grid max-w-6xl items-start gap-12 px-6 py-24 md:grid-cols-12 md:gap-14 md:px-10 md:py-32">
      <div className="md:col-span-6">
        <p className="mb-8 font-mono text-sm uppercase tracking-widest text-neutral-500">
          About
        </p>
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
          Built to create, shape and{" "}
          <span className="italic text-brand-pink">grow brands.</span>
        </h1>
        <p className="mt-10 max-w-prose font-mono text-sm leading-relaxed text-neutral-700 md:text-base">
          Skapa is a creative design and marketing agency built to create, shape
          and grow brands. We work with businesses at every stage, from the first
          idea on a blank page to established brands ready for their next chapter.
        </p>
      </div>

      <div className="md:col-span-6">
        <div className="relative aspect-[4/5] w-full">
          <Image
            src="/images/pexels-tima-miroshnichenko-5701742.jpg"
            alt="Man using a tablet in a rustic industrial loft space"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}
