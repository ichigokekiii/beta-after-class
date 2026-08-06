'use client'

import { useWaitlistReveal } from '@/lib/use-waitlist-reveal'

/**
 * Origin hairlines: intersection sits at the brand row’s top-left
 * so the vertical line runs along the left edge of the mark/words
 * and the horizontal line runs across the top of the brand row.
 */
export function WaitlistCrosshair() {
  const revealed = useWaitlistReveal('crosshair')

  return (
    <div
      aria-hidden="true"
      className={[
        'pointer-events-none absolute top-0 left-0 z-0 h-0 w-0 transition-opacity duration-[400ms] ease-out',
        revealed ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
    >
      <span className="absolute top-[-50vh] left-0 h-[200vh] w-px bg-white/[0.1]" />
      <span className="absolute top-0 left-[-50vw] h-px w-[200vw] bg-white/[0.1]" />
    </div>
  )
}
