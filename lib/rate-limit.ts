import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

/** Max waitlist attempts per client IP per window. */
export const WAITLIST_RATE_LIMIT_MAX = 5

/** Window length in seconds (15 minutes). */
export const WAITLIST_RATE_LIMIT_WINDOW_SECONDS = 15 * 60

export function hashRateLimitKey(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function extractClientIp(headerStore: {
  get(name: string): string | null
}): string {
  const forwarded = headerStore.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }

  return (
    headerStore.get('x-real-ip')?.trim() ||
    headerStore.get('cf-connecting-ip')?.trim() ||
    'unknown'
  )
}

export async function getClientIp(): Promise<string> {
  return extractClientIp(await headers())
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: 'limited' | 'error' }

export async function consumeWaitlistRateLimit(
  supabase: SupabaseClient,
  ip: string
): Promise<RateLimitResult> {
  const key = hashRateLimitKey(ip)
  const { data, error } = await supabase.rpc('consume_waitlist_rate_limit', {
    p_key: key,
    p_max_hits: WAITLIST_RATE_LIMIT_MAX,
    p_window_seconds: WAITLIST_RATE_LIMIT_WINDOW_SECONDS,
  })

  if (error) {
    return { ok: false, reason: 'error' }
  }

  if (data === false) {
    return { ok: false, reason: 'limited' }
  }

  return { ok: true }
}
