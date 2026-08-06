'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'motion/react'
import { ButterflyFlap } from '@/components/butterfly-flap'
import { sampleFlightPath } from '@/lib/lissajous-path'

const PASS_DURATION = 36
/** Pause long enough for last-activated dots to finish 7s ghost fade. */
const TRAIL_FADE_MS = 7000
const REPEAT_DELAY = TRAIL_FADE_MS / 1000
const TRAIL_PEAK_OPACITY = 0.6
const TRAIL_DOT_CLASS =
  'absolute h-[2px] w-[2px] rounded-full bg-[oklch(0.98_0.03_95/0.6)]'

/**
 * Butterfly flies Origin upper-right open dashed arc; cream trail ghosts out at end.
 */
export function WaitlistButterflyFlight() {
  const reduceMotion = useReducedMotion()
  const pathRef = useRef<SVGPathElement>(null)
  const flyerRef = useRef<HTMLDivElement>(null)
  const orientRef = useRef<HTMLDivElement>(null)
  const flapRootRef = useRef<HTMLDivElement>(null)
  const pinsRef = useRef<(HTMLSpanElement | null)[]>([])
  const activatedAtRef = useRef<(number | null)[]>([])
  const trailRafRef = useRef(0)
  const pathDRef = useRef('')
  const [pathD, setPathD] = useState('')
  const [dotCount, setDotCount] = useState(0)

  useEffect(() => {
    const updatePath = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const mobile = w < 768
      const { pathD: nextD, trailSamples } = sampleFlightPath(w, h, { mobile })
      if (nextD === pathDRef.current) return
      pathDRef.current = nextD
      setPathD(nextD)
      setDotCount(trailSamples.length)
      activatedAtRef.current = Array.from(
        { length: trailSamples.length },
        () => null,
      )
    }

    updatePath()
    window.addEventListener('resize', updatePath)
    return () => window.removeEventListener('resize', updatePath)
  }, [])

  useEffect(() => {
    const path = pathRef.current
    const flyer = flyerRef.current
    const orient = orientRef.current
    const flapRoot = flapRootRef.current
    if (!path || !flyer || !orient || !flapRoot || !pathD || dotCount === 0) return

    const w = window.innerWidth
    const h = window.innerHeight
    const mobile = w < 768
    const { trailSamples } = sampleFlightPath(w, h, { mobile })

    const length = path.getTotalLength()
    if (length <= 0) return

    activatedAtRef.current = Array.from({ length: dotCount }, () => null)

    trailSamples.forEach((s, i) => {
      const el = pinsRef.current[i]
      if (!el) return
      el.style.left = `${s.x}%`
      el.style.top = `${s.y}%`
      el.style.opacity = '0'
      el.style.transform = 'translate(-50%, -50%)'
    })

    const start = path.getPointAtLength(0)
    const look0 = path.getPointAtLength(Math.min(length, 2))
    const angle0 =
      (Math.atan2(look0.y - start.y, look0.x - start.x) * 180) / Math.PI + 90
    flyer.style.left = `${start.x}%`
    flyer.style.top = `${start.y}%`
    flyer.style.opacity = '1'
    flyer.style.transform = 'translate(-50%, -50%)'
    orient.style.transform = `rotate(${angle0}deg)`
    flapRoot.style.transform = `rotate(${-angle0}deg)`
    activatedAtRef.current[0] = performance.now()
    if (pinsRef.current[0]) {
      pinsRef.current[0].style.opacity = String(TRAIL_PEAK_OPACITY)
    }

    const trailFullyClear = (now: number) => {
      for (let i = 0; i < trailSamples.length; i++) {
        const activatedAt = activatedAtRef.current[i]
        if (activatedAt == null) continue
        if (now - activatedAt < TRAIL_FADE_MS) return false
      }
      return true
    }

    const paintTrail = (now: number) => {
      for (let i = 0; i < trailSamples.length; i++) {
        const el = pinsRef.current[i]
        if (!el) continue
        const activatedAt = activatedAtRef.current[i]
        if (activatedAt == null) {
          el.style.opacity = '0'
          continue
        }
        const age = now - activatedAt
        const opacity = Math.max(0, 1 - age / TRAIL_FADE_MS) * TRAIL_PEAK_OPACITY
        el.style.opacity = String(opacity)
      }
    }

    const place = (t: number) => {
      const dist = Math.min(length, Math.max(0, t * length))
      const p = path.getPointAtLength(dist)
      const look = path.getPointAtLength(Math.min(length, dist + 1.5))
      const angle =
        (Math.atan2(look.y - p.y, look.x - p.x) * 180) / Math.PI + 90
      const opacity = t > 0.94 ? Math.max(0, (1 - t) / 0.06) : 1

      flyer.style.left = `${p.x}%`
      flyer.style.top = `${p.y}%`
      flyer.style.opacity = String(opacity)
      flyer.style.transform = 'translate(-50%, -50%)'
      orient.style.transform = `rotate(${angle}deg)`
      flapRoot.style.transform = `rotate(${-angle}deg)`

      const now = performance.now()
      for (let i = 0; i < trailSamples.length; i++) {
        if (trailSamples[i].t <= t && activatedAtRef.current[i] == null) {
          activatedAtRef.current[i] = now
        }
      }
      paintTrail(now)
    }

    if (reduceMotion) {
      place(0.2)
      return
    }

    let trailActive = true
    const trailTick = () => {
      if (!trailActive) return
      paintTrail(performance.now())
      trailRafRef.current = requestAnimationFrame(trailTick)
    }
    trailRafRef.current = requestAnimationFrame(trailTick)

    const controls = animate(0, 1, {
      duration: PASS_DURATION,
      ease: 'linear',
      repeat: Infinity,
      repeatDelay: REPEAT_DELAY,
      onUpdate: place,
      onRepeat: () => {
        // Only reset after ghost fade has finished — never hard-wipe mid-fade.
        const now = performance.now()
        if (!trailFullyClear(now)) {
          paintTrail(now)
        }
        activatedAtRef.current = Array.from({ length: dotCount }, () => null)
        for (const el of pinsRef.current) {
          if (el) el.style.opacity = '0'
        }
      },
    })

    return () => {
      trailActive = false
      cancelAnimationFrame(trailRafRef.current)
      controls.stop()
    }
  }, [reduceMotion, pathD, dotCount])

  const startPos = pathD
    ? (() => {
        const m = pathD.match(/^M\s+([\d.]+)\s+([\d.]+)/)
        return m ? { x: m[1], y: m[2] } : { x: '70', y: '12' }
      })()
    : { x: '70', y: '12' }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {pathD ? (
          <path ref={pathRef} d={pathD} fill="none" stroke="none" />
        ) : (
          <path ref={pathRef} d="M 70 12" fill="none" stroke="none" />
        )}
      </svg>

      {Array.from({ length: dotCount }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            pinsRef.current[i] = el
          }}
          className={`${TRAIL_DOT_CLASS} opacity-0`}
        />
      ))}

      <div
        ref={flyerRef}
        className="absolute"
        style={{
          left: `${startPos.x}%`,
          top: `${startPos.y}%`,
          transform: 'translate(-50%, -50%)',
          opacity: 1,
        }}
      >
        <div
          ref={orientRef}
          className="drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        >
          <div ref={flapRootRef}>
            <ButterflyFlap
              src="/butterfly-flight.png"
              width={112}
              height={80}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
