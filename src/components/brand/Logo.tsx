import Image from "next/image";

export const LOGO_TONES = ["ink", "cream", "blue", "pink", "yellow", "white"] as const;

export type LogoTone = (typeof LOGO_TONES)[number];

type LogoProps = {
  tone?: LogoTone;
  className?: string;
  alt?: string;
};

function logoClass(className: string | undefined, fallback: string) {
  return ["w-auto", className ?? fallback].filter(Boolean).join(" ");
}

export function SkapaSignature({
  tone = "ink",
  className,
  alt = "Skapa Creative",
}: LogoProps) {
  return (
    <Image
      src={`/brand/signature/skapa-signature-${tone}.svg`}
      alt={alt}
      width={7760}
      height={3338}
      unoptimized
      className={logoClass(className, "h-8")}
    />
  );
}

export function SkapaMark({
  tone = "ink",
  className,
  alt = "Skapa",
}: LogoProps) {
  return (
    <Image
      src={`/brand/s-mark/skapa-s-${tone}.svg`}
      alt={alt}
      width={2624}
      height={2132}
      unoptimized
      className={logoClass(className, "h-8")}
    />
  );
}
