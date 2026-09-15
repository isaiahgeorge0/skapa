"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

const SERVICES = [
  {
    key: "brand",
    label: "Brand",
    tagline: "Strategy, identity, and the systems that hold it together.",
    image: "/images/brand.jpg",
    alt: "Brand strategy notes, colour references and photography laid out on a desk",
    href: "/what-we-do/brand" as string | null,
    sizes: "(min-width: 768px) 50vw, 100vw",
  },
  {
    key: "creative",
    label: "Creative",
    tagline: "Campaigns, craft, and work that earns a second look.",
    image: "/images/creative.jpg",
    alt: "Studio photoshoot in progress with lighting, camera and product packing",
    href: null,
    sizes: "(min-width: 768px) 40vw, 92vw",
  },
  {
    key: "digital",
    label: "Digital",
    tagline: "Sites and experiences built to convert, not just impress.",
    image: "/images/service-digital.jpg",
    alt: "Laptop, phone and screens showing website design and development work",
    href: null,
    sizes: "(min-width: 768px) 40vw, 92vw",
  },
  {
    key: "social",
    label: "Social",
    tagline: "Content with a point of view, and a plan behind it.",
    image: "/images/service-social.jpg",
    alt: "Hands holding a phone open on a social media profile",
    href: null,
    sizes: "(min-width: 768px) 45vw, 100vw",
  },
] as const;

type Service = (typeof SERVICES)[number];

export default function HomeWhatWeDo() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    setReady(true);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!ready) {
    return (
      <>
        <div className="hidden md:block" aria-hidden="true">
          <SettledComposition />
        </div>
        <div className="md:hidden" aria-hidden="true">
          <MobileStatic />
        </div>
      </>
    );
  }

  return (
    <>
      {reducedMotion ? (
        <div className="hidden md:block">
          <SettledComposition />
        </div>
      ) : (
        <DesktopConverge />
      )}
      {reducedMotion ? (
        <div className="md:hidden">
          <MobileStatic />
        </div>
      ) : (
        <MobileFolding />
      )}
    </>
  );
}

