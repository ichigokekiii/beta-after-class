import { z } from 'zod'

/** Philippine school emails: domain is `edu.ph` or ends with `.edu.ph`. */
export function isEduPhEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  const at = normalized.lastIndexOf('@')
  if (at <= 0 || at === normalized.length - 1) return false

  const domain = normalized.slice(at + 1)
  if (!domain || domain.includes('..') || domain.startsWith('.') || domain.endsWith('.')) {
    return false
  }

  return domain === 'edu.ph' || domain.endsWith('.edu.ph')
}

export const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .refine(isEduPhEmail, {
      message: 'Use your .edu.ph school email',
    }),
})

export type WaitlistInput = z.infer<typeof waitlistSchema>
