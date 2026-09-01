"use client";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

const SERVICES = [
  {
    key: "brand",
    label: "Brand",
    tagline: "Strategy, identity, and the systems that hold it together.",
    image: "/images/service-brand.jpg",
    alt: "Brand identity and strategy work in progress",
  },
  {
    key: "digital",
    label: "Digital",
    tagline: "Sites and experiences built to convert, not just impress.",
    image: "/images/service-digital.jpg",
    alt: "Website and digital experience work in progress",
  },
  {
    key: "social",
    label: "Social",
    tagline: "Content with a point of view, and a plan behind it.",
    image: "/images/service-social.jpg",
    alt: "Social media content and strategy work in progress",
  },
];

export default function ConvergingCollage() {
  return (
    <>
      <DesktopCollage />
      <MobileFoldingCards />
    </>
  );
}

// ── Desktop: scroll-converge grid, unchanged from before ──────────────
function DesktopCollage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const sync = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.8", "end end"],
  });

  const aX = useTransform(scrollYProgress, [0, 1], [-200, 0]);
  const aOpacity = useTransform(scrollYProgress, (v) => Math.min(v / 0.6, 1));
  const bY = useTransform(scrollYProgress, [0, 1], [160, 0]);
  const bOpacity = useTransform(scrollYProgress, (v) => Math.min(v / 0.6, 1));
  const cX = useTransform(scrollYProgress, [0, 1], [200, 0]);
  const cOpacity = useTransform(scrollYProgress, (v) => Math.min(v / 0.6, 1));

  const columnMotion = [
    { x: aX, opacity: aOpacity },
    { y: bY, opacity: bOpacity },
    { x: cX, opacity: cOpacity },
  ] as const;

  const Grid = (
    <div className="grid w-full gap-8 md:grid-cols-3">
      {SERVICES.map((service, i) => (
        <motion.div key={service.key} style={reducedMotion ? undefined : columnMotion[i]}>
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
            <Image
              src={service.image}
              alt={service.alt}
              fill
              className="object-cover"
              sizes="33vw"
            />
          </div>
          <p className="mt-4 font-serif text-xl text-black">{service.label}</p>
          <p className="mt-1 font-mono text-sm leading-relaxed text-neutral-500">
            {service.tagline}
          </p>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="hidden md:block">
      {reducedMotion ? (
        Grid
      ) : (
        <div ref={trackRef} className="relative h-[220vh]">
          <div className="sticky top-0 flex h-screen w-full items-center">{Grid}</div>
        </div>
      )}
    </div>
  );
}

// ── Mobile: sticky folding card stack ──────────────────────────────
function MobileFoldingCards() {
  return (
    <div className="relative md:hidden">
      <p className="sticky top-4 z-20 mb-6 bg-white/95 px-1 py-2 font-mono text-xs uppercase tracking-widest text-neutral-500 backdrop-blur">
        What that looks like
      </p>
      <div className="flex flex-col gap-6">
        {SERVICES.map((service, i) => (
          <div
            key={service.key}
            className="sticky top-16 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            style={{ zIndex: i + 1 }}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
              <Image
                src={service.image}
                alt={service.alt}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
            <div className="p-5">
              <p className="font-serif text-xl text-black">{service.label}</p>
              <p className="mt-1 font-mono text-sm leading-relaxed text-neutral-500">
                {service.tagline}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
