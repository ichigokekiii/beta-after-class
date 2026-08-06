'use client'

import type { ReactNode } from 'react'
import { useWaitlistReveal } from '@/lib/use-waitlist-reveal'

interface WaitlistRevealProps {
  children: ReactNode
  className?: string
}

/** Origin content reveal: opacity after 800ms. */
export function WaitlistReveal({ children, className = '' }: WaitlistRevealProps) {
  const revealed = useWaitlistReveal('content')

  return (
    <div
      className={[
        'relative z-10',
        className,
        'transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        revealed
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0',
      ].join(' ')}
    >
      {children}
    </div>
  )
}
