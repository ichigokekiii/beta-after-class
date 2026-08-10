import { createHmac } from "node:crypto";
import { getSupabase } from "@/lib/supabase";

const RATE_LIMIT = 5;
const WINDOW_SECONDS = 900; // 15 minutes

export function hashClientIp(ip: string): string {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET;
  if (!secret) {
    throw new Error("Missing RATE_LIMIT_HMAC_SECRET");
  }
  return createHmac("sha256", secret).update(ip).digest("hex");
}

/**
 * Durable rate limit via Postgres RPC. Returns false when the IP is over limit.
 * Falls back to denying the request if the RPC fails (fail closed).
 */
export async function consumeWaitlistRateLimit(ip: string): Promise<boolean> {
  const ipHash = hashClientIp(ip);
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc("consume_waitlist_rate_limit", {
    p_ip_hash: ipHash,
    p_limit: RATE_LIMIT,
    p_window_seconds: WINDOW_SECONDS,
  });

  if (error) {
    console.error("waitlist rate limit rpc failed", {
      code: error.code,
      message: error.message,
    });
    return false;
  }

  return data === true;
}
