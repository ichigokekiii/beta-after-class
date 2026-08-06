export function getMarketingUrl(): string {
  return process.env.NEXT_PUBLIC_MARKETING_URL ?? 'https://afterclassapp.com'
}
