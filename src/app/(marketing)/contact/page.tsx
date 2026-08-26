import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl items-start gap-12 px-6 py-24 md:grid-cols-12 md:gap-14 md:px-10 md:py-32">
      <div className="md:col-span-5">
        {/* Placeholder Unsplash image — replace with commissioned/licensed photography before public launch. */}
        <Image
          src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80"
          alt="Hands making something by hand on a warm wooden surface"
          width={1200}
          height={1500}
          className="h-auto w-full object-cover"
          sizes="(max-width: 768px) 100vw, 40vw"
          priority
        />
      </div>

      <div className="md:col-span-7">
        <p className="mb-8 font-mono text-sm uppercase tracking-widest text-neutral-500">
          Contact
        </p>
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
          Let&apos;s talk{" "}
          <span className="italic text-brand-yellow">costs.</span>
        </h1>
        <p className="mt-8 max-w-prose font-mono text-sm leading-relaxed text-neutral-600 md:text-base">
          Every skapa project is different, so we build packages around what you
          actually need. Tell us what you&apos;re after, and we&apos;ll come back
          with a tailored quote.
        </p>
        <div className="mt-12">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
