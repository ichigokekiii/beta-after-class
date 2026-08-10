/**
 * Typed intro / background animation registry extracted from Origin.
 */

export type IntroPhase =
  | "idle"
  | "crosshair"
  | "background"
  | "content"
  | "loopsDrawing"
  | "settled";

export type RevealKey = "crosshair" | "background" | "content";

/** Delays from useCrosshairRevealed / useBackgroundRevealed / useContentRevealed. */
export const REVEAL_MS: Record<RevealKey, number> = {
  crosshair: 100,
  background: 500,
  content: 800,
};

export type LissajousConfig = {
  freqX: number;
  freqY: number;
  radiusX: number;
  radiusY: number;
  segments: number;
  phase: number;
  scale: number;
  solidFraction: number;
  dash: [number, number];
  dashSpeed: number;
  lineWidth: number;
  intro: {
    drawOnMs: number;
    dashDrawOnMs: number;
    dashOffscreenMs: number;
    dashOvershoot: number;
    expandMs: number;
    expandDelayMs: number;
    centerHeightFraction: number;
  };
  anchor: { fromLeft: number; fromBottom: number };
};

export const LISSAJOUS: LissajousConfig = {
  freqX: 2,
  freqY: 3,
  radiusX: 3,
  radiusY: 2,
  segments: 1200,
  phase: 3 * Math.PI,
  scale: 1,
  solidFraction: 0.25,
  dash: [5, 7],
  dashSpeed: 12,
  lineWidth: 1,
  intro: {
    drawOnMs: 4400,
    dashDrawOnMs: 4400,
    dashOffscreenMs: 2400,
    dashOvershoot: 0.064,
    expandMs: 1600,
    expandDelayMs: 500,
    centerHeightFraction: 0.5,
  },
  anchor: { fromLeft: 0.1, fromBottom: 0.06 },
};

/** Mobile / landscape-short variants from Origin. */
export const LISSAJOUS_MOBILE = {
  scale: 1.25,
  anchor: { fromLeft: -0.5, fromBottom: 0.1 },
  solidOnly: true,
} as const;

export const LISSAJOUS_LANDSCAPE_SHORT = {
  scale: 2.25,
  anchor: { fromLeft: -0.175, fromBottom: -0.1 },
  solidOnly: true,
} as const;

export const RIPPLE = {
  fringeAmount: 0.008,
  fringeStart: 0.45,
  fringeDistort: 0.01,
  orbAmount: 0.1,
  zoomIntroMs: 9000,
  zoomSettleMs: 40000,
  zoomPeak: 1.125,
  zoomSettle: 1.06,
  parallaxMax: 0.015,
  submitPulseMs: 1900,
  submitPulseAmp: 0.015,
} as const;

export const HERO_BACKGROUND_SRC = "/origin_background.webp";

export const WAITLIST_SUCCESS_EVENT = "origin:waitlist-success";

export function phaseAt(ms: number): IntroPhase {
  if (ms < REVEAL_MS.crosshair) return "idle";
  if (ms < REVEAL_MS.background) return "crosshair";
  if (ms < REVEAL_MS.content) return "background";
  if (ms < LISSAJOUS.intro.drawOnMs + LISSAJOUS.intro.dashOffscreenMs) {
    return "loopsDrawing";
  }
  return "settled";
}
