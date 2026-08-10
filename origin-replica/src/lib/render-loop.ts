"use client";

import { prefersReducedMotion } from "@/lib/easing";

const THROTTLE_MS = 1000 / 30;

function fitCanvas(canvas: HTMLCanvasElement): boolean {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    return true;
  }
  return false;
}

export function createRenderLoop({
  canvas,
  render,
  onResize,
  isThrottled,
  isComplete,
}: {
  canvas: HTMLCanvasElement;
  render: (now: number) => void;
  onResize?: () => void;
  isThrottled?: () => boolean;
  isComplete?: () => boolean;
}) {
  const reducedMotion = prefersReducedMotion();
  let enabled = false;
  let visible = false;
  let running = false;
  let raf = 0;
  let last = -Infinity;
  let finished = false;

  const once = () => render(performance.now());

  const tick = (now: number) => {
    if (!running) return;
    const throttle = isThrottled?.() ?? false;
    if (!throttle || now - last >= THROTTLE_MS) {
      last = now;
      render(now);
      if (isComplete?.()) {
        finished = true;
        running = false;
        return;
      }
    }
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running || reducedMotion || !enabled || !visible) return;
    if (finished) {
      once();
      return;
    }
    running = true;
    raf = requestAnimationFrame(tick);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  fitCanvas(canvas);
  onResize?.();

  const ro = new ResizeObserver(() => {
    fitCanvas(canvas);
    onResize?.();
    if (enabled) once();
  });
  ro.observe(canvas);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  io.observe(canvas);

  return {
    reducedMotion,
    enable: () => {
      if (enabled) return;
      enabled = true;
      if (reducedMotion) once();
      else start();
    },
    renderOnce: once,
    dispose: () => {
      stop();
      ro.disconnect();
      io.disconnect();
    },
  };
}
