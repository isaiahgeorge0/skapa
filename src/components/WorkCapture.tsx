import Image from "next/image";
import { clientFontClass } from "@/app/(marketing)/work/fonts";
import type { CaseStudy } from "@/lib/work";

export default function WorkCapture({
  study,
  className,
  sizes,
}: {
  study: CaseStudy;
  className: string;
  sizes: string;
}) {
  const display = clientFontClass[study.slug]?.display ?? "font-display";

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: study.theme.bg, color: study.theme.fg }}
    >
      {study.captureReady ? (
        <Image
          src={study.images.desktop}
          alt={study.images.alt}
          fill
          className="object-cover object-top"
          sizes={sizes}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          <p className={`${display} text-3xl font-semibold leading-none tracking-tight md:text-5xl`}>
            {study.client}
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em]">{study.sector}</p>
        </div>
      )}
    </div>
  );
}