function DesktopConverge() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.72", "end end"],
  });

  const brandX = useTransform(scrollYProgress, [0, 0.55], [-180, 0]);
  const brandY = useTransform(scrollYProgress, [0, 0.55], [-36, 0]);
  const brandO = useTransform(scrollYProgress, [0, 0.18, 0.45], [0.2, 0.8, 1]);

  const creativeX = useTransform(scrollYProgress, [0.05, 0.6], [190, 0]);
  const creativeY = useTransform(scrollYProgress, [0.05, 0.6], [-70, 0]);
  const creativeO = useTransform(scrollYProgress, [0.05, 0.25, 0.52], [0.15, 0.75, 1]);

  const digitalX = useTransform(scrollYProgress, [0.14, 0.68], [-48, 0]);
  const digitalY = useTransform(scrollYProgress, [0.14, 0.68], [190, 0]);
  const digitalO = useTransform(scrollYProgress, [0.14, 0.32, 0.6], [0.1, 0.7, 1]);

  const socialX = useTransform(scrollYProgress, [0.24, 0.78], [130, 0]);
  const socialY = useTransform(scrollYProgress, [0.24, 0.78], [170, 0]);
  const socialO = useTransform(scrollYProgress, [0.24, 0.42, 0.74], [0.08, 0.65, 1]);

  const [brand, creative, digital, social] = SERVICES;

  return (
    <div ref={trackRef} className="relative hidden h-[175vh] md:block">
      <div className="sticky top-0 flex h-[100svh] w-full items-center">
        <div className="grid w-full grid-cols-12 items-start gap-x-8 gap-y-4 lg:gap-x-10">
          <motion.div
            className="col-span-7"
            style={{ x: brandX, y: brandY, opacity: brandO }}
          >
            <ServiceBlock service={brand} frameClass="h-[34vh] max-h-[18.5rem]" />
          </motion.div>
          <motion.div
            className="col-span-5 pt-10 lg:pt-12"
            style={{ x: creativeX, y: creativeY, opacity: creativeO }}
          >
            <ServiceBlock service={creative} frameClass="h-[28vh] max-h-[15.5rem]" />
          </motion.div>
          <motion.div
            className="col-span-5 mt-2"
            style={{ x: digitalX, y: digitalY, opacity: digitalO }}
          >
            <ServiceBlock
              service={digital}
              frameClass="h-[24vh] max-h-[13.5rem]"
              objectClass="object-[center_40%]"
            />
          </motion.div>
          <motion.div
            className="col-span-6 col-start-7 -mt-5 lg:-mt-6"
            style={{ x: socialX, y: socialY, opacity: socialO }}
          >
            <ServiceBlock service={social} frameClass="h-[30vh] max-h-[16.5rem]" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SettledComposition() {
  const [brand, creative, digital, social] = SERVICES;

  return (
    <div className="grid w-full grid-cols-12 items-start gap-x-8 gap-y-4 lg:gap-x-10">
      <div className="col-span-7">
        <ServiceBlock service={brand} frameClass="h-[34vh] max-h-[18.5rem]" />
      </div>
      <div className="col-span-5 pt-10 lg:pt-12">
        <ServiceBlock service={creative} frameClass="h-[28vh] max-h-[15.5rem]" />
      </div>
      <div className="col-span-5 mt-2">
        <ServiceBlock
          service={digital}
          frameClass="h-[24vh] max-h-[13.5rem]"
          objectClass="object-[center_40%]"
        />
      </div>
      <div className="col-span-6 col-start-7 -mt-5 lg:-mt-6">
        <ServiceBlock service={social} frameClass="h-[30vh] max-h-[16.5rem]" />
      </div>
    </div>
  );
}

function MobileFolding() {
  return (
    <div className="relative md:hidden">
      <div className="flex flex-col gap-5">
        {SERVICES.map((service, index) => (
          <div
            key={service.key}
            className={`sticky overflow-hidden border border-neutral-200 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.07)] ${
              index === 1 ? "ml-auto w-[94%]" : index === 2 ? "w-[96%]" : "w-full"
            }`}
            style={{
              top: "calc(var(--skapa-site-chrome-height) + 0.75rem)",
              zIndex: index + 1,
            }}
          >
            <ServiceBlock
              service={service}
              frameClass={
                index === 2
                  ? "aspect-[5/4]"
                  : index === 1
                    ? "aspect-[3/4]"
                    : "aspect-[4/5]"
              }
              objectClass={index === 2 ? "object-[center_40%]" : "object-center"}
              compact
            />
          </div>
        ))}
      </div>
      <div className="h-14" aria-hidden="true" />
    </div>
  );
}

function MobileStatic() {
  return (
    <div className="flex flex-col gap-10 md:hidden">
      {SERVICES.map((service, index) => (
        <div
          key={service.key}
          className={
            index === 1 ? "ml-auto w-[88%]" : index === 2 ? "w-[92%]" : "w-full"
          }
        >
          <ServiceBlock
            service={service}
            frameClass={
              index === 2
                ? "aspect-[5/4]"
                : index === 1
                  ? "aspect-[3/4]"
                  : "aspect-[4/5]"
            }
            objectClass={index === 2 ? "object-[center_40%]" : "object-center"}
          />
        </div>
      ))}
    </div>
  );
}

function ServiceBlock({
  service,
  frameClass,
  objectClass = "object-center",
  compact = false,
}: {
  service: Service;
  frameClass: string;
  objectClass?: string;
  compact?: boolean;
}) {
  const caption = (
    <div
      className={`flex items-baseline justify-between gap-4 ${
        compact ? "px-4 py-3.5" : "mt-3.5"
      }`}
    >
      <div>
        <p className="font-serif text-xl text-black md:text-[1.35rem]">{service.label}</p>
        <p className="mt-1 max-w-[36ch] font-mono text-[13px] leading-relaxed text-neutral-500 md:text-sm">
          {service.tagline}
        </p>
      </div>
      {service.href ? (
        <span
          aria-hidden="true"
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400 transition-colors group-hover:text-black md:text-[11px]"
        >
          Explore →
        </span>
      ) : null}
    </div>
  );

  const frame = (
    <>
      <div className={`relative w-full overflow-hidden bg-neutral-100 ${frameClass}`}>
        <Image
          src={service.image}
          alt={service.alt}
          fill
          className={`object-cover ${objectClass}`}
          sizes={service.sizes}
        />
      </div>
      {caption}
    </>
  );

  if (service.href) {
    return (
      <Link
        href={service.href}
        className="group block outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4"
      >
        {frame}
      </Link>
    );
  }

  return <div>{frame}</div>;
}
