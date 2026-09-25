"use client";

import { useLayoutEffect } from "react";

/**
 * Syncs portal accent onto <html> for soft navigations and so
 * getComputedStyle(document.documentElement) sees the live value.
 * Initial paint already has the accent on the server-rendered portal wrapper.
 */
export default function PortalAccentVars({ accent }: { accent: string }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const prevAccent = root.style.getPropertyValue("--portal-accent");
    const prevColor = root.style.getPropertyValue("--color-portal-accent");
    const prevBodyBg = document.body.style.backgroundColor;

    root.style.setProperty("--portal-accent", accent);
    root.style.setProperty("--color-portal-accent", accent);
    // Match the cream page field so short mobile pages don't flash body white.
    document.body.style.backgroundColor = "var(--brand-cream)";

    return () => {
      if (prevAccent) {
        root.style.setProperty("--portal-accent", prevAccent);
      } else {
        root.style.removeProperty("--portal-accent");
      }
      if (prevColor) {
        root.style.setProperty("--color-portal-accent", prevColor);
      } else {
        root.style.removeProperty("--color-portal-accent");
      }
      document.body.style.backgroundColor = prevBodyBg;
    };
  }, [accent]);

  return null;
}
