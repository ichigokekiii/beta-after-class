import Image from 'next/image'

type LogoMarkSize = 'sm' | 'md' | 'lg' | 'xl'

/** Display widths; official asset is 359×258 (Group_136). */
const widths: Record<LogoMarkSize, number> = {
  sm: 40,
  md: 64,
  lg: 112,
  xl: 220,
}

interface LogoMarkProps {
  size?: LogoMarkSize
  className?: string
  priority?: boolean
}

export function LogoMark({ size = 'md', className = '', priority }: LogoMarkProps) {
  const width = widths[size]
  const height = Math.round(width * (258 / 359))

  return (
    <Image
      src="/logo-mark.png"
      alt="After Class"
      width={width}
      height={height}
      className={className}
      priority={priority ?? (size === 'lg' || size === 'xl')}
    />
  )
}
