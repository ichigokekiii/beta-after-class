'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import {
  WAITLIST_REVEAL_MS,
  type WaitlistRevealKey,
} from '@/lib/waitlist-timeline'

export function useWaitlistReveal(key: WaitlistRevealKey): boolean {
  const reduceMotion = useReducedMotion()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (reduceMotion) {
      setRevealed(true)
      return
    }
    const id = window.setTimeout(
      () => setRevealed(true),
      WAITLIST_REVEAL_MS[key],
    )
    return () => window.clearTimeout(id)
  }, [key, reduceMotion])

  return revealed
}
