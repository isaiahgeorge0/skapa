"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type ParallaxImageProps = {
  children: ReactNode;
  className?: string;
};

export default function ParallaxImage({
  children,
  className = "",
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const sync = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Soft ~100px vertical drift while the container is in view.
  const y = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        style={{ y }}
        className="absolute inset-x-0 -top-28 -bottom-28 will-change-transform"
      >
        <div className="relative h-full w-full">{children}</div>
      </motion.div>
    </div>
  );
}
