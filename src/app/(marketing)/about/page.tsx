import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
};

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
        {/* Placeholder Unsplash image — replace with commissioned/licensed photography before public launch. */}
        <Image
          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80"
          alt="Editorial portrait in warm, muted tones"
          width={1200}
          height={1500}
          className="h-auto w-full object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
    </div>
  );
}
