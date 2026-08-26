"use client";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function ConvergingCollage() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const sync = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // The track is much taller than the visible stage. Progress is measured
  // across the ENTIRE track height (start of track hits top of viewport,
  // through to end of track hitting bottom of viewport) — this is what
  // gives the animation a long, deliberate scroll distance to play out
  // over, rather than the ~60% of one viewport-height it had before.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const aX = useTransform(scrollYProgress, [0, 1], [-260, 0]);
  const aY = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const aRotate = useTransform(scrollYProgress, [0, 1], [-18, -3]);
  const aOpacity = useTransform(scrollYProgress, (v) => Math.min(v / 0.6, 1));

  const bX = useTransform(scrollYProgress, [0, 1], [260, 0]);
  const bY = useTransform(scrollYProgress, [0, 1], [-20, 0]);
  const bRotate = useTransform(scrollYProgress, [0, 1], [16, 2]);
  const bOpacity = useTransform(scrollYProgress, (v) => Math.min(v / 0.6, 1));

  const cY = useTransform(scrollYProgress, [0, 1], [220, 0]);
  const cRotate = useTransform(scrollYProgress, [0, 1], [-12, 1]);
  const cOpacity = useTransform(scrollYProgress, (v) => Math.min(v / 0.6, 1));

  const Stage = (
    <div className="relative mx-auto h-[380px] w-full max-w-4xl md:h-[520px]">
      <motion.div
        style={
          reducedMotion
            ? undefined
            : { x: aX, y: aY, rotate: aRotate, opacity: aOpacity }
        }
        className={`absolute left-0 top-6 z-10 w-[58%] md:left-[4%] md:top-8 md:w-[48%] ${
          reducedMotion ? "-rotate-3" : ""
        }`}
      >
        <div className="relative aspect-[4/5] w-full">
          <Image
            src="/images/pexels-tony-schnagl-5586315.jpg"
            alt="Overhead flat-lay of a laptop and hands with a photo moodboard on screen"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 60vw, 30vw"
          />
        </div>
      </motion.div>

      <motion.div
        style={
          reducedMotion
            ? undefined
            : { x: bX, y: bY, rotate: bRotate, opacity: bOpacity }
        }
        className={`absolute right-0 top-0 z-20 w-[48%] md:right-[6%] md:w-[40%] ${
          reducedMotion ? "rotate-2" : ""
        }`}
      >
        <div className="relative aspect-[4/5] w-full">
          <Image
            src="/images/pexels-rdne-10376162.jpg"
            alt="Man reclining on a white sofa with a laptop among plants"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 28vw"
          />
        </div>
      </motion.div>

      <motion.div
        style={
          reducedMotion ? undefined : { y: cY, rotate: cRotate, opacity: cOpacity }
        }
        className={`absolute bottom-2 left-[22%] z-30 w-[42%] md:bottom-4 md:left-[30%] md:w-[34%] ${
          reducedMotion ? "rotate-1" : ""
        }`}
      >
        <div className="relative aspect-[5/4] w-full">
          <Image
            src="/images/pexels-cup-of-couple-6956904.jpg"
            alt="Man on a sofa with shopping bags, a laptop, and a phone"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 45vw, 25vw"
          />
        </div>
      </motion.div>
    </div>
  );

  if (reducedMotion) {
    // No scroll track needed — just the static final composition,
    // no extra page height, no motion.
    return Stage;
  }

  return (
    <div ref={trackRef} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center">
        {Stage}
      </div>
    </div>
  );
}
