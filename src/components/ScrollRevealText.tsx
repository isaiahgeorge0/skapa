"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

function Word({
  children,
  range,
  progress,
  color,
}: {
  children: string;
  range: [number, number];
  progress: MotionValue<number>;
  color: string;
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <motion.span style={{ opacity, color }} className="inline">
      {children}{" "}
    </motion.span>
  );
}

export default function ScrollRevealText({
  text,
  accentText,
  className = "",
  accentColor = "#D6336C",
}: {
  text: string;
  accentText?: string;
  className?: string;
  accentColor?: string;
}) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    setReady(true);
    const sync = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Progress is measured across the paragraph's own scroll-through range:
  // starts activating just below the fold, finishes as it nears center.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "start 0.05"],
  });

  const words = text.trim().split(/\s+/);
  const accentWords = accentText ? accentText.trim().split(/\s+/) : [];
  const total = words.length + accentWords.length;

  if (!ready || reducedMotion) {
    return (
      <p ref={containerRef} className={className}>
        {text} {accentText && <span style={{ color: accentColor }}>{accentText}</span>}
      </p>
    );
  }

  return (
    <p ref={containerRef} className={className}>
      {words.map((w, i) => (
        <Word key={i} range={[i / total, (i + 1) / total]} progress={scrollYProgress} color="#000000">
          {w}
        </Word>
      ))}
      {accentWords.map((w, i) => {
        const idx = words.length + i;
        return (
          <Word
            key={`a-${i}`}
            range={[idx / total, (idx + 1) / total]}
            progress={scrollYProgress}
            color={accentColor}
          >
            {w}
          </Word>
        );
      })}
    </p>
  );
}
