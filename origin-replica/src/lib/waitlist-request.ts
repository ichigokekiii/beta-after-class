type WaitlistFields = {
  email: unknown;
  website: unknown;
  turnstileToken: unknown;
};

/** Enough room for email + Turnstile token (tokens are often ~1–2KB). */
const MAX_BODY_BYTES = 8_192;

export function parseWaitlistBody(value: unknown): WaitlistFields | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  return {
    email: record.email,
    website: record.website,
    turnstileToken: record.turnstileToken,
  };
}

export function isBodyTooLarge(request: Request): boolean {
  const raw = request.headers.get("content-length");
  if (!raw) return false;
  const size = Number(raw);
  return Number.isFinite(size) && size > MAX_BODY_BYTES;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "local";
}
