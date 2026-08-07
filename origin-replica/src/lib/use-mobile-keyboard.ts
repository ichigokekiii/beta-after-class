"use client";

import { useEffect, useState } from "react";

const KEYBOARD_THRESHOLD_PX = 120;

function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px), (hover: none) and (pointer: coarse)").matches;
}

/** True when the mobile virtual keyboard has shrunk the visual viewport. */
export function useMobileKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const sync = () => {
      if (!isCoarsePointer()) {
        setOpen(false);
        return;
      }
      const obscured = Math.max(0, window.innerHeight - vv.height);
      setOpen(obscured > KEYBOARD_THRESHOLD_PX);
    };

    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);

  return open;
}

export function keepFieldInView(el: HTMLElement | null) {
  if (!el || !isCoarsePointer()) return;

  const run = () => {
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  };

  requestAnimationFrame(() => {
    run();
    window.setTimeout(run, 280);
  });
}
