type WaitlistFields = {
  email: unknown;
  website: unknown;
};

const MAX_BODY_BYTES = 2_048;

export function parseWaitlistBody(value: unknown): WaitlistFields | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  return {
    email: record.email,
    website: record.website,
  };
}

export function isBodyTooLarge(request: Request): boolean {
  const raw = request.headers.get("content-length");
  if (!raw) return false;
  const size = Number(raw);
  return Number.isFinite(size) && size > MAX_BODY_BYTES;
}

const hitsByIp = new Map<string, number[]>();

export function allowWaitlistAttempt(ip: string, limit = 8, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hitsByIp.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hitsByIp.set(ip, recent);
    return false;
  }
  recent.push(now);
  hitsByIp.set(ip, recent);
  return true;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "local";
}
