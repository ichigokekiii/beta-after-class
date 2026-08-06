import type { Metadata } from 'next'
import Link from 'next/link'
import { LogoMark } from '@/components/logo-mark'
import { WaitlistForm } from '@/components/forms/waitlist-form'
import { WaitlistCrosshair } from '@/components/waitlist-crosshair'
import { WaitlistButterflyFlight } from '@/components/waitlist-butterfly-flight'
import { WaitlistField } from '@/components/waitlist-field'
import { WaitlistReveal } from '@/components/waitlist-reveal'
import { siteContent } from '@/lib/content'
import { getMarketingUrl } from '@/lib/utils/get-site-url'

export const metadata: Metadata = {
  title: 'Join the waitlist',
  description: siteContent.subline,
}

export default function WaitlistPage() {
  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden text-[var(--color-cream)]">
      <WaitlistField />
      <WaitlistButterflyFlight />

      <div className="relative z-10 grid min-h-[100dvh] w-full grid-cols-2 grid-rows-[auto_1fr] gap-4 px-6 py-6 md:grid-cols-4 md:gap-6 lg:grid-rows-[1fr_auto_1fr]">
        <div className="relative col-span-2 flex w-full flex-col items-start self-start lg:col-span-2 lg:col-start-2 lg:row-start-2 lg:self-center">
          <WaitlistCrosshair />

          <WaitlistReveal className="flex w-full flex-col items-start gap-4 pt-6 pl-6 md:pt-8 md:pl-8">
            <div className="flex w-full flex-col items-start gap-4 text-left">
              <Link
                href={getMarketingUrl()}
                className="mb-1 inline-flex h-10 items-stretch gap-1.5 text-[var(--color-cream)] transition-opacity duration-200 ease-out hover:opacity-70"
                aria-label={`${siteContent.brand} home`}
              >
                <LogoMark
                  size="sm"
                  priority
                  className="h-full w-auto shrink-0 self-center"
                />
                <span className="font-open-sauce flex items-center text-[1.5rem] font-bold leading-none tracking-tight">
                  {siteContent.brand}
                </span>
              </Link>

              <h1 className="font-sn-pro m-0 max-w-[22ch] text-[clamp(2rem,4.2vw,3.25rem)] font-normal leading-none tracking-[-0.025em] text-[var(--color-cream)] text-balance xl:text-[52px] xl:leading-[52px] xl:tracking-[-1.3px]">
                {siteContent.tagline}
              </h1>

              <p className="font-open-sauce m-0 max-w-[38ch] text-base leading-[1.5] text-[var(--color-cream)]">
                Every other app gets you a match.
                <br />
                After Class gets you a date.
              </p>

              <WaitlistForm />
            </div>
          </WaitlistReveal>
        </div>
      </div>
    </section>
  )
}
