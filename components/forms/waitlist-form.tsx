'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import {
  submitWaitlist,
  type WaitlistActionState,
} from '@/app/actions/waitlist'
import { siteContent } from '@/lib/content'
import { dispatchWaitlistSuccess } from '@/lib/waitlist-timeline'

const initialState: WaitlistActionState = { ok: false, message: '' }

export function WaitlistForm() {
  const [state, action, pending] = useActionState(submitWaitlist, initialState)
  const [email, setEmail] = useState('')
  const firedSuccess = useRef(false)
  const hasValue = email.trim().length > 0
  const succeeded = state.ok
  const error = !state.ok && state.message ? state.message : undefined

  useEffect(() => {
    if (state.ok && !firedSuccess.current) {
      firedSuccess.current = true
      dispatchWaitlistSuccess()
    }
  }, [state.ok])

  return (
    <form
      action={action}
      className="relative mt-2 w-full max-w-[38ch] text-left"
    >
      <div className="relative mb-[0.333rem]">
        <label
          htmlFor="email"
          className={[
            'font-open-sauce block text-base font-normal leading-[1.5] text-[var(--color-cream)] transition-[opacity,transform] duration-200 ease-out',
            succeeded
              ? 'pointer-events-none translate-y-0.5 opacity-0 delay-0'
              : 'translate-y-0 opacity-100 delay-200',
          ].join(' ')}
        >
          {siteContent.waitlist.title}
        </label>
      </div>

      <div className="relative h-12 overflow-hidden">
        <div
          className={[
            'absolute inset-0 transition-[opacity,transform] duration-200 ease-out',
            succeeded
              ? 'pointer-events-none translate-y-0.5 opacity-0'
              : 'translate-y-0 opacity-100',
          ].join(' ')}
        >
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={siteContent.waitlist.emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={pending || succeeded}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'waitlist-error' : undefined}
            className="font-open-sauce h-12 w-full rounded-md border-none bg-white py-[0.56em] pr-14 pb-[0.58em] pl-5 text-left text-[16px] leading-normal text-neutral-900 caret-neutral-900 outline-none placeholder:text-base placeholder:text-neutral-500 disabled:opacity-80"
          />
          <button
            type="submit"
            aria-label={siteContent.waitlist.submit}
            disabled={!hasValue || pending || succeeded}
            className={[
              'absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-sm transition-[opacity,background-color] duration-200 ease-out',
              hasValue && !pending
                ? 'cursor-pointer bg-[#14120b] opacity-100'
                : 'pointer-events-none bg-transparent opacity-40',
            ].join(' ')}
          >
            {pending ? (
              <span className="font-open-sauce text-xs font-bold text-neutral-900">
                …
              </span>
            ) : (
              <svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className={[
                  'size-4',
                  hasValue && !pending
                    ? 'text-[#edecec]'
                    : 'text-[#14120b]',
                ].join(' ')}
              >
                <path
                  d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>

        <div
          className={[
            'absolute inset-0 flex items-center justify-center rounded-md bg-[#14120b] px-6 transition-[opacity,transform] duration-200 ease-out',
            succeeded
              ? 'pointer-events-auto translate-y-0 opacity-100 delay-[60ms]'
              : 'pointer-events-none translate-y-0.5 opacity-0',
          ].join(' ')}
          role="status"
          aria-live="polite"
        >
          <p className="font-open-sauce m-0 flex w-full flex-row-reverse items-center justify-between gap-4 text-base leading-normal text-[#edecec] text-balance">
            <span aria-hidden="true" className="select-none pl-2">
              ✓
            </span>
            <span>{state.message || siteContent.waitlist.success}</span>
          </p>
        </div>
      </div>

      {error ? (
        <p
          id="waitlist-error"
          role="alert"
          className="font-open-sauce mt-2 text-sm text-[var(--color-primary-salmon)]"
        >
          {error}
        </p>
      ) : null}
    </form>
  )
}
