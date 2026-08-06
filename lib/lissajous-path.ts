import { WAITLIST_LISSAJOUS } from '@/lib/waitlist-timeline'

const TAU = 2 * Math.PI
const CFG = WAITLIST_LISSAJOUS

/**
 * One open upper-right arc only (viewBox 0–100).
 * Top → down-right. Not a Lissajous / figure-8.
 */
const FLIGHT_PATH_D = 'M 72 6 C 82 14 90 26 96 40'

type Bounds = { minX: number; maxX: number; minY: number; maxY: number }

export type LissajousSample = { x: number; y: number; t: number }

export type FlightPathResult = {
  samples: LissajousSample[]
  pathD: string
  trailSamples: LissajousSample[]
}

function computeBounds(): Bounds {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i <= CFG.segments; i++) {
    const t = (i / CFG.segments) * TAU
    const x = CFG.radiusX * Math.sin(CFG.freqX * t)
    const y = CFG.radiusY * Math.sin(CFG.freqY * t)
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return { minX, maxX, minY, maxY }
}

const BOUNDS = computeBounds()

function anchorOffset(
  scale: number,
  cx: number,
  cy: number,
  width: number,
  height: number,
  anchor: { fromLeft: number; fromBottom: number },
): [number, number] {
  const targetX = anchor.fromLeft * width
  const targetY = (1 - anchor.fromBottom) * height
  return [
    targetX - (cx + BOUNDS.minX * scale),
    targetY - (cy + BOUNDS.maxY * scale),
  ]
}

function lissajousPoint(
  segmentIndex: number,
  cx: number,
  cy: number,
  amp: number,
  ox: number,
  oy: number,
): [number, number] {
  const t = (segmentIndex / CFG.segments) * TAU
  return [
    cx + CFG.radiusX * Math.sin(CFG.freqX * t + CFG.phase) * amp + ox,
    cy + CFG.radiusY * Math.sin(CFG.freqY * t) * amp + oy,
  ]
}

/** Cubic Bezier point for FLIGHT_PATH_D control points. */
function cubicPoint(t: number): { x: number; y: number } {
  // M 72 6 C 82 14 90 26 96 40
  const p0 = { x: 72, y: 6 }
  const p1 = { x: 82, y: 14 }
  const p2 = { x: 90, y: 26 }
  const p3 = { x: 96, y: 40 }
  const u = 1 - t
  const x =
    u * u * u * p0.x +
    3 * u * u * t * p1.x +
    3 * u * t * t * p2.x +
    t * t * t * p3.x
  const y =
    u * u * u * p0.y +
    3 * u * u * t * p1.y +
    3 * u * t * t * p2.y +
    t * t * t * p3.y
  return { x, y }
}

function buildTrailPins(
  samples: LissajousSample[],
  width: number,
): LissajousSample[] {
  const dashPx = CFG.dash[0] + CFG.dash[1]
  const dashPeriod = Math.max(0.9, (dashPx / width) * 100)
  const trailSamples: LissajousSample[] = []
  let arc = 0
  let lastPinArc = 0
  for (let i = 0; i < samples.length; i++) {
    if (i > 0) {
      arc += Math.hypot(
        samples[i].x - samples[i - 1].x,
        samples[i].y - samples[i - 1].y,
      )
    }
    if (trailSamples.length === 0 || arc - lastPinArc >= dashPeriod) {
      trailSamples.push(samples[i])
      lastPinArc = arc
    }
  }
  if (trailSamples.length > 56) {
    const step = trailSamples.length / 52
    const thinned: LissajousSample[] = []
    for (let i = 0; i < 52; i++) {
      thinned.push(
        trailSamples[Math.min(trailSamples.length - 1, Math.floor(i * step))],
      )
    }
    return thinned
  }
  if (trailSamples.length < 40 && samples.length >= 40) {
    // Ensure ~48 pins for dash rhythm readability
    const out: LissajousSample[] = []
    const n = 48
    for (let i = 0; i < n; i++) {
      const idx = Math.round((i / (n - 1)) * (samples.length - 1))
      out.push(samples[idx])
    }
    return out
  }
  return trailSamples
}

/** Settled curve geometry — matches FieldLoops after expand completes. */
export function getLissajousLayout(width: number, height: number, mobile = false) {
  const scale = mobile ? CFG.mobile.scale : CFG.scale
  const anchor = mobile ? CFG.mobile.anchor : CFG.anchor
  const cx = 0.5 * width
  const cy = 0.5 * height
  const amp = Math.min(width, height) * scale
  const [ox, oy] = anchorOffset(amp, cx, cy, width, height, anchor)
  return { cx, cy, amp, ox, oy, solidOnly: mobile }
}

/**
 * Single open cubic in the upper-right. One line only — no Lissajous / loops.
 */
export function sampleFlightPath(
  width: number,
  _height?: number,
  _options?: { mobile?: boolean; pathCount?: number },
): FlightPathResult {
  const count = 64
  const samples: LissajousSample[] = []
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const { x, y } = cubicPoint(t)
    samples.push({ x, y, t })
  }
  return {
    samples,
    pathD: FLIGHT_PATH_D,
    trailSamples: buildTrailPins(samples, width),
  }
}

/**
 * Sample the visible Lissajous path in 0–100 viewBox space.
 * Default: dashed tail only (the dotted line the user marked).
 */
export function sampleLissajousPath(
  width: number,
  height: number,
  options: {
    mobile?: boolean
    dashedOnly?: boolean
    count?: number
  } = {},
): LissajousSample[] {
  const { mobile = false, dashedOnly = true, count = 96 } = options
  const { cx, cy, amp, ox, oy, solidOnly } = getLissajousLayout(
    width,
    height,
    mobile,
  )

  const solidCap = CFG.segments * CFG.solidFraction
  const endSegment = CFG.segments
  const startSegment = dashedOnly && !solidOnly ? solidCap : 0
  const span = endSegment - startSegment
  const pts: LissajousSample[] = []

  for (let i = 0; i < count; i++) {
    const u = i / (count - 1)
    const seg = startSegment + u * span
    const [x, y] = lissajousPoint(seg, cx, cy, amp, ox, oy)
    pts.push({
      x: (x / width) * 100,
      y: (y / height) * 100,
      t: u,
    })
  }

  return pts
}

export function samplesToSvgPath(samples: LissajousSample[]): string {
  if (samples.length === 0) return ''
  const [first, ...rest] = samples
  let d = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`
  for (const p of rest) {
    d += ` L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
  }
  return d
}
