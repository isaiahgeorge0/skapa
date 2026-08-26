"use client";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function ConvergingCollage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const sync = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Animation plays out as the container scrolls from just below the
  // fold (90% down the viewport) to just above center (30% down) —
  // this is what makes it feel scrubbed/tracked rather than a one-shot trigger.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "start 0.3"],
  });

  // Image A: final position is left-0 top-6, tilted -3deg. Enters from the left.
  const aX = useTransform(scrollYProgress, [0, 1], [-260, 0]);
  const aY = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const aRotate = useTransform(scrollYProgress, [0, 1], [-18, -3]);
  const aOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  // Image B: final position is right-0 top-0, tilted 2deg. Enters from the right.
  const bX = useTransform(scrollYProgress, [0, 1], [260, 0]);
  const bY = useTransform(scrollYProgress, [0, 1], [-20, 0]);
  const bRotate = useTransform(scrollYProgress, [0, 1], [16, 2]);
  const bOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  // Image C: final position is bottom-2 left-[22%], tilted 1deg. Enters from below.
  const cY = useTransform(scrollYProgress, [0, 1], [220, 0]);
  const cRotate = useTransform(scrollYProgress, [0, 1], [-12, 1]);
  const cOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  if (reducedMotion) {
    // Static final layout, no motion at all — respects the OS preference.
    return (
      <div className="relative mx-auto h-[380px] w-full max-w-4xl md:h-[520px]">
        <div className="absolute left-0 top-6 z-10 w-[58%] -rotate-3 md:left-[4%] md:top-8 md:w-[48%]">
          <Image
            src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1000&q=80"
            alt="Candid workspace moment with a laptop and papers"
            width={1000}
            height={1250}
            className="aspect-[4/5] w-full object-cover"
            sizes="(max-width: 768px) 60vw, 30vw"
          />
        </div>
        <div className="absolute right-0 top-0 z-20 w-[48%] rotate-2 md:right-[6%] md:w-[40%]">
          <Image
            src="https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=900&q=80"
            alt="Editorial desk setup with camera and notebook"
            width={900}
            height={1100}
            className="aspect-[4/5] w-full object-cover"
            sizes="(max-width: 768px) 50vw, 28vw"
          />
        </div>
        <div className="absolute bottom-2 left-[22%] z-30 w-[42%] rotate-1 md:bottom-4 md:left-[30%] md:w-[34%]">
          <Image
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80"
            alt="Warm flatlay of a laptop and coffee on a wooden surface"
            width={900}
            height={700}
            className="aspect-[5/4] w-full object-cover"
            sizes="(max-width: 768px) 45vw, 25vw"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto h-[380px] w-full max-w-4xl md:h-[520px]"
    >
      <motion.div
        style={{ x: aX, y: aY, rotate: aRotate, opacity: aOpacity }}
        className="absolute left-0 top-6 z-10 w-[58%] md:left-[4%] md:top-8 md:w-[48%]"
      >
        <Image
          src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1000&q=80"
          alt="Candid workspace moment with a laptop and papers"
          width={1000}
          height={1250}
          className="aspect-[4/5] w-full object-cover"
          sizes="(max-width: 768px) 60vw, 30vw"
        />
      </motion.div>

      <motion.div
        style={{ x: bX, y: bY, rotate: bRotate, opacity: bOpacity }}
        className="absolute right-0 top-0 z-20 w-[48%] md:right-[6%] md:w-[40%]"
      >
        <Image
          src="https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=900&q=80"
          alt="Editorial desk setup with camera and notebook"
          width={900}
          height={1100}
          className="aspect-[4/5] w-full object-cover"
          sizes="(max-width: 768px) 50vw, 28vw"
        />
      </motion.div>

      <motion.div
        style={{ y: cY, rotate: cRotate, opacity: cOpacity }}
        className="absolute bottom-2 left-[22%] z-30 w-[42%] md:bottom-4 md:left-[30%] md:w-[34%]"
      >
        <Image
          src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80"
          alt="Warm flatlay of a laptop and coffee on a wooden surface"
          width={900}
          height={700}
          className="aspect-[5/4] w-full object-cover"
          sizes="(max-width: 768px) 45vw, 25vw"
        />
      </motion.div>
    </div>
  );
}
