"use client";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type ReactNode,
  type HTMLAttributes,
  type CSSProperties,
} from "react";

type FadeInOnLoadProps = {
  children: ReactNode;
  className?: string;
};

// Plays once on mount — not tied to scroll position at all.
// Intended for above-the-fold content (like the hero) that should
// announce itself on page load and then simply stay visible,
// rather than fading out again if the user scrolls past it.
export default function FadeInOnLoad({
  children,
  className = "",
}: FadeInOnLoadProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Small delay so the transition is visibly triggered rather than
    // the browser painting the "visible" state before styles apply.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [ready]);

  const show = !ready || reducedMotion || mounted;
  const animate = ready && !reducedMotion;
  const items = Children.toArray(children);

  return (
    <div className={className}>
      {items.map((child, index) => {
        if (!isValidElement(child)) return child;

        const animationClasses = animate
          ? `transition-[opacity,transform] duration-700 ease-out ${
              show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`
          : "";

        const props = child.props as {
          className?: string;
          style?: CSSProperties;
        };

        return cloneElement(
          child as React.ReactElement<HTMLAttributes<HTMLElement>>,
          {
            className: [props.className, animationClasses]
              .filter(Boolean)
              .join(" "),
            style: {
              ...props.style,
              ...(animate ? { transitionDelay: `${index * 100}ms` } : {}),
            },
          },
        );
      })}
    </div>
  );
}
