/** Origin-style staged wake-up for the After Class waitlist. */

export type WaitlistRevealKey = 'crosshair' | 'background' | 'content'

export const WAITLIST_REVEAL_MS: Record<WaitlistRevealKey, number> = {
  crosshair: 100,
  background: 500,
  content: 800,
}

export const WAITLIST_SUCCESS_EVENT = 'afterclass:waitlist-success'

/** Match Origin submit pulse window (~1.9s). */
export const WAITLIST_SUCCESS_PULSE_MS = 1900

export const WAITLIST_LISSAJOUS = {
  freqX: 2,
  freqY: 3,
  radiusX: 3,
  radiusY: 2,
  segments: 1200,
  phase: 3 * Math.PI,
  scale: 1,
  solidFraction: 0.25,
  dash: [5, 7] as [number, number],
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
  mobile: {
    scale: 1.25,
    anchor: { fromLeft: -0.5, fromBottom: 0.1 },
    solidOnly: true,
  },
} as const

export function dispatchWaitlistSuccess() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(WAITLIST_SUCCESS_EVENT))
}
