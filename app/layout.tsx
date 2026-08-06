import type { Metadata } from 'next'
import { snPro, openSauceTwo } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://join.afterclassapp.com'
  ),
  title: {
    default: 'Join the waitlist · After Class',
    template: '%s · After Class',
  },
  description:
    'Every other app gets you a match. After Class gets you a date. Join the waitlist for verified student dating near campus.',
  openGraph: {
    title: 'Join the waitlist · After Class',
    description:
      'Every other app gets you a match. After Class gets you a date.',
    siteName: 'After Class',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${snPro.variable} ${openSauceTwo.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  )
}
