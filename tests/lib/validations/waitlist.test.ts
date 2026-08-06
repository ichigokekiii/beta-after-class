import { describe, it, expect } from 'vitest'
import { waitlistSchema } from '@/lib/validations/waitlist'

describe('waitlistSchema', () => {
  it('accepts valid email', () => {
    const result = waitlistSchema.safeParse({
      email: 'student@university.edu',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = waitlistSchema.safeParse({
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty email', () => {
    const result = waitlistSchema.safeParse({
      email: '',
    })
    expect(result.success).toBe(false)
  })
})
