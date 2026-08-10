"use client";

import { useEffect, useRef } from "react";
import {
  LISSAJOUS,
  LISSAJOUS_LANDSCAPE_SHORT,
  LISSAJOUS_MOBILE,
  type LissajousConfig,
} from "@/lib/animation-timeline";
import { easeIntroGlide, invEaseGlide, prefersReducedMotion } from "@/lib/easing";
import { createRenderLoop } from "@/lib/render-loop";

const TAU = 2 * Math.PI;

/** Secondary dashed stroke — small curve tucked in the lower-left corner. */
const SECONDARY_DASH = {
  startDelayMs: 1300,
  drawMs: 1800,
  dashSpeed: 9,
  dash: [5, 7] as [number, number],
  lineWidth: 1,
  opacity: 1,
  segments: 120,
  // Lower-left: left → bottom, light outward bow, near corner
  start: { x: -0.02, y: 0.8 },
  control: { x: 0.1, y: 0.86 },
  end: { x: 0.2, y: 1.02 },
};

type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

function computeBounds(cfg: LissajousConfig): Bounds {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i <= cfg.segments; i++) {
    const t = (i / cfg.segments) * TAU;
    const x = cfg.radiusX * Math.sin(cfg.freqX * t);
    const y = cfg.radiusY * Math.sin(cfg.freqY * t);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, maxX, minY, maxY };
}

function anchorOffset(
  bounds: Bounds,
  scale: number,
  cx: number,
  cy: number,
  width: number,
  height: number,
  anchor: { fromLeft: number; fromBottom: number },
): [number, number] {
  const targetX = anchor.fromLeft * width;
  const targetY = (1 - anchor.fromBottom) * height;
  return [targetX - (cx + bounds.minX * scale), targetY - (cy + bounds.maxY * scale)];
}

type Variant = "desktop" | "mobile" | "landscapeShort";

function resolveVariant(): Variant {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia("(max-width: 767px)").matches) return "mobile";
  if (
    window.matchMedia("(max-height: 500px) and (orientation: landscape)").matches
  ) {
    return "landscapeShort";
  }
  return "desktop";
}

type Props = {
  className?: string;
};

