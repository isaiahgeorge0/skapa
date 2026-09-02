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

    root.style.setProperty("--portal-accent", accent);
    root.style.setProperty("--color-portal-accent", accent);

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
    };
  }, [accent]);

  return null;
}
