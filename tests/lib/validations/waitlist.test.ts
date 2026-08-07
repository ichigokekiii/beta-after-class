import { describe, it, expect } from 'vitest'
import { isEduPhEmail, waitlistSchema } from '@/lib/validations/waitlist'

describe('isEduPhEmail', () => {
  it('accepts .edu.ph domains and subdomains', () => {
    expect(isEduPhEmail('student@up.edu.ph')).toBe(true)
    expect(isEduPhEmail('a.b@student.dlsu.edu.ph')).toBe(true)
    expect(isEduPhEmail('dean@edu.ph')).toBe(true)
  })

  it('rejects non .edu.ph domains', () => {
    expect(isEduPhEmail('student@university.edu')).toBe(false)
    expect(isEduPhEmail('student@gmail.com')).toBe(false)
    expect(isEduPhEmail('student@school.edu.ph.com')).toBe(false)
    expect(isEduPhEmail('student@notedu.ph')).toBe(false)
  })
})

describe('waitlistSchema', () => {
  it('accepts a valid .edu.ph email', () => {
    const result = waitlistSchema.safeParse({
      email: 'student@up.edu.ph',
    })
    expect(result.success).toBe(true)
  })

  it('rejects gmail and .edu (non-PH) addresses', () => {
    expect(
      waitlistSchema.safeParse({ email: 'student@gmail.com' }).success
    ).toBe(false)
    expect(
      waitlistSchema.safeParse({ email: 'student@university.edu' }).success
    ).toBe(false)
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

  it('returns a clear .edu.ph error message', () => {
    const result = waitlistSchema.safeParse({
      email: 'student@gmail.com',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        'Use your .edu.ph school email'
      )
    }
  })
})
