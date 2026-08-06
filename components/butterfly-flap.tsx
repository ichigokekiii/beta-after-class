'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'

interface ButterflyFlapProps {
  src?: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

const WING_OPEN = 0
const WING_CLOSED = 22

/**
 * Natural butterfly beat: hold → quick close → slow open.
 * Motion keyframes on rotateY; counter-rotate cancels path orientation.
 */
export function ButterflyFlap({
  src = '/butterfly-flight.png',
  width = 96,
  height = 96,
  className = '',
  priority = false,
}: ButterflyFlapProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={`relative mix-blend-lighten ${className}`}
      style={{
        width: `min(24vw, ${width}px)`,
        aspectRatio: `${width} / ${height}`,
        perspective: '640px',
      }}
      aria-hidden="true"
    >
      <motion.div
        className="relative h-full w-full"
        animate={reduceMotion ? { y: 0 } : { y: [0, 0, 1.5, 0, 0] }}
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 1.2,
                times: [0, 0.2, 0.38, 0.55, 1],
                repeat: Infinity,
                ease: [0.32, 0.72, 0, 1],
              }
        }
      >
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: 'inset(0 50% 0 0)',
            transformOrigin: '100% 46%',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
          animate={
            reduceMotion
              ? { rotateY: WING_OPEN }
              : { rotateY: [WING_OPEN, WING_OPEN, -WING_CLOSED, -16, WING_OPEN] }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 1.2,
                  times: [0, 0.2, 0.35, 0.48, 1],
                  repeat: Infinity,
                  ease: [0.32, 0.72, 0, 1],
                }
          }
        >
          <Image
            src={src}
            alt=""
            width={width}
            height={height}
            className="h-full w-full object-contain"
            priority={priority}
            unoptimized
          />
        </motion.div>

        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: 'inset(0 0 0 50%)',
            transformOrigin: '0% 46%',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
          animate={
            reduceMotion
              ? { rotateY: WING_OPEN }
              : { rotateY: [WING_OPEN, WING_OPEN, WING_CLOSED, 16, WING_OPEN] }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 1.2,
                  times: [0, 0.2, 0.35, 0.48, 1],
                  repeat: Infinity,
                  ease: [0.32, 0.72, 0, 1],
                }
          }
        >
          <Image
            src={src}
            alt=""
            width={width}
            height={height}
            className="h-full w-full object-contain"
            priority={priority}
            unoptimized
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
