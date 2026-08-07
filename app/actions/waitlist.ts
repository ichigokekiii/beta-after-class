'use server'

import { waitlistSchema } from '@/lib/validations/waitlist'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { siteContent } from '@/lib/content'
import {
  consumeWaitlistRateLimit,
  getClientIp,
} from '@/lib/rate-limit'

export type WaitlistActionState = { ok: boolean; message: string }

export async function submitWaitlist(
  _prev: WaitlistActionState,
  formData: FormData
): Promise<WaitlistActionState> {
  const parsed = waitlistSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid input',
    }
  }

  try {
    const supabase = createSupabaseServerClient()
    const ip = await getClientIp()
    const rate = await consumeWaitlistRateLimit(supabase, ip)

    if (!rate.ok) {
      if (rate.reason === 'limited') {
        return { ok: false, message: siteContent.waitlist.rateLimited }
      }
      return { ok: false, message: 'Something went wrong. Try again.' }
    }

    const { error } = await supabase.from('waitlist_signups').insert({
      email: parsed.data.email.toLowerCase().trim(),
    })

    if (error?.code === '23505') {
      return { ok: true, message: siteContent.waitlist.duplicate }
    }
    if (error) {
      return { ok: false, message: 'Something went wrong. Try again.' }
    }

    return { ok: true, message: siteContent.waitlist.success }
  } catch {
    return {
      ok: false,
      message: 'Waitlist is not configured yet. Try again soon.',
    }
  }
}
