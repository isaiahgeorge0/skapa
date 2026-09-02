"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Ensure portal route changes always land at the top of the page. */
export default function PortalScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
