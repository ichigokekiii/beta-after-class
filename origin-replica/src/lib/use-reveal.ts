"use client";

import { useEffect, useState } from "react";
import { REVEAL_MS, type RevealKey } from "@/lib/animation-timeline";
import { prefersReducedMotion } from "@/lib/easing";

export function useReveal(key: RevealKey): boolean {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setRevealed(true);
      return;
    }
    const id = window.setTimeout(() => setRevealed(true), REVEAL_MS[key]);
    return () => window.clearTimeout(id);
  }, [key]);

  return revealed;
}

export function useCrosshairRevealed() {
  return useReveal("crosshair");
}

export function useBackgroundRevealed() {
  return useReveal("background");
}

export function useContentRevealed() {
  return useReveal("content");
}
