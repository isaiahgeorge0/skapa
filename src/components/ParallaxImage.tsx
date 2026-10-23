"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type ParallaxImageProps = {
  children: ReactNode;
  className?: string;
  // Optional override for the scroll-tracking range. Defaults to the
  // original ["start end", "end start"] behavior, so any
  // existing usage (e.g. the desktop hero) is completely unaffected
  // unless it explicitly opts into a different range.
  // Motion accepts extended offset strings (e.g. "end -30%"); keep prop ergonomic.
  offset?: readonly [string, string];
};

export default function ParallaxImage({
  children,
  className = "",
  offset = ["start end", "end start"],
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as never,
  });

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
