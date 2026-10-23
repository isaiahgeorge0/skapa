"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function snapshot() {
  return window.matchMedia(QUERY).matches;
}

function serverSnapshot() {
  return false;
}

function subscribeReady() {
  return () => {};
}

function readySnapshot() {
  return true;
}

function readyServerSnapshot() {
  return false;
}

export function useReducedMotion() {
  const reducedMotion = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const ready = useSyncExternalStore(
    subscribeReady,
    readySnapshot,
    readyServerSnapshot,
  );
  return { reducedMotion, ready };
}
