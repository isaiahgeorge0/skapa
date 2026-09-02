import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch with skapa Creative in Ipswich for branding, web design and digital projects across Suffolk and the UK.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl items-start gap-12 px-6 py-24 md:grid-cols-12 md:gap-14 md:px-10 md:py-32">
      <div className="md:col-span-5">
        <div className="relative aspect-[4/5] w-full">
          <Image
            src="/images/pexels-rdne-10376197.jpg"
            alt="Man laughing on the phone with a colorful calendar on a laptop screen"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
          />
        </div>
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