export function OriginLoops({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cfg = LISSAJOUS;
    const bounds = computeBounds(cfg);
    const reduced = prefersReducedMotion();
    let start = 0;
    let complete = false;
    let dashTimes: Float64Array | null = null;
    let dashTotal = cfg.intro.dashDrawOnMs + cfg.intro.dashOffscreenMs;
    let sizeKey = "";
    let disposed = false;

    const solidEnd = Math.ceil(cfg.segments * cfg.solidFraction);
    const overshootEnd =
      cfg.segments + Math.round(cfg.segments * cfg.intro.dashOvershoot);

    const rebuildDashSchedule = (
      width: number,
      height: number,
      scale: number,
      anchor: { fromLeft: number; fromBottom: number },
      solidOnly: boolean,
    ) => {
      if (solidOnly) {
        dashTimes = null;
        dashTotal = 0;
        return;
      }
      const minDim = Math.min(width, height);
      const cx = 0.5 * width;
      const cy = 0.5 * height;
      const amp = minDim * scale;
      const [ox, oy] = anchorOffset(bounds, amp, cx, cy, width, height, anchor);

      const onScreen = (i: number) => {
        const t = (i / cfg.segments) * TAU;
        const x = cx + cfg.radiusX * Math.sin(cfg.freqX * t + cfg.phase) * amp + ox;
        const y = cy + cfg.radiusY * Math.sin(cfg.freqY * t) * amp + oy;
        return x >= 0 && x <= width && y >= 0 && y <= height;
      };

      let onCount = 0;
      let offCount = 0;
      for (let i = solidEnd + 1; i <= overshootEnd; i++) {
        if (onScreen(i)) onCount++;
        else offCount++;
      }

      const onBudget = cfg.intro.dashDrawOnMs;
      const offStep = offCount > 0 ? cfg.intro.dashOffscreenMs / offCount : 0;
      const times = new Float64Array(overshootEnd + 1);
      let elapsed = 0;
      let onSeen = 0;
      for (let i = solidEnd + 1; i <= overshootEnd; i++) {
        if (onScreen(i)) {
          onSeen++;
          const cur =
            onCount > 0 ? onBudget * invEaseGlide(onSeen / onCount) : 0;
          const prev =
            onCount > 0
              ? onBudget * invEaseGlide((onSeen - 1) / onCount)
              : 0;
          elapsed += cur - prev;
        } else {
          elapsed += offStep;
        }
        times[i] = elapsed;
      }
      dashTimes = times;
      dashTotal = elapsed;
      sizeKey = `${width}x${height}`;
    };

    const drawCurve = (
      progressSegments: number,
      cx: number,
      cy: number,
      amp: number,
      ox: number,
      oy: number,
      dpr: number,
      dashOffset: number,
    ) => {
      const end = Math.max(0, progressSegments);
      const solidCap = cfg.segments * cfg.solidFraction;
      ctx.lineWidth = cfg.lineWidth * dpr;
      ctx.strokeStyle = "rgb(255, 255, 255)";
      ctx.globalAlpha = 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const point = (i: number): [number, number] => {
        const t = (i / cfg.segments) * TAU;
        return [
          cx + cfg.radiusX * Math.sin(cfg.freqX * t + cfg.phase) * amp + ox,
          cy + cfg.radiusY * Math.sin(cfg.freqY * t) * amp + oy,
        ];
      };

      const strokeRange = (from: number, to: number) => {
        if (to <= from) return;
        ctx.beginPath();
        const [x0, y0] = point(from);
        ctx.moveTo(x0, y0);
        const last = Math.floor(to);
        for (let i = Math.floor(from) + 1; i <= last; i++) {
          const [x, y] = point(i);
          ctx.lineTo(x, y);
        }
        if (to > last) {
          const [x, y] = point(to);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      ctx.setLineDash([]);
      strokeRange(0, Math.min(end, solidCap));
      if (end > solidCap) {
        ctx.setLineDash([cfg.dash[0] * dpr, cfg.dash[1] * dpr]);
        ctx.lineDashOffset = -dashOffset;
        strokeRange(solidCap, end);
        ctx.setLineDash([]);
      }
    };

    const drawSecondaryDash = (
      progress: number,
      width: number,
      height: number,
      dpr: number,
      localElapsed: number,
    ) => {
      if (progress <= 0) return;

      const s = SECONDARY_DASH;
      const p0 = { x: s.start.x * width, y: s.start.y * height };
      const p1 = { x: s.control.x * width, y: s.control.y * height };
      const p2 = { x: s.end.x * width, y: s.end.y * height };
      const steps = Math.max(2, Math.floor(s.segments * Math.min(progress, 1)));

      ctx.globalAlpha = s.opacity;
      ctx.lineWidth = s.lineWidth * dpr;
      ctx.strokeStyle = "rgb(255, 255, 255)";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash([s.dash[0] * dpr, s.dash[1] * dpr]);
      ctx.lineDashOffset = -((localElapsed / 1000) * s.dashSpeed * dpr);

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.min(progress, 1);
        const u = 1 - t;
        const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x;
        const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    };

    const loop = createRenderLoop({
      canvas,
      isComplete: () => complete,
      render: (now) => {
        if (disposed) return;
        if (start === 0) start = now;

        const variant = resolveVariant();
        const variantCfg =
          variant === "mobile"
            ? LISSAJOUS_MOBILE
            : variant === "landscapeShort"
              ? LISSAJOUS_LANDSCAPE_SHORT
              : null;
        const solidOnly = variantCfg?.solidOnly ?? false;
        const scale = variantCfg?.scale ?? cfg.scale;
        const anchor = variantCfg?.anchor ?? cfg.anchor;
        const showSecondary = !solidOnly && variant === "desktop";

        const width = canvas.width;
        const height = canvas.height;
        const dpr = canvas.clientWidth ? width / canvas.clientWidth : 1;
        const key = `${width}x${height}`;
        if (!solidOnly && key !== sizeKey) {
          rebuildDashSchedule(width, height, scale, anchor, solidOnly);
        }

        const elapsed = now - start;
        const solidDrawMs = cfg.intro.drawOnMs * cfg.solidFraction;
        const fullProgress = solidOnly
          ? cfg.solidFraction
          : overshootEnd / cfg.segments;

        let progress: number;
        if (reduced || complete) {
          progress = fullProgress;
        } else if (elapsed < solidDrawMs) {
          progress = cfg.solidFraction * (elapsed / solidDrawMs);
        } else if (solidOnly) {
          progress = cfg.solidFraction;
        } else {
          const dashElapsed = elapsed - solidDrawMs;
          if (!dashTimes || dashElapsed >= dashTotal) {
            progress = overshootEnd / cfg.segments;
          } else {
            let lo = solidEnd + 1;
            let hi = overshootEnd;
            while (lo < hi) {
              const mid = (lo + hi) >> 1;
              if (dashTimes[mid] < dashElapsed) lo = mid + 1;
              else hi = mid;
            }
            const prev = dashTimes[lo - 1] ?? 0;
            const next = dashTimes[lo] ?? prev;
            const frac =
              next > prev ? (dashElapsed - prev) / (next - prev) : 0;
            progress = (lo - 1 + frac) / cfg.segments;
          }
        }

        const expandT = reduced
          ? 1
          : Math.min(
              Math.max(elapsed - cfg.intro.expandDelayMs, 0) /
                cfg.intro.expandMs,
              1,
            );
        const expand = easeIntroGlide(expandT);

        const midX = (bounds.minX + bounds.maxX) / 2;
        const midY = (bounds.minY + bounds.maxY) / 2;
        const centerAmp =
          (cfg.intro.centerHeightFraction * height) /
          (bounds.maxY - bounds.minY);
        const finalAmp = Math.min(width, height) * scale;
        const cx = 0.5 * width;
        const cy = 0.5 * height;
        const [finalOx, finalOy] = anchorOffset(
          bounds,
          finalAmp,
          cx,
          cy,
          width,
          height,
          anchor,
        );
        const startOx = -midX * centerAmp;
        const startOy = -midY * centerAmp;
        const ox = startOx + (finalOx - startOx) * expand;
        const oy = startOy + (finalOy - startOy) * expand;
        const amp = centerAmp + (finalAmp - centerAmp) * expand;
        const dashOffset = (elapsed / 1000) * cfg.dashSpeed * dpr;

        ctx.clearRect(0, 0, width, height);
        drawCurve(progress * cfg.segments, cx, cy, amp, ox, oy, dpr, dashOffset);

        if (showSecondary) {
          const local = elapsed - SECONDARY_DASH.startDelayMs;
          const secondaryProgress =
            reduced || complete
              ? 1
              : local <= 0
                ? 0
                : easeIntroGlide(Math.min(local / SECONDARY_DASH.drawMs, 1));
          drawSecondaryDash(
            secondaryProgress,
            width,
            height,
            dpr,
            Math.max(0, local),
          );
        }

        const primaryDoneAt = Math.max(
          solidOnly ? solidDrawMs : solidDrawMs + dashTotal,
          cfg.intro.expandDelayMs + cfg.intro.expandMs,
        );
        const secondaryDoneAt = showSecondary
          ? SECONDARY_DASH.startDelayMs + SECONDARY_DASH.drawMs
          : 0;
        if (elapsed >= Math.max(primaryDoneAt, secondaryDoneAt)) complete = true;
      },
    });

    loop.enable();

    return () => {
      disposed = true;
      loop.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? "absolute inset-0 size-full"}
    />
  );
}
