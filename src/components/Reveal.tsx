"use client";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type HTMLAttributes,
  type CSSProperties,
} from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
};

export default function Reveal({ children, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    setReady(true);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!ready || reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Toggles both ways: fades in on scroll into view,
        // fades back out on scroll out of view, in either direction.
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready, reducedMotion]);

  const show = !ready || reducedMotion || visible;
  const animate = ready && !reducedMotion;
  const items = Children.toArray(children);

  return (
    <div ref={ref} className={className}>
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
