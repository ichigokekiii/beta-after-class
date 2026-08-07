import { describe, it, expect } from 'vitest'
import { extractClientIp, hashRateLimitKey } from '@/lib/rate-limit'

function headerMap(entries: Record<string, string | null>) {
  return {
    get(name: string) {
      return entries[name.toLowerCase()] ?? null
    },
  }
}

describe('extractClientIp', () => {
  it('uses the first x-forwarded-for hop', () => {
    const ip = extractClientIp(
      headerMap({
        'x-forwarded-for': '203.0.113.10, 10.0.0.1',
      })
    )
    expect(ip).toBe('203.0.113.10')
  })

  it('falls back to x-real-ip', () => {
    const ip = extractClientIp(
      headerMap({
        'x-real-ip': '198.51.100.20',
      })
    )
    expect(ip).toBe('198.51.100.20')
  })

  it('falls back to unknown', () => {
    expect(extractClientIp(headerMap({}))).toBe('unknown')
  })
})

describe('hashRateLimitKey', () => {
  it('returns a stable sha256 hex digest', () => {
    const a = hashRateLimitKey('203.0.113.10')
    const b = hashRateLimitKey('203.0.113.10')
    expect(a).toBe(b)
    expect(a).toMatch(/^[a-f0-9]{64}$/)
  })

  it('differs by input', () => {
    expect(hashRateLimitKey('a')).not.toBe(hashRateLimitKey('b'))
  })
})
