"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export default function ScaledStage({ children, width }: { children: ReactNode; width: number }) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(320);

  useLayoutEffect(() => {
    const node = frame.current;
    const content = inner.current;
    if (!node || !content) return;
    const measure = () => {
      setScale(node.clientWidth / width);
      setHeight(content.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observer.observe(content);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={frame} className="relative w-full overflow-hidden" style={{ height: height * scale }}>
      <div
        ref={inner}
        className="absolute top-0 left-0"
        style={{ width, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}
