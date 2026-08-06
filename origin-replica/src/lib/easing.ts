/**
 * Easing tables extracted from Cursor Origin chunk 762642 (easeGlide / INTRO_GLIDE).
 */

type Point = readonly [number, number];

function lerpTable(table: Point[], t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  for (let i = 1; i < table.length; i++) {
    const [ax, ay] = table[i];
    if (t <= ax) {
      const [bx, by] = table[i - 1];
      return by + (ay - by) * ((t - bx) / (ax - bx));
    }
  }
  return 1;
}

/** Soft glide used by the ripple zoom. */
const GLIDE: Point[] = [
  [0, 0],
  [0.01, 0.013],
  [0.022, 0.051],
  [0.098, 0.404],
  [0.126, 0.51],
  [0.155, 0.602],
  [0.187, 0.683],
  [0.222, 0.754],
  [0.26, 0.813],
  [0.302, 0.861],
  [0.348, 0.9],
  [0.4, 0.931],
  [0.527, 0.972],
  [0.702, 0.992],
  [1, 1],
];

/** Intro expand ease (INTRO_GLIDE). */
export const INTRO_GLIDE: Point[] = [
  [0, 0],
  [0.006, 0.004],
  [0.012, 0.014],
  [0.019, 0.032],
  [0.027, 0.058],
  [0.041, 0.114],
  [0.085, 0.313],
  [0.11, 0.417],
  [0.124, 0.47],
  [0.138, 0.519],
  [0.152, 0.563],
  [0.167, 0.607],
  [0.183, 0.649],
  [0.199, 0.686],
  [0.216, 0.722],
  [0.234, 0.755],
  [0.252, 0.785],
  [0.271, 0.812],
  [0.291, 0.837],
  [0.312, 0.86],
  [0.334, 0.88],
  [0.358, 0.899],
  [0.383, 0.915],
  [0.409, 0.93],
  [0.437, 0.942],
  [0.468, 0.954],
  [0.501, 0.964],
  [0.536, 0.972],
  [0.614, 0.984],
  [0.709, 0.992],
  [0.83, 0.997],
  [1, 1],
];

/** Lazy release used by submit zoom pulse. */
const LAZY: Point[] = [
  [0, 0],
  [0.014, 0.009],
  [0.028, 0.032],
  [0.06, 0.131],
  [0.091, 0.265],
  [0.176, 0.675],
  [0.228, 0.88],
  [0.252, 0.953],
  [0.277, 1.014],
  [0.303, 1.062],
  [0.329, 1.094],
  [0.372, 1.121],
  [0.422, 1.121],
  [0.467, 1.102],
  [0.612, 1.019],
  [0.715, 0.989],
  [0.811, 0.985],
  [1, 1],
];

export function easeGlide(t: number): number {
  return lerpTable(GLIDE, t);
}

export function easeIntroGlide(t: number): number {
  return lerpTable(INTRO_GLIDE, t);
}

export function easeLazy(t: number): number {
  return lerpTable(LAZY, t);
}

/** Inverse of GLIDE for dash draw timing. */
export function invEaseGlide(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  for (let i = 1; i < GLIDE.length; i++) {
    const [ax, ay] = GLIDE[i];
    if (t <= ay) {
      const [bx, by] = GLIDE[i - 1];
      return ay === by ? bx : bx + ((ax - bx) * (t - by)) / (ay - by);
    }
  }
  return 1;
}

export function toCssLinear(table: Point[]): string {
  return `linear(${table.map(([x, y]) => `${y} ${(100 * x).toFixed(2)}%`).join(", ")})`;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
