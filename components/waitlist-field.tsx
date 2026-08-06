'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useWaitlistReveal } from '@/lib/use-waitlist-reveal'
import {
  WAITLIST_SUCCESS_EVENT,
  WAITLIST_SUCCESS_PULSE_MS,
} from '@/lib/waitlist-timeline'

/**
 * Origin-like soft atmospheric field, After Class maroon dusk + warm glow.
 * No Cursor textures / WebGL.
 */
export function WaitlistField() {
  const reduceMotion = useReducedMotion()
  const fieldRevealed = useWaitlistReveal('background')
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (reduceMotion) return
    const onSuccess = () => {
      setPulse(true)
      window.setTimeout(() => setPulse(false), WAITLIST_SUCCESS_PULSE_MS)
    }
    window.addEventListener(WAITLIST_SUCCESS_EVENT, onSuccess)
    return () => window.removeEventListener(WAITLIST_SUCCESS_EVENT, onSuccess)
  }, [reduceMotion])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Deep dusk base */}
      <div className="absolute inset-0 bg-[#2a0c16]" />

      <motion.div
        className="absolute inset-0 origin-[70%_80%]"
        initial={false}
        animate={{
          opacity: fieldRevealed ? 1 : 0,
          scale: pulse ? 1.02 : 1,
        }}
        transition={{
          opacity: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          scale: {
            duration: pulse ? WAITLIST_SUCCESS_PULSE_MS / 1000 : 0.5,
            ease: [0.16, 1, 0.3, 1],
          },
        }}
      >
        {/* Soft sky / haze (top) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 55% 0%, #5a2438 0%, #3a1220 45%, #2a0c16 75%)',
          }}
        />

        {/* Horizon bloom — Origin peach glow → After Class salmon/cream */}
        <div
          className="absolute inset-x-[-20%] bottom-[-25%] h-[70%]"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 70%, #f39394 0%, #b07386 28%, #4a1525 58%, transparent 75%)',
            filter: 'blur(48px)',
            opacity: 0.85,
          }}
        />

        {/* Secondary warm spill left */}
        <div
          className="absolute bottom-[-10%] left-[-15%] h-[50%] w-[60%]"
          style={{
            background:
              'radial-gradient(ellipse at 40% 60%, rgba(254, 249, 230, 0.35) 0%, rgba(243, 147, 148, 0.25) 35%, transparent 70%)',
            filter: 'blur(56px)',
          }}
        />

        {/* Soft film lift */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(254,249,230,0.06) 0%, transparent 35%, rgba(74,21,37,0.2) 100%)',
          }}
        />
      </motion.div>

      {/* Soft vignette — keep center readable, not crushed */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 40% 40%, transparent 0%, rgba(20, 6, 10, 0.45) 100%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
        }}
      />
    </div>
  )
}
