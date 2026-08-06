import localFont from 'next/font/local'

export const snPro = localFont({
  src: [
    {
      path: '../public/fonts/sn-pro/SNPro-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/sn-pro/SNPro-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/sn-pro/SNPro-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sn-pro',
  display: 'swap',
})

export const openSauceTwo = localFont({
  src: [
    {
      path: '../public/fonts/open-sauce-two/OpenSauceTwo-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/open-sauce-two/OpenSauceTwo-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-open-sauce-two',
  display: 'swap',
})
